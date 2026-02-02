'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';
import Image from 'next/image';
import { differenceInDays, format, parse } from 'date-fns';
import { signInAnonymously } from 'firebase/auth';
import type { Hotel, Room, Booking, Promotion } from '@/lib/types';
import { useFirestore, useAuth, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, getDoc } from 'firebase/firestore';

import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Calendar, Users, BedDouble, ArrowLeft, Tag, ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { BookingFormSkeleton } from './BookingFormSkeleton';
import { confirmBookingAction } from './actions';
import React from 'react';

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

    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '', mobile: '' });
    const [isBooking, setIsBooking] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState('');

    useEffect(() => {
        if (userProfile) {
            setCustomerDetails({ 
                name: userProfile.displayName, 
                email: userProfile.email,
                mobile: userProfile.mobile || ''
            });
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
                setCouponMessage(`🎉 Code "${promotion.code}" applied! Saved ${promotion.discountValue}%.`);
            } else { // fixed
                discountAmount = promotion.discountValue;
                 setCouponMessage(`🎉 Code "${promotion.code}" applied! Flat savings.`);
            }
            setCouponDiscount(discountAmount);
            toast({
                title: 'Success',
                description: 'Coupon applied successfully.',
            });
        } else {
            setCouponDiscount(0);
            setCouponMessage('Invalid or expired code.');
            toast({
                variant: 'destructive',
                title: 'Invalid',
                description: 'The coupon code is not valid.',
            });
        }
    };

    const handlePayment = async () => {
        if (!firestore) return;
        if (!customerDetails.name || !customerDetails.email || !customerDetails.mobile) {
            toast({ variant: 'destructive', title: 'Details Required', description: 'Please fill name, email and mobile.' });
            return;
        }
        
        setIsBooking(true);

        if (typeof window.Razorpay === 'undefined') {
            toast({ variant: "destructive", title: "Gateway Error", description: "Refresh page to load payment secure module." });
            setIsBooking(false);
            return;
        }
        
        let currentAuthUser = user;
        if (!currentAuthUser) {
            if (!auth) {
                 setIsBooking(false);
                 return;
            }
            try {
                const userCredential = await signInAnonymously(auth);
                currentAuthUser = userCredential.user;
            } catch (error) {
                toast({ variant: 'destructive', title: 'Secure Link Failed' });
                setIsBooking(false);
                return;
            }
        }
        
        const userIdForBooking = currentAuthUser.uid;
        // Using the Live Key provided by user
        const keyId = 'rzp_live_SBAuFmGWqZjkQM';
        
        const amountInPaise = Math.round(totalPrice * 100);
        const options = {
            key: keyId,
            amount: amountInPaise,
            currency: "INR",
            name: "Uttarakhand Getaways",
            description: `Stay at ${hotel.name}`,
            notes: {
                booking_id: `booking_${Date.now()}`,
                user_id: userIdForBooking
            },
            handler: async (response: any) => {
                const bookingId = options.notes.booking_id;
                
                const result = await confirmBookingAction({
                    userId: userIdForBooking,
                    hotelId: hotelId!,
                    roomId: roomId!,
                    bookingId,
                    paymentId: response.razorpay_payment_id,
                    bookingData: {
                        hotelName: hotel.name,
                        hotelCity: hotel.city,
                        hotelAddress: hotel.address || '',
                        roomType: room.type,
                        checkIn: checkInStr,
                        checkOut: checkOutStr,
                        guests: parseInt(guests),
                        totalPrice: totalPrice,
                        customerName: customerDetails.name,
                        customerEmail: customerDetails.email,
                        customerMobile: customerDetails.mobile,
                        couponCode: couponDiscount > 0 ? couponCode : undefined,
                    }
                });

                if (result.success) {
                    toast({ title: "Adventure Confirmed!" });
                    router.push(`/booking/success/${bookingId}`);
                } else {
                    toast({ variant: "destructive", title: "Confirmation Error", description: result.error });
                    setIsBooking(false);
                }
            },
            prefill: {
                name: customerDetails.name,
                email: customerDetails.email,
                contact: customerDetails.mobile
            },
            theme: { color: "#388E3C" },
            modal: {
                ondismiss: () => {
                    setIsBooking(false);
                    toast({ variant: 'destructive', title: 'Payment Aborted' });
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    return (
        <div className="container mx-auto max-w-6xl py-10 px-4 md:px-6">
            <div className="mb-10">
                <Link href={`/hotels/${hotelId}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Hotel Details
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                {/* Left Column: Summary (1 Part) */}
                <div className="lg:col-span-1 space-y-8">
                    <h1 className="text-3xl font-black tracking-tighter">Your <span className="text-primary italic">Selection</span></h1>
                    <Card className="rounded-[2.5rem] overflow-hidden shadow-apple border-black/5">
                        {hotelImage && (
                            <div className="relative aspect-[16/10]">
                                <Image src={hotelImage} alt={hotel.name} fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h2 className="text-xl font-bold text-white leading-tight">{hotel.name}</h2>
                                    <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-1">{hotel.city}</p>
                                </div>
                            </div>
                        )}
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary"><BedDouble className="h-5 w-5" /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Room Type</span>
                                        <span className="font-bold text-sm tracking-tight">{room.type}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary"><Calendar className="h-5 w-5" /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Stay Period</span>
                                        <span className="font-bold text-sm tracking-tight">{format(checkIn, 'MMM dd')} - {format(checkOut, 'MMM dd')} ({nights} nights)</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary"><Users className="h-5 w-5" /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Guests</span>
                                        <span className="font-bold text-sm tracking-tight">{guests} Explorer(s)</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] bg-muted/30 border-black/5 p-8 space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-baseline text-sm font-medium">
                                <span className="text-muted-foreground">Original Price</span>
                                <span>{originalBasePrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                            </div>
                            {hotelDiscountPercent > 0 && (
                                <div className="flex justify-between items-baseline text-sm font-black text-green-600">
                                    <span>Hotel Offer ({hotelDiscountPercent}%)</span>
                                    <span>- {(originalBasePrice - basePriceAfterHotelDiscount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                                </div>
                            )}
                            {couponDiscount > 0 && (
                                <div className="flex justify-between items-baseline text-sm font-black text-green-600">
                                    <span>Coupon Savings</span>
                                    <span>- {couponDiscount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                                </div>
                            )}
                        </div>
                        <div className="pt-6 border-t border-black/5 flex justify-between items-center">
                            <span className="text-lg font-black tracking-tight">Total Amount</span>
                            <span className="text-3xl font-black text-primary tracking-tighter">
                                {totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                            </span>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Guest Details (2 Parts) */}
                <div className="lg:col-span-2 space-y-10">
                    <h2 className="text-3xl font-black tracking-tighter">Guest <span className="text-primary italic">Information</span></h2>
                    
                    <Card className="rounded-[3rem] shadow-apple-deep border-black/5 bg-white overflow-hidden">
                        <div className="p-10 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Full Legal Name</Label>
                                    <Input
                                        placeholder="Enter name as on ID"
                                        value={customerDetails.name}
                                        onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                        className="h-16 rounded-[1.5rem] bg-muted/50 border-0 focus-visible:ring-primary font-bold text-lg px-6"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Email Address</Label>
                                    <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={customerDetails.email}
                                        onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                                        className="h-16 rounded-[1.5rem] bg-muted/50 border-0 focus-visible:ring-primary font-bold text-lg px-6"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Mobile Number</Label>
                                    <div className="flex gap-2">
                                        <div className="h-16 px-4 bg-muted/50 rounded-[1.5rem] flex items-center font-bold text-muted-foreground opacity-60">+91</div>
                                        <Input
                                            type="tel"
                                            maxLength={10}
                                            placeholder="10-digit number"
                                            value={customerDetails.mobile}
                                            onChange={(e) => setCustomerDetails({ ...customerDetails, mobile: e.target.value })}
                                            className="h-16 rounded-[1.5rem] bg-muted/50 border-0 focus-visible:ring-primary font-bold text-lg flex-1 px-6"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Tag className="h-5 w-5 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Apply Promo Code</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Input
                                        placeholder="HIMALAYAS10"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="h-14 rounded-2xl bg-white border-black/5 shadow-sm font-black uppercase tracking-widest text-xs px-6"
                                    />
                                    <Button type="button" variant="outline" onClick={handleApplyCoupon} className="h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 hover:bg-primary hover:text-white transition-all">
                                        Apply
                                    </Button>
                                </div>
                                {couponMessage && (
                                    <p className={`text-[10px] font-black uppercase tracking-widest ml-2 ${couponDiscount > 0 ? 'text-green-600' : 'text-destructive'}`}>
                                        {couponMessage}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-start gap-4">
                                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} className="mt-1" />
                                <label htmlFor="terms" className="text-xs font-medium text-muted-foreground leading-relaxed cursor-pointer select-none">
                                    I confirm that the guest information is correct and I agree to the <Link href="/terms" className="text-primary font-black underline underline-offset-4">Booking Terms</Link> & <Link href="/refund-policy" className="text-primary font-black underline underline-offset-4">Cancellation Policy</Link>.
                                </label>
                            </div>

                            <Button
                                onClick={handlePayment}
                                size="lg"
                                className="w-full h-24 rounded-full text-2xl font-black bg-accent hover:bg-accent/90 shadow-apple-deep shadow-accent/30 tracking-tighter transition-all active:scale-95"
                                disabled={isBooking || !termsAccepted}
                            >
                                {isBooking ? (
                                    <><Loader2 className="mr-4 h-8 w-8 animate-spin" /> Processing...</>
                                ) : (
                                    `Complete Payment`
                                )}
                            </Button>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-10 opacity-60">
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-green-600">
                                    <CheckCircle2 className="h-4 w-4" /> Instant Confirmation
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary">
                                    <ShieldCheck className="h-4 w-4" /> Secure 256-bit SSL
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                                    <ShieldAlert className="h-4 w-4" /> No Hidden Fees
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
