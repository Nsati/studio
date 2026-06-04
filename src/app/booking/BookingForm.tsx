'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';
import Image from 'next/image';
import { differenceInDays, format, parse, isValid as isDateValid } from 'date-fns';
import type { Hotel, Room } from '@/lib/types';
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Lock, CloudAlert, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { BookingFormSkeleton } from './BookingFormSkeleton';
import { confirmBookingAction } from './actions';
import React from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * @fileOverview Hardened Tripzy Checkout Form. 
 * Features: Auto-Anonymous Auth, Same-day Validation, and Robust Payment Handling.
 */

export function BookingForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const auth = useAuth();
    const { user, userProfile, isLoading: isUserLoading } = useUser();
    const { toast } = useToast();
    const firestore = useFirestore();

    const hotelId = searchParams.get('hotelId');
    const roomId = searchParams.get('roomId');
    const checkInStr = searchParams.get('checkIn');
    const checkOutStr = searchParams.get('checkOut');
    const guests = searchParams.get('guests') || '1';
    
    // 1. Silent Anonymous Auth Trigger
    useEffect(() => {
        if (!isUserLoading && !user && auth) {
            console.log("[AUTH] Triggering silent anonymous session for booking...");
            signInAnonymously(auth).catch(e => console.error("Anonymous auth failed:", e));
        }
    }, [user, isUserLoading, auth]);

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
    const [weatherRiskAccepted, setWeatherRiskAccepted] = useState(false);
    const [splitPayment, setSplitPayment] = useState(false);
    const [earlyCheckIn, setEarlyCheckIn] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setCustomerDetails({ 
                name: userProfile.displayName || '', 
                email: userProfile.email || '',
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
    
    if (!isDateValid(checkIn) || !isDateValid(checkOut)) {
        return notFound();
    }

    const nights = differenceInDays(checkOut, checkIn);
    
    // Safety check for minimum 1 night
    if (nights < 1) {
        return (
            <div className="container mx-auto py-20 px-6 text-center">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h1 className="text-2xl font-black uppercase">Invalid Stay Window</h1>
                <p className="text-muted-foreground mt-2">Minimum stay at Tripzy properties is 1 night.</p>
                <Button asChild className="mt-6 rounded-none px-10" variant="outline">
                    <Link href={`/hotels/${hotelId}`}>Modify Selection</Link>
                </Button>
            </div>
        );
    }

    const discountedRoomPrice = hotel.discount ? room.price * (1 - hotel.discount / 100) : room.price;
    const totalPrice = discountedRoomPrice * nights;

    const handlePayment = async () => {
        if (!customerDetails.name || !customerDetails.email || !customerDetails.mobile) {
            toast({ variant: 'destructive', title: 'Details Required', description: 'Please complete the guest information form.' });
            return;
        }
        if (!weatherRiskAccepted) {
            toast({ variant: 'destructive', title: 'Action Required', description: 'Please acknowledge the weather risk disclaimer.' });
            return;
        }
        if (!user) {
            toast({ variant: 'destructive', title: 'Session Error', description: 'Establishing secure cloud connection. Please try again in 2 seconds.' });
            return;
        }

        setIsBooking(true);

        try {
            // 2. Create Order
            const orderRes = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: totalPrice }),
            });
            const orderData = await orderRes.json();

            if (!orderRes.ok) throw new Error(orderData.details || 'Gateway Order Creation Failed');

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SC2oQHkSXdvVp8',
                amount: orderData.amount,
                currency: "INR",
                name: "Northern Harrier",
                description: `Stay at ${hotel.name}`,
                order_id: orderData.id,
                handler: async function (response: any) {
                    const bookingId = `BK_${Date.now()}`;
                    
                    // 3. Confirm with Server Action
                    const confirmRes = await confirmBookingAction({
                        userId: user.uid,
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
                            weatherRiskAccepted,
                            splitPayment,
                            earlyCheckInRequested: earlyCheckIn
                        }
                    });

                    if (confirmRes.success) {
                        router.push(`/booking/success/${bookingId}`);
                    } else {
                        toast({ variant: "destructive", title: "Cloud Verification Failed", description: confirmRes.error });
                        setIsBooking(false);
                    }
                },
                prefill: {
                    name: customerDetails.name,
                    email: customerDetails.email,
                    contact: customerDetails.mobile
                },
                theme: {
                    color: "#1B4D2E" // Pine Green
                },
                modal: {
                    ondismiss: function() {
                        setIsBooking(false);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast({ variant: 'destructive', title: 'Payment Interrupted', description: response.error.description });
                setIsBooking(false);
            });
            rzp.open();

        } catch (e: any) {
            console.error("[CHECKOUT ERROR]:", e);
            toast({ variant: 'destructive', title: 'System Error', description: e.message });
            setIsBooking(false);
        }
    };

    return (
        <div className="bg-[#f5f5f5] min-h-screen">
            <div className="bg-white border-b py-4">
                <div className="container mx-auto px-4">
                    <Link href={`/hotels/${hotelId}`} className="flex items-center gap-2 text-sm text-[#006ce4] hover:underline font-bold">
                        <ArrowLeft className="h-4 w-4" /> Back to property detail
                    </Link>
                </div>
            </div>

            <div className="container mx-auto py-8 px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="rounded-none border-border">
                            <CardHeader className="border-b bg-muted/10 p-4">
                                <CardTitle className="text-base font-black uppercase tracking-widest">Guest Documentation</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Legal Name</Label>
                                        <Input value={customerDetails.name} onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })} className="h-10 rounded-none focus-visible:ring-[#006ce4]" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                                        <Input type="email" value={customerDetails.email} onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })} className="h-10 rounded-none focus-visible:ring-[#006ce4]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mobile Contact Node</Label>
                                    <Input value={customerDetails.mobile} onChange={(e) => setCustomerDetails({ ...customerDetails, mobile: e.target.value })} placeholder="9876543210" className="h-10 rounded-none focus-visible:ring-[#006ce4]" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-none border-border">
                            <CardHeader className="border-b bg-muted/10 p-4">
                                <CardTitle className="text-base font-black uppercase tracking-widest">Expedition Protocols</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Checkbox id="split" checked={splitPayment} onCheckedChange={(checked) => setSplitPayment(checked === true)} />
                                    <label htmlFor="split" className="text-sm font-bold cursor-pointer uppercase tracking-tight">Split Payment (Pay Balance at Hotel)</label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Checkbox id="early" checked={earlyCheckIn} onCheckedChange={(checked) => setEarlyCheckIn(checked === true)} />
                                    <label htmlFor="early" className="text-sm font-bold cursor-pointer uppercase tracking-tight">Request Early Check-in Protocol</label>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-6 bg-red-50 border border-red-100 rounded-none space-y-4">
                            <div className="flex items-center gap-3 text-red-800 font-black uppercase tracking-tighter text-lg">
                                <CloudAlert className="h-6 w-6" /> Weather Risk Compliance
                            </div>
                            <p className="text-xs text-red-700 leading-relaxed font-bold uppercase tracking-tight">
                                Himalayan stays are subject to dynamic weather patterns. By initiating this reservation, you acknowledge that road access may be affected by snow or terrain shifts.
                            </p>
                            <div className="flex items-center space-x-3 pt-2">
                                <Checkbox id="weather" checked={weatherRiskAccepted} onCheckedChange={(checked) => setWeatherRiskAccepted(checked === true)} className="border-red-400" />
                                <label htmlFor="weather" className="text-[10px] font-black text-red-900 cursor-pointer uppercase">I have reviewed and accept the mountain travel risk protocols.</label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-white border rounded-none">
                                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} className="mt-1" />
                                <label htmlFor="terms" className="text-[10px] font-bold text-muted-foreground leading-relaxed cursor-pointer uppercase tracking-tight">
                                    I confirm agreement with the <Link href="/terms" className="text-[#006ce4] font-black hover:underline">Tripzy Global Booking Terms</Link>.
                                </label>
                            </div>

                            <Button onClick={handlePayment} size="lg" className="w-full sm:w-auto h-14 px-12 rounded-none text-base font-black bg-[#006ce4] hover:bg-[#005bb8] text-white shadow-xl" disabled={isBooking || !termsAccepted || !weatherRiskAccepted}>
                                {isBooking ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Synchronizing...</> : <><Lock className="mr-2 h-5 w-5" /> Execute Secure Reservation</>}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="rounded-none border-border sticky top-24">
                            <CardHeader className="bg-[#1B4D2E] text-white p-4">
                                <CardTitle className="text-xs font-black uppercase tracking-widest">Order Summary Sync</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Target Property</p>
                                    <p className="text-sm font-black text-slate-900 leading-tight uppercase">{hotel.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Stay Window</p>
                                    <p className="text-sm font-black text-slate-900">{format(checkIn, 'dd MMM')} — {format(checkOut, 'dd MMM yyyy')} ({nights} Nights)</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Occupancy</p>
                                    <p className="text-sm font-black text-slate-900">{guests} Guest(s) • {room.type}</p>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-widest">Net Investment</span>
                                    <span className="text-2xl font-black text-primary tracking-tighter">
                                        {totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
