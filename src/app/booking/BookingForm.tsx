'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';
import Image from 'next/image';
import { differenceInDays, format, parse } from 'date-fns';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/app/booking/actions';
import { signInAnonymously } from 'firebase/auth';


import type { Hotel, Room, Booking } from '@/lib/types';
import { useUser, useFirestore, useDoc, useCollection, useAuth } from '@/firebase';
import { doc, runTransaction, collection, increment } from 'firebase/firestore';

import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Calendar, Users, BedDouble, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { dummyHotels, dummyRooms } from '@/lib/dummy-data';
import { BookingFormSkeleton } from './BookingFormSkeleton';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function BookingForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, userProfile } = useUser();
    const auth = useAuth(); // For guest checkout
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

    const { data: liveHotel, isLoading: isHotelLoading } = useDoc<Hotel>(hotelRef);
    
    const hotel = useMemo(() => {
        if (isHotelLoading) return null;
        if (liveHotel) return liveHotel;
        return dummyHotels.find(h => h.id === hotelId);
    }, [isHotelLoading, liveHotel, hotelId]);

    const roomsQuery = useMemo(() => {
        if (!firestore || !hotelId) return null;
        return collection(firestore, 'hotels', hotelId, 'rooms');
    }, [firestore, hotelId]);
    
    const { data: liveRooms, isLoading: areRoomsLoading } = useCollection<Room>(roomsQuery);

    const room = useMemo(() => {
        if (areRoomsLoading) return null;
        const liveRoom = liveRooms?.find(r => r.id === roomId);
        if (liveRoom) return liveRoom;
        return dummyRooms.find(r => r.id === roomId && r.hotelId === hotelId);
    }, [areRoomsLoading, liveRooms, roomId, hotelId]);


    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '' });
    const [isBooking, setIsBooking] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);


    useEffect(() => {
        if (userProfile) {
            setCustomerDetails({ name: userProfile.displayName, email: userProfile.email });
        }
    }, [userProfile]);

    const isLoading = isHotelLoading || areRoomsLoading;

    if (isLoading) {
        return <BookingFormSkeleton />; // Use the skeleton component
    }

    if (!hotelId || !roomId || !checkInStr || !checkOutStr) {
        return notFound();
    }
    
    if (!hotel || !room) {
        return (
            <div className="container mx-auto max-w-lg py-12 px-4 md:px-6 text-center">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-destructive">Booking Details Not Found</CardTitle>
                        <CardDescription>
                            We couldn't find the hotel or room you're trying to book. The link
                            may be outdated or incorrect.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Please go back and try selecting the hotel and room again.
                        </p>
                        <Button asChild>
                            <Link href="/search">Explore Hotels</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
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
        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
            toast({
                variant: 'destructive',
                title: 'Payment Gateway Not Configured',
                description: 'The payment gateway is not set up correctly. Please contact support.',
            });
            console.error("CRITICAL: NEXT_PUBLIC_RAZORPAY_KEY_ID environment variable is not set.");
            setIsBooking(false);
            return;
        }

        if (!customerDetails.name || !customerDetails.email) {
            toast({
                variant: 'destructive',
                title: 'Missing Details',
                description: 'Please provide your name and email.',
            });
            return;
        }

        if (!firestore) {
            toast({ variant: 'destructive', title: 'Database not available' });
            return;
        }
        
        setIsBooking(true);

        let userIdForBooking = user?.uid;

        if (!userIdForBooking) {
            if (!auth) {
                 toast({ variant: 'destructive', title: 'Authentication service not available' });
                 setIsBooking(false);
                 return;
            }
            try {
                const userCredential = await signInAnonymously(auth);
                userIdForBooking = userCredential.user.uid;
                toast({
                    title: 'Booking as Guest',
                    description: 'Your booking will be saved temporarily. Create an account to view it anytime.',
                });
            } catch (error) {
                console.error("Anonymous sign-in failed:", error);
                toast({
                    variant: 'destructive',
                    title: 'Guest Checkout Failed',
                    description: 'Could not proceed with the booking. Please try again.',
                });
                setIsBooking(false);
                return;
            }
        }


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
                    try {
                      await runTransaction(firestore, async (transaction) => {
                        const roomRef = doc(firestore, 'hotels', hotel.id, 'rooms', room.id);
                        const roomDoc = await transaction.get(roomRef);

                        if (!roomDoc.exists() || (roomDoc.data().availableRooms || 0) <= 0) {
                            throw new Error("This room just got sold out!");
                        }
                        
                        transaction.update(roomRef, { availableRooms: increment(-1) });

                        const bookingRef = doc(firestore, 'users', userIdForBooking!, 'bookings', newBookingId);
                        
                        const bookingData: Booking = {
                            id: newBookingId,
                            hotelId: hotel.id,
                            userId: userIdForBooking!,
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
                        transaction.set(bookingRef, bookingData);
                      });
                      
                      // If transaction completes successfully, we get here.
                      toast({
                        title: "Booking Confirmed!",
                        description: "Your payment was successful. You'll be redirected shortly."
                      });
                      router.push(`/booking/success/${newBookingId}`);

                    } catch (e: any) {
                         console.error("Error writing booking to firestore: ", e);
                         toast({
                            variant: "destructive",
                            title: "Booking Failed",
                            description: e.message === 'This room just got sold out!'
                                ? e.message
                                : "Your payment was successful, but we couldn't save your booking. Please contact support.",
                        });
                        setIsBooking(false);
                    }

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
                color: "#0b57d0", // MMT blue
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
        <div className="container mx-auto max-w-4xl py-8 md:py-12 px-4 md:px-6">
            <Link href={`/hotels/${hotel.id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
                <ArrowLeft className="h-4 w-4" />
                Back to Hotel
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-6">
                    <h1 className="font-headline text-2xl font-bold md:text-3xl">Review Your Booking</h1>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">{hotel.name}</CardTitle>
                            <CardDescription>{hotel.city}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {hotelImage && (
                                <div className="relative w-full aspect-video overflow-hidden rounded-lg mb-4">
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
                    <h2 className="font-headline text-2xl font-bold md:text-3xl">Confirm & Book</h2>
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
                                <span>Taxes &amp; Fees</span>
                                <span>Included</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                <span>Total Amount</span>
                                <span>{totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                            </div>
                        </CardContent>
                    </Card>

                     <div className="items-top flex space-x-3">
                        <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} className="mt-0.5" />
                        <div className="grid gap-1.5 leading-none">
                            <label
                            htmlFor="terms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                            I understand and agree to the rules of this hotel and Uttarakhand Getaways' <Link href="/terms" target="_blank" className="text-primary font-semibold hover:underline">Terms of Use</Link> &amp; <Link href="/privacy" target="_blank" className="text-primary font-semibold hover:underline">Privacy Policy</Link>.
                            </label>
                        </div>
                    </div>


                    <Button onClick={handlePayment} size="lg" className="w-full text-lg h-14 bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-accent/50" disabled={isBooking || !termsAccepted}>
                        {isBooking && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {isBooking ? 'Processing...' : `Pay ${totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })} & Book`}
                    </Button>
                </div>
            </div>
        </div>
    );
}
