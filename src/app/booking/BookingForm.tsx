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
import { Loader2, Calendar, BedDouble, ArrowLeft, ShieldCheck, Lock, Info, Star } from 'lucide-react';
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

    if (nights <= 0) return notFound();

    const hotelImage = hotel.images[0]?.startsWith('http')
        ? hotel.images[0]
        : PlaceHolderImages.find((img) => img.id === hotel.images[0])?.imageUrl;
    
    const hotelDiscountPercent = hotel.discount || 0;
    const discountedRoomPrice = room.price * (1 - hotelDiscountPercent / 100);
    const totalPrice = discountedRoomPrice * nights;

    const handlePayment = async () => {
        if (!customerDetails.name || !customerDetails.email || !customerDetails.mobile) {
            toast({ variant: 'destructive', title: 'Details Required', description: 'Please complete the guest information form.' });
            return;
        }

        if (!window.Razorpay) {
            toast({ variant: 'destructive', title: 'Payment Script Loading', description: 'Checkout script is still loading. Please wait a second.' });
            return;
        }
        
        setIsBooking(true);

        try {
            const orderRes = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: totalPrice })
            });

            const orderData = await orderRes.json();
            
            if (!orderRes.ok) {
                throw new Error(orderData.details || orderData.error || 'Failed to initialize payment gateway.');
            }

            let currentAuthUser = user;
            if (!currentAuthUser && auth) {
                const userCredential = await signInAnonymously(auth);
                currentAuthUser = userCredential.user;
            }

            const options = {
                key: 'rzp_live_SBCbtId0o91JAf',
                amount: orderData.amount,
                currency: "INR",
                name: "Uttarakhand Getaways",
                description: `Stay at ${hotel.name}`,
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
                        toast({ variant: "destructive", title: "Verification Failed", description: result.error });
                        setIsBooking(false);
                    }
                },
                prefill: {
                    name: customerDetails.name,
                    email: customerDetails.email,
                    contact: customerDetails.mobile
                },
                theme: { color: "#003580" },
                modal: {
                    ondismiss: () => {
                        setIsBooking(false);
                        toast({ title: 'Payment Canceled', description: 'Your transaction was interrupted.' });
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (e: any) {
            console.error("Payment initialization error:", e);
            toast({ 
                variant: 'destructive', 
                title: 'Gateway Error', 
                description: e.message || 'Could not reach Razorpay. Please check your internet.' 
            });
            setIsBooking(false);
        }
    };

    return (
        <div className="bg-[#f5f5f5] min-h-screen">
            {/* Header / Breadcrumbs */}
            <div className="bg-white border-b py-4">
                <div className="container mx-auto px-4">
                    <Link href={`/hotels/${hotelId}`} className="flex items-center gap-2 text-sm text-[#006ce4] hover:underline font-bold">
                        <ArrowLeft className="h-4 w-4" /> Back to hotel
                    </Link>
                </div>
            </div>

            <div className="container mx-auto py-8 px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Details & Guest Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Hotel Quick Summary */}
                        <Card className="rounded-sm border-border overflow-hidden">
                            <div className="flex flex-col sm:flex-row">
                                <div className="relative w-full sm:w-48 aspect-square flex-shrink-0">
                                    <Image src={hotelImage || ''} alt={hotel.name} fill className="object-cover" />
                                </div>
                                <div className="p-4 flex flex-col justify-center">
                                    <div className="flex items-center gap-1 mb-1">
                                        <div className="flex gap-0.5">
                                            {[...Array(Math.floor(hotel.rating))].map((_, i) => (
                                                <Star key={i} className="h-3 w-3 fill-[#febb02] text-[#febb02]" />
                                            ))}
                                        </div>
                                        <span className="bg-[#febb02] text-[10px] font-bold px-1 rounded-sm">Resort</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-[#1a1a1a]">{hotel.name}</h2>
                                    <p className="text-sm text-muted-foreground">{hotel.city}, Uttarakhand</p>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-green-700 font-bold">
                                        <ShieldCheck className="h-4 w-4" /> Excellent Location — {hotel.rating} Rating
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Guest Details Form */}
                        <Card className="rounded-sm border-border">
                            <CardHeader className="border-b bg-muted/10">
                                <CardTitle className="text-lg font-bold">Enter your details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Full Legal Name</Label>
                                        <Input
                                            placeholder="e.g. John Doe"
                                            value={customerDetails.name}
                                            onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                            className="h-10 rounded-sm focus-visible:ring-[#006ce4]"
                                        />
                                        <p className="text-[11px] text-muted-foreground">Needed for hotel check-in</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Email Address</Label>
                                        <Input
                                            type="email"
                                            placeholder="email@example.com"
                                            value={customerDetails.email}
                                            onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                                            className="h-10 rounded-sm focus-visible:ring-[#006ce4]"
                                        />
                                        <p className="text-[11px] text-muted-foreground">Confirmation will be sent here</p>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-sm font-bold">Mobile Number</Label>
                                        <div className="flex gap-2">
                                            <div className="h-10 px-3 bg-muted border rounded-sm flex items-center text-sm font-bold text-muted-foreground">+91</div>
                                            <Input
                                                type="tel"
                                                maxLength={10}
                                                placeholder="9876543210"
                                                value={customerDetails.mobile}
                                                onChange={(e) => setCustomerDetails({ ...customerDetails, mobile: e.target.value })}
                                                className="h-10 rounded-sm flex-1 focus-visible:ring-[#006ce4]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-sm flex gap-3">
                                    <Info className="h-5 w-5 text-blue-600 shrink-0" />
                                    <p className="text-xs text-blue-800 leading-relaxed">
                                        Almost done! Just fill in the <b>* required info</b> and click the button to proceed to secure payment.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Terms & Payment */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-white border rounded-sm">
                                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} className="mt-1" />
                                <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                                    I have read and accept the <Link href="/terms" className="text-[#006ce4] font-bold hover:underline">General Terms</Link> and <Link href="/privacy" className="text-[#006ce4] font-bold hover:underline">Privacy Policy</Link>.
                                </label>
                            </div>

                            <Button
                                onClick={handlePayment}
                                size="lg"
                                className="w-full sm:w-auto h-12 px-10 rounded-sm text-base font-bold bg-[#006ce4] hover:bg-[#005bb8] text-white shadow-sm"
                                disabled={isBooking || !termsAccepted}
                            >
                                {isBooking ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizing...</>
                                ) : (
                                    <><Lock className="mr-2 h-4 w-4" /> Book & Pay Now</>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Order Summary Sidebar */}
                    <div className="space-y-6">
                        <Card className="rounded-sm border-border sticky top-24">
                            <CardHeader className="bg-muted/20 border-b">
                                <CardTitle className="text-base font-bold">Your booking details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold">Check-in</p>
                                        <p className="text-sm font-bold">{format(checkIn, 'EEE, MMM dd, yyyy')}</p>
                                        <p className="text-[11px] text-muted-foreground">From 12:00 PM</p>
                                    </div>
                                    <div className="space-y-1 border-l pl-4">
                                        <p className="text-xs font-bold">Check-out</p>
                                        <p className="text-sm font-bold">{format(checkOut, 'EEE, MMM dd, yyyy')}</p>
                                        <p className="text-[11px] text-muted-foreground">Until 11:00 AM</p>
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t space-y-2">
                                    <p className="text-xs font-bold">Total length of stay:</p>
                                    <p className="text-sm font-bold">{nights} night{nights > 1 ? 's' : ''}</p>
                                </div>

                                <div className="pt-4 border-t space-y-2">
                                    <p className="text-xs font-bold">You selected:</p>
                                    <p className="text-sm font-bold">{room.type}</p>
                                    <div className="flex items-center gap-2 text-[11px] text-green-700 font-bold">
                                        <BedDouble className="h-3 w-3" /> 1 unit for {guests} adults
                                    </div>
                                </div>
                            </CardContent>
                            <div className="bg-[#ebf3ff] p-4 border-t">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-lg font-bold">Price</span>
                                    <span className="text-xl font-bold text-[#1a1a1a]">
                                        {totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                                    </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground text-right italic">Includes taxes and charges</p>
                            </div>
                        </Card>

                        {/* Trust Widget */}
                        <div className="p-4 border rounded-sm bg-white space-y-3">
                            <div className="flex items-center gap-2 text-sm font-bold text-green-700">
                                <ShieldCheck className="h-5 w-5" /> Secure booking
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Your information is protected by 256-bit SSL encryption.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
