
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
import { Loader2, Calendar, Users, BedDouble, ArrowLeft, Tag, ShieldCheck, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
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

    if (nights <= 0) return notFound();

    const hotelImage = hotel.images[0]?.startsWith('http')
        ? hotel.images[0]
        : PlaceHolderImages.find((img) => img.id === hotel.images[0])?.imageUrl;
    
    const hotelDiscountPercent = hotel.discount || 0;
    const originalRoomPrice = room.price;
    const discountedRoomPrice = originalRoomPrice * (1 - hotelDiscountPercent / 100);
    const basePriceAfterHotelDiscount = discountedRoomPrice * nights;
    const totalPrice = Math.max(0, basePriceAfterHotelDiscount - couponDiscount);

    const handlePayment = async () => {
        if (!customerDetails.name || !customerDetails.email || !customerDetails.mobile) {
            toast({ variant: 'destructive', title: 'Details Required', description: 'Please complete the guest information form.' });
            return;
        }
        
        setIsBooking(true);

        try {
            // 1. Create Order ID from Backend
            const orderRes = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: totalPrice })
            });

            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error || 'Failed to initialize payment gateway.');

            // 2. Ensure user is authenticated (anonymous if needed)
            let currentAuthUser = user;
            if (!currentAuthUser && auth) {
                const userCredential = await signInAnonymously(auth);
                currentAuthUser = userCredential.user;
            }

            const options = {
                key: 'rzp_live_SBAuFmGWqZjkQM', // Live Key
                amount: orderData.amount,
                currency: "INR",
                name: "Uttarakhand Getaways",
                description: `Himalayan Stay: ${hotel.name}`,
                image: "https://geof.storyboardthat.com/images/default-avatar.png",
                order_id: orderData.id,
                handler: async (response: any) => {
                    const bookingId = `booking_${Date.now()}`;
                    const result = await confirmBookingAction({
                        userId: currentAuthUser!.uid,
                        hotelId: hotelId!,
                        roomId: roomId!,
                        bookingId,
                        paymentId: response.razorpay_payment_id,
                        orderId: response.razorpay_order_id,
                        signature: response.razorpay_signature,
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
                        }
                    });

                    if (result.success) {
                        router.push(`/booking/success/${bookingId}`);
                    } else {
                        toast({ variant: "destructive", title: "Booking Error", description: result.error });
                        setIsBooking(false);
                    }
                },
                prefill: {
                    name: customerDetails.name,
                    email: customerDetails.email,
                    contact: customerDetails.mobile
                },
                notes: { address: hotel.address || hotel.city },
                theme: { color: "#388E3C" },
                modal: {
                    ondismiss: () => {
                        setIsBooking(false);
                        toast({ variant: 'destructive', title: 'Payment Canceled', description: 'Your Himalayan journey is waiting.' });
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Gateway Connection Failed', description: e.message });
            setIsBooking(false);
        }
    };

    return (
        <div className="container mx-auto max-w-6xl py-10 px-4 md:px-6">
            <div className="mb-10">
                <Link href={`/hotels/${hotelId}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Collection
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                <div className="lg:col-span-1 space-y-8">
                    <h1 className="text-3xl font-black tracking-tighter uppercase">Your <span className="text-primary italic">Adventure</span></h1>
                    <Card className="rounded-[2.5rem] overflow-hidden shadow-apple border-black/5 bg-white">
                        {hotelImage && (
                            <div className="relative aspect-[16/10]">
                                <Image src={hotelImage} alt={hotel.name} fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h2 className="text-xl font-bold text-white leading-tight">{hotel.name}</h2>
                                    <p className="text-white/70 text-[9px] font-black uppercase tracking-widest mt-1">{hotel.city}</p>
                                </div>
                            </div>
                        )}
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 gap-5">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-primary/5 rounded-full flex items-center justify-center text-primary"><BedDouble className="h-5 w-5" /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Accommodation</span>
                                        <span className="font-bold text-sm tracking-tight">{room.type}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-primary/5 rounded-full flex items-center justify-center text-primary"><Calendar className="h-5 w-5" /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Stay Window</span>
                                        <span className="font-bold text-sm tracking-tight">{format(checkIn, 'MMM dd')} - {format(checkOut, 'MMM dd')} ({nights} Nights)</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] bg-muted/30 border-black/5 p-8 space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-baseline text-sm font-medium">
                                <span className="text-muted-foreground">Base Investment</span>
                                <span>{basePriceAfterHotelDiscount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="flex justify-between items-baseline text-sm font-black text-green-600">
                                    <span>Promotional Credit</span>
                                    <span>- {couponDiscount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                                </div>
                            )}
                        </div>
                        <div className="pt-6 border-t border-black/5 flex justify-between items-center">
                            <span className="text-lg font-black tracking-tight uppercase">Final Amount</span>
                            <span className="text-3xl font-black text-primary tracking-tighter">
                                {totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                            </span>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-10">
                    <h2 className="text-3xl font-black tracking-tighter uppercase">Guest <span className="text-primary italic">Verification</span></h2>
                    
                    <Card className="rounded-[3rem] shadow-apple-deep border-black/5 bg-white overflow-hidden">
                        <div className="p-10 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Full Legal Name</Label>
                                    <Input
                                        placeholder="Name as on ID card"
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
                                <div className="space-y-3 md:col-span-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Contact Number</Label>
                                    <div className="flex gap-2">
                                        <div className="h-16 px-6 bg-muted/50 rounded-[1.5rem] flex items-center font-black text-muted-foreground opacity-60 text-lg">+91</div>
                                        <Input
                                            type="tel"
                                            maxLength={10}
                                            placeholder="10-digit mobile number"
                                            value={customerDetails.mobile}
                                            onChange={(e) => setCustomerDetails({ ...customerDetails, mobile: e.target.value })}
                                            className="h-16 rounded-[1.5rem] bg-muted/50 border-0 focus-visible:ring-primary font-bold text-lg flex-1 px-6"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-muted/30 rounded-3xl">
                                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} className="mt-1" />
                                <label htmlFor="terms" className="text-xs font-medium text-muted-foreground leading-relaxed cursor-pointer select-none">
                                    I agree to the <Link href="/terms" className="text-primary font-black underline underline-offset-4">Terms of Service</Link> and understand the <Link href="/refund-policy" className="text-primary font-black underline underline-offset-4">Cancellation Policy</Link>.
                                </label>
                            </div>

                            <div className="space-y-6">
                                <Button
                                    onClick={handlePayment}
                                    size="lg"
                                    className="w-full h-24 rounded-full text-2xl font-black bg-accent hover:bg-accent/90 shadow-apple-deep shadow-accent/30 tracking-tighter transition-all active:scale-95 group"
                                    disabled={isBooking || !termsAccepted}
                                >
                                    {isBooking ? (
                                        <><Loader2 className="mr-4 h-8 w-8 animate-spin" /> Link Active...</>
                                    ) : (
                                        <><Lock className="mr-4 h-6 w-6 opacity-50 group-hover:opacity-100" /> Secure Checkout</>
                                    )}
                                </Button>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-10 opacity-40">
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" /> Instant Confirmation
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                                        <ShieldCheck className="h-4 w-4 text-primary" /> Razorpay Live Verified
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                                        <ShieldAlert className="h-4 w-4" /> 256-bit Encryption
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
