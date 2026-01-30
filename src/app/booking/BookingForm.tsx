
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';
import Image from 'next/image';
import { differenceInDays, format, parse } from 'date-fns';
import { signInAnonymously } from 'firebase/auth';
import type { Hotel, Room, Booking, Promotion } from '@/lib/types';
import { useFirestore, useAuth, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, getDoc, runTransaction, increment, Timestamp } from 'firebase/firestore';

import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Calendar, Users, BedDouble, ArrowLeft, Tag, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { BookingFormSkeleton } from './BookingFormSkeleton';


declare global {
  interface Window {
    Razorpay: any;
  }
}

export function BookingForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, userProfile, isLoading: isUserLoading } = useUser();
    const auth = useAuth();
    const { toast } = useToast();
    const firestore = useFirestore();

    const hotelId = searchParams.get('hotelId');
    const roomId = searchParams.get('roomId');
    const checkInStr = searchParams.get('checkIn');
    const checkOutStr = searchParams.get('checkOut');
    const guests = searchParams.get('guests') || '1';
    
    const hotelRef = useMemoFirebase(() => {
        if (!firestore || !hotelId) return null;
        return doc(firestore, 'hotels', hotelId);
    }, [firestore, hotelId]);

    const { data: hotel, isLoading: isHotelLoading } = useDoc<Hotel>(hotelRef);
    
    const roomsQuery = useMemoFirebase(() => {
        if (!firestore || !hotelId) return null;
        return collection(firestore, 'hotels', hotelId, 'rooms');
    }, [firestore, hotelId]);
    
    const { data: rooms, isLoading: areRoomsLoading } = useCollection<Room>(roomsQuery);

    const room = useMemo(() => {
        if (areRoomsLoading || !rooms) return null;
        return rooms.find(r => r.id === roomId);
    }, [areRoomsLoading, rooms, roomId]);

    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '' });
    const [isBooking, setIsBooking] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState('');

    useEffect(() => {
        if (userProfile) {
            setCustomerDetails({ name: userProfile.displayName, email: userProfile.email });
        }
    }, [userProfile]);
    
    if (isUserLoading || isHotelLoading || areRoomsLoading) {
        return <BookingFormSkeleton />;
    }
    
    if (!hotelId || !roomId || !checkInStr || !checkOutStr || !hotel || !room) {
        return notFound();
    }
    
    const checkIn = parse(checkInStr, 'yyyy-MM-dd', new Date());
    const checkOut = parse(checkOutStr, 'yyyy-MM-dd', new Date());
    const nights = differenceInDays(checkOut, checkIn);

    if (nights <= 0) {
        return notFound();
    }

    const hotelImage = hotel.images[0]?.startsWith('http')
        ? hotel.images[0]
        : PlaceHolderImages.find((img) => img.id === hotel.images[0])?.imageUrl;
    
    const hotelDiscountPercent = hotel.discount || 0;
    const originalRoomPrice = room.price;
    const discountedRoomPrice = originalRoomPrice * (1 - hotelDiscountPercent / 100);
    
    const originalBasePrice = originalRoomPrice * nights;
    const basePriceAfterHotelDiscount = discountedRoomPrice * nights;
    const totalPrice = Math.max(0, basePriceAfterHotelDiscount - couponDiscount);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Database not available' });
            return;
        }

        const couponRef = doc(firestore, 'promotions', couponCode.toUpperCase());
        const couponSnap = await getDoc(couponRef);

        if (couponSnap.exists() && couponSnap.data().isActive) {
            const promotion = couponSnap.data() as Promotion;
            let discountAmount = 0;

            if (promotion.discountType === 'percentage') {
                discountAmount = basePriceAfterHotelDiscount * (promotion.discountValue / 100);
                setCouponMessage(`🎉 Coupon "${promotion.code}" applied! You saved ${promotion.discountValue}%.`);
            } else { // fixed
                discountAmount = promotion.discountValue;
                 setCouponMessage(`🎉 Coupon "${promotion.code}" applied! You saved a flat amount.`);
            }
            setCouponDiscount(discountAmount);
            toast({
                title: 'Coupon Applied!',
                description: `You saved ${discountAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}.`,
            });
        } else {
            setCouponDiscount(0);
            setCouponMessage('Invalid or expired coupon code.');
            toast({
                variant: 'destructive',
                title: 'Invalid Coupon',
                description: 'The coupon code you entered is not valid or has expired.',
            });
        }
    };

    const handlePayment = async () => {
        if (!firestore) {
             toast({ variant: 'destructive', title: 'Database not available' });
             return;
        }
        if (!customerDetails.name || !customerDetails.email) {
            toast({ variant: 'destructive', title: 'Missing Details', description: 'Please provide your name and email.' });
            return;
        }
        
        setIsBooking(true);

        if (typeof window.Razorpay === 'undefined') {
            toast({ variant: "destructive", title: "Payment Gateway Error", description: "Could not connect to the payment service. Please refresh." });
            setIsBooking(false);
            return;
        }
        
        let currentAuthUser = user;
        if (!currentAuthUser) {
            if (!auth) {
                 toast({ variant: 'destructive', title: 'Authentication service not available' });
                 setIsBooking(false);
                 return;
            }
            try {
                const userCredential = await signInAnonymously(auth);
                currentAuthUser = userCredential.user;
            } catch (error) {
                console.error("Anonymous sign-in failed:", error);
                toast({ variant: 'destructive', title: 'Guest Checkout Failed', description: 'Could not proceed. Please try again.' });
                setIsBooking(false);
                return;
            }
        }
        
        const userIdForBooking = currentAuthUser.uid;
        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!keyId) {
            toast({ variant: "destructive", title: "Payment Gateway Error", description: "Razorpay Key ID is not configured." });
            setIsBooking(false);
            return;
        }
        
        const amountInPaise = Math.round(totalPrice * 100);
        const options = {
            key: keyId,
            amount: amountInPaise,
            currency: "INR",
            name: "Uttarakhand Getaways",
            description: `Booking for ${hotel.name}`,
            handler: async (response: any) => {
                try {
                    const bookingId = `booking_${Date.now()}_${userIdForBooking.substring(0, 5)}`;
                    const bookingRef = doc(firestore, 'users', userIdForBooking, 'bookings', bookingId);
                    const roomRef = doc(firestore, 'hotels', hotelId, 'rooms', roomId);

                    await runTransaction(firestore, async (transaction) => {
                        const roomDoc = await transaction.get(roomRef);
                        if (!roomDoc.exists()) {
                            throw new Error("Room details not found.");
                        }
                        
                        const currentAvailable = roomDoc.data().availableRooms ?? 0;
                        if (currentAvailable <= 0) {
                            throw new Error("Sorry, this room just got sold out!");
                        }
                        
                        transaction.update(roomRef, {
                            availableRooms: increment(-1),
                        });
                        
                        const bookingPayload: Booking = {
                            userId: userIdForBooking,
                            hotelId,
                            hotelName: hotel.name,
                            hotelCity: hotel.city,
                            hotelAddress: hotel.address || '',
                            roomId,
                            roomType: room.type,
                            checkIn,
                            checkOut,
                            guests: parseInt(guests),
                            totalPrice: totalPrice,
                            customerName: customerDetails.name,
                            customerEmail: customerDetails.email,
                            status: 'CONFIRMED',
                            createdAt: Timestamp.now() as any,
                            razorpayPaymentId: response.razorpay_payment_id,
                            ...(couponDiscount > 0 && { couponCode: couponCode }),
                        };

                        transaction.set(bookingRef, bookingPayload);
                    });

                    toast({ title: "Booking Confirmed!", description: "Your Himalayan adventure is officially scheduled." });
                    router.push(`/booking/success/${bookingId}`);

                } catch (err: any) {
                     console.error("Booking Transaction Error:", err);
                     toast({
                        variant: "destructive",
                        title: "Booking Confirmation Failed",
                        description: err.message || "Could not confirm your booking. Please check your permissions or contact support.",
                    });
                } finally {
                    setIsBooking(false);
                }
            },
            prefill: {
                name: customerDetails.name,
                email: customerDetails.email,
            },
            theme: { color: "#388E3C" },
            modal: {
                ondismiss: () => {
                    setIsBooking(false);
                    toast({ variant: 'destructive', title: 'Payment Cancelled', description: 'Your booking was not completed.' });
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    return (
        <div className="container mx-auto max-w-4xl py-8 md:py-12 px-4 md:px-6">
            <Link href={`/hotels/${hotelId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 font-bold uppercase tracking-widest">
                <ArrowLeft className="h-4 w-4" />
                Back to Hotel
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
                <div className="space-y-10">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">Review Your <br/><span className="italic font-heading font-medium text-primary">Booking</span></h1>
                    <Card className="rounded-[2.5rem] overflow-hidden shadow-apple border-black/5">
                        <CardHeader className="p-8">
                            <CardTitle className="text-2xl font-black tracking-tight">{hotel.name}</CardTitle>
                            <CardDescription className="font-bold text-xs uppercase tracking-widest">{hotel.city}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-6">
                            {hotelImage && (
                                <div className="relative w-full aspect-video overflow-hidden rounded-[1.5rem]">
                                    <Image src={hotelImage} alt={hotel.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                                </div>
                            )}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <div className="p-2 bg-muted rounded-full"><BedDouble className="h-4 w-4 text-primary" /></div>
                                    <span className="font-bold text-sm tracking-tight text-foreground">{room.type} Room</span>
                                </div>
                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <div className="p-2 bg-muted rounded-full"><Calendar className="h-4 w-4 text-primary" /></div>
                                    <span className="font-bold text-sm tracking-tight text-foreground">{format(checkIn, 'EEE, MMM dd')} - {format(checkOut, 'EEE, MMM dd')}</span>
                                </div>
                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <div className="p-2 bg-muted rounded-full"><Users className="h-4 w-4 text-primary" /></div>
                                    <span className="font-bold text-sm tracking-tight text-foreground">{guests} Guest(s)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <h2 className="text-2xl font-black tracking-tight">Final Steps</h2>
                    <Card className="rounded-[2.5rem] shadow-apple border-black/5">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-lg font-black tracking-tight">Guest Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                                <Input
                                    placeholder="Your Name"
                                    value={customerDetails.name}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                    className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-primary font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                                <Input
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={customerDetails.email}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                                    className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-primary font-bold"
                                />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="rounded-[2.5rem] shadow-apple border-black/5 bg-primary/5">
                        <CardContent className="p-8 space-y-6">
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm font-medium text-muted-foreground">{room.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })} x {nights} nights</span>
                                <span className="font-bold">{originalBasePrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                            </div>

                             {hotelDiscountPercent > 0 && (
                                <div className="flex justify-between items-baseline text-green-600">
                                    <span className="text-sm font-bold">Special Offer ({hotelDiscountPercent}%)</span>
                                    <span className="font-bold">- {(originalBasePrice - basePriceAfterHotelDiscount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                                </div>
                            )}

                            <div className="space-y-3 pt-4 border-t border-black/5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                    <Tag className="h-3 w-3" /> Coupon Code
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="SAVE10"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="h-12 rounded-xl bg-white border-0 shadow-sm font-bold uppercase tracking-widest text-xs"
                                    />
                                    <Button type="button" variant="outline" onClick={handleApplyCoupon} className="h-12 rounded-xl font-bold px-6 border-black/10 hover:bg-primary hover:text-white transition-all">
                                        Apply
                                    </Button>
                                </div>
                                {couponMessage && (
                                    <p className={`text-[10px] font-black uppercase tracking-widest ml-1 ${couponDiscount > 0 ? 'text-green-600' : 'text-destructive'}`}>
                                        {couponMessage}
                                    </p>
                                )}
                            </div>

                            {couponDiscount > 0 && (
                                <div className="flex justify-between items-baseline text-green-600 font-black">
                                    <span className="text-sm">Coupon Discount</span>
                                    <span>- {couponDiscount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                                </div>
                            )}

                            <div className="pt-6 mt-2 flex justify-between items-center border-t border-black/5">
                                <span className="text-lg font-black tracking-tight">Total Payment</span>
                                <span className="text-3xl font-black text-primary tracking-tighter">
                                    {totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                     <div className="flex space-x-3 px-2">
                        <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} className="mt-1" />
                        <label htmlFor="terms" className="text-xs font-medium text-muted-foreground leading-relaxed cursor-pointer">
                            I agree to the <Link href="/terms" className="text-primary font-black underline underline-offset-4">Terms of Use</Link> and understand that this is an instant booking reservation.
                        </label>
                    </div>
                    
                    <Button
                        onClick={handlePayment}
                        size="lg"
                        className="w-full text-xl h-20 rounded-full font-black bg-accent hover:bg-accent/90 shadow-apple-deep shadow-accent/30 tracking-tight transition-all active:scale-95"
                        disabled={isBooking || !termsAccepted}
                    >
                        {isBooking ? (
                            <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Finalizing...</>
                        ) : (
                            `Pay & Confirm`
                        )}
                    </Button>

                     <div className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground space-y-3">
                        <div className="flex items-center justify-center gap-2 text-green-600">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Encrypted Secure Payments</span>
                        </div>
                        <p>Questions? <a href="mailto:nsati09@gmail.com" className="text-primary underline">Contact Support</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
