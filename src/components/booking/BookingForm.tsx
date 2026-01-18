'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';
import Image from 'next/image';
import { differenceInDays, format, parse } from 'date-fns';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/app/booking/actions';


import type { Hotel, Room, Booking } from '@/lib/types';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';

import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Calendar, Users, BedDouble, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function BookingForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, userProfile } = useUser();
    const { toast } = useToast();
    const firestore = useFirestore();

    const hotelId = searchParams.get('hotelId');
    const roomId = searchParams.get('roomId');
    const checkInStr = searchParams.get('checkIn');
    const checkOutStr = searchParams.get('checkOut');
    const guests = searchParams.get('guests') || '1';
    
    const hotelRef = useMemo(() => {
        if (!firestore || !hotelId) return null;
        return doc(firestore, 'hotels', hotelId);
    }, [firestore, hotelId]);

    const { data: hotel, isLoading: isHotelLoading } = useDoc<Hotel>(hotelRef);

    const roomsQuery = useMemo(() => {
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

    useEffect(() => {
        if (userProfile) {
            setCustomerDetails({ name: userProfile.displayName, email: userProfile.email });
        }
    }, [userProfile]);

    if (isHotelLoading || areRoomsLoading) {
        return <div>Loading...</div> // This will be handled by Suspense fallback
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

    const hotelImage = PlaceHolderImages.find((img) => img.id === hotel.images[0]);
    const totalPrice = room.price * nights;

    const handlePayment = async () => {
        if (!customerDetails.name || !customerDetails.email) {
            toast({
                variant: 'destructive',
                title: 'Missing Details',
                description: 'Please provide your name and email.',
            });
            return;
        }

        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Not Logged In',
                description: 'Please log in to make a booking.',
            });
            router.push(`/login?redirect=/booking?${searchParams.toString()}`);
            return;
        }
        
        setIsBooking(true);

        const orderResponse = await createRazorpayOrder(totalPrice);

        if (!orderResponse.success || !orderResponse.order || !orderResponse.keyId) {
            toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: orderResponse.error || 'Could not initiate payment. Please check server logs.',
            });
            setIsBooking(false);
            return;
        }

        const { order, keyId } = orderResponse;

        const options = {
            key: keyId,
            amount: order.amount,
            currency: order.currency,
            name: "Uttarakhand Getaways",
            description: `Booking for ${hotel.name}`,
            order_id: order.id,
            handler: async (response: any) => {
                const verificationResult = await verifyRazorpayPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                });

                if (verificationResult.success) {
                    const newBookingId = `booking_${Date.now()}`;
                    const bookingRef = doc(firestore, 'users', user.uid, 'bookings', newBookingId);
                    
                    const bookingData: Booking = {
                        id: newBookingId,
                        hotelId: hotel.id,
                        userId: user.uid,
                        roomId: room.id,
                        roomType: room.type,
                        checkIn: checkIn,
                        checkOut: checkOut,
                        guests: parseInt(guests),
                        totalPrice: totalPrice,
                        customerName: customerDetails.name,
                        customerEmail: customerDetails.email,
                        status: 'CONFIRMED',
                        createdAt: new Date(),
                        razorpayPaymentId: response.razorpay_payment_id,
                    };
                    
                    await setDoc(bookingRef, bookingData);
                    
                    toast({
                        title: "Booking Confirmed!",
                        description: "Your payment was successful. You can find your booking details under 'My Bookings'."
                    });
                    router.push(`/my-bookings`);

                } else {
                    toast({
                        variant: "destructive",
                        title: "Payment Verification Failed",
                        description: "Your payment could not be verified. Please contact support.",
                    });
                    setIsBooking(false);
                }
            },
            prefill: {
                name: customerDetails.name,
                email: customerDetails.email,
            },
            theme: {
                color: "#166534", // primary theme color
            },
            modal: {
                ondismiss: () => {
                    setIsBooking(false);
                    toast({
                        variant: 'destructive',
                        title: 'Payment Cancelled',
                        description: 'You cancelled the payment process.',
                    })
                }
            }
        };

        try {
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch(e) {
            console.error(e);
            toast({
                variant: "destructive",
                title: "Payment Error",
                description: "Failed to open payment gateway. Please refresh and try again.",
            });
            setIsBooking(false);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
            <Link href={`/hotels/${hotel.id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
                <ArrowLeft className="h-4 w-4" />
                Back to Hotel
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-6">
                    <h1 className="font-headline text-3xl font-bold">Review Your Booking</h1>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">{hotel.name}</CardTitle>
                            <CardDescription>{hotel.city}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {hotelImage && (
                                <div className="relative h-48 w-full overflow-hidden rounded-lg mb-4">
                                    <Image src={hotelImage.imageUrl} alt={hotel.name} data-ai-hint={hotelImage.imageHint} fill className="object-cover" />
                                </div>
                            )}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <BedDouble className="h-5 w-5" />
                                    <span>{room.type} Room</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Calendar className="h-5 w-5" />
                                    <span>{format(checkIn, 'EEE, LLL dd')} - {format(checkOut, 'EEE, LLL dd')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Users className="h-5 w-5" />
                                    <span>{guests} Guest(s)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <h2 className="font-headline text-3xl font-bold">Confirm & Book</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Guest Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor='customerName'>Full Name</Label>
                                <Input
                                    id="customerName"
                                    placeholder="Your Name"
                                    value={customerDetails.name}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor='customerEmail'>Email Address</Label>
                                <Input
                                    id="customerEmail"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={customerDetails.email}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Price Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span>{room.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })} x {nights} nights</span>
                                <span>{totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground text-sm">
                                <span>Taxes & Fees</span>
                                <span>Included</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                <span>Total Amount</span>
                                <span>{totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Button onClick={handlePayment} size="lg" className="w-full text-lg" disabled={isBooking}>
                        {isBooking && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {isBooking ? 'Processing...' : `Pay ${totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })} & Book`}
                    </Button>
                </div>
            </div>
        </div>
    );
}
