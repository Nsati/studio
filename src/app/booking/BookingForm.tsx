'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';
import Image from 'next/image';
import { differenceInDays, format, parse } from 'date-fns';
import { signInAnonymously } from 'firebase/auth';
import type { Hotel, Room } from '@/lib/types';
import { useFirestore, useAuth, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, ShieldCheck, Lock, Info, Star, CloudAlert, Download } from 'lucide-react';
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
    const nights = differenceInDays(checkOut, checkIn);

    const hotelDiscountPercent = hotel.discount || 0;
    const discountedRoomPrice = room.price * (1 - hotelDiscountPercent / 100);
    const totalPrice = discountedRoomPrice * nights;

    const handlePayment = async () => {
        if (!customerDetails.name || !customerDetails.email || !customerDetails.mobile) {
            toast({ variant: 'destructive', title: 'Details Required', description: 'Please complete the guest information form.' });
            return;
        }
        if (!weatherRiskAccepted) {
            toast({ variant: 'destructive', title: 'Action Required', description: 'Please acknowledge the weather risk for mountain travel.' });
            return;
        }

        setIsBooking(true);
        // Razorpay Logic simulation...
        const bookingId = `BK_${Date.now()}`;
        try {
            const result = await confirmBookingAction({
                userId: user?.uid || 'anon',
                hotelId: hotelId!,
                roomId: roomId!,
                bookingId,
                paymentId: 'SIM_PAY_123',
                orderId: 'SIM_ORD_123',
                signature: 'SIM_SIG_123',
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

            if (result.success) {
                router.push(`/booking/success/${bookingId}`);
            } else {
                toast({ variant: "destructive", title: "Action Failed", description: result.error });
                setIsBooking(false);
            }
        } catch (e: any) {
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
                        {/* Guest Details */}
                        <Card className="rounded-sm border-border">
                            <CardHeader className="border-b bg-muted/10">
                                <CardTitle className="text-lg font-black uppercase tracking-tighter">Guest Information</CardTitle>
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
                            </CardContent>
                        </Card>

                        {/* Special Mountain Requests */}
                        <Card className="rounded-sm border-border">
                            <CardHeader className="border-b bg-muted/10">
                                <CardTitle className="text-lg font-black uppercase tracking-tighter">Mountain Services</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="split" checked={splitPayment} onCheckedChange={(checked) => setSplitPayment(checked === true)} />
                                    <label htmlFor="split" className="text-sm font-bold cursor-pointer">Split Payment (Pay ₹{Math.floor(totalPrice/2)} now, balance at hotel)</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="early" checked={earlyCheckIn} onCheckedChange={(checked) => setEarlyCheckIn(checked === true)} />
                                    <label htmlFor="early" className="text-sm font-bold cursor-pointer">Request Early Check-in (Pahadi hospitality ready)</label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Weather Disclaimer */}
                        <div className="p-6 bg-red-50 border border-red-100 rounded-sm space-y-4">
                            <div className="flex items-center gap-3 text-red-800 font-black uppercase tracking-tighter text-lg">
                                <CloudAlert className="h-6 w-6" /> Weather Risk Disclaimer
                            </div>
                            <p className="text-sm text-red-700 leading-relaxed font-medium">
                                Travel in Uttarakhand mountains is subject to weather conditions. By booking, you acknowledge that landslides or heavy snow may affect road access. We recommend keeping 1 extra day buffer for your return.
                            </p>
                            <div className="flex items-center space-x-3 pt-2">
                                <Checkbox id="weather" checked={weatherRiskAccepted} onCheckedChange={(checked) => setWeatherRiskAccepted(checked === true)} className="border-red-400" />
                                <label htmlFor="weather" className="text-sm font-black text-red-900 cursor-pointer">I understand and accept the mountain travel risks.</label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-white border rounded-sm">
                                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} className="mt-1" />
                                <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                                    I accept the <Link href="/terms" className="text-[#006ce4] font-bold hover:underline">Booking Terms</Link>.
                                </label>
                            </div>

                            <Button onClick={handlePayment} size="lg" className="w-full sm:w-auto h-12 px-10 rounded-none text-base font-black bg-[#006ce4] hover:bg-[#005bb8] text-white shadow-sm" disabled={isBooking || !termsAccepted || !weatherRiskAccepted}>
                                {isBooking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizing Stay...</> : <><Lock className="mr-2 h-4 w-4" /> Secure Reservation</>}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="rounded-sm border-border sticky top-24">
                            <CardHeader className="bg-[#003580] text-white">
                                <CardTitle className="text-base font-black uppercase tracking-widest">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground">Property</p>
                                    <p className="text-sm font-black">{hotel.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground">Room Type</p>
                                    <p className="text-sm font-black">{room.type}</p>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-black">Total Price</span>
                                    <span className="text-xl font-black text-[#1a1a1a]">
                                        {totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Low Network / Offline Alert */}
                        <div className="p-6 bg-amber-50 border border-amber-100 rounded-sm space-y-4">
                            <div className="flex items-center gap-2 text-amber-800 font-black uppercase tracking-tighter">
                                <Info className="h-5 w-5" /> Travel Tip
                            </div>
                            <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                Going to a remote zone? Download your booking confirmation now for offline access.
                            </p>
                            <Button variant="outline" className="w-full h-10 rounded-none border-amber-300 text-amber-800 hover:bg-amber-100 font-bold text-xs">
                                <Download className="mr-2 h-4 w-4" /> Save Offline Voucher
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
