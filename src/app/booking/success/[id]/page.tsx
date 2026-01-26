
'use client';

import { useParams, notFound } from 'next/navigation';
import { useFirestore, useUser, useDoc, useMemoFirebase, type WithId } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Booking, Hotel } from '@/lib/types';
import { normalizeTimestamp } from '@/lib/firestore-utils';
import { useState, useEffect } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle, PartyPopper, UserPlus, Loader2, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


function SuccessContent({ booking, hotel }: { booking: WithId<Booking>, hotel: WithId<Hotel> }) {
    const { user } = useUser();
    const checkInDate = normalizeTimestamp(booking.checkIn);
    const checkOutDate = normalizeTimestamp(booking.checkOut);

    if (booking.status !== 'CONFIRMED') {
         return (
            <div className="bg-muted/40 min-h-[calc(100vh-4rem)] flex items-center">
                <div className="container mx-auto max-w-lg py-12 px-4 md:px-6">
                    <Card className="text-center border-amber-500">
                        <CardHeader className="items-center">
                            <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
                            <CardTitle className="text-3xl font-headline mt-4 text-amber-700">Confirmation Pending</CardTitle>
                            <CardDescription>
                                We received your payment, but we're still finalizing the confirmation. This can happen due to high traffic. Please check "My Bookings" in a few minutes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-4">
                            <Button className="w-full" asChild>
                                <Link href="/my-bookings">Go to My Bookings</Link>
                            </Button>
                            <Button className="w-full" variant="outline" asChild>
                                <Link href="/">Back to Home</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }
    
     return (
        <div className="bg-muted/40 min-h-[calc(100vh-4rem)] flex items-center">
            <div className="container mx-auto max-w-2xl py-12 px-4 md:px-6">
                <Card className="shadow-lg">
                    <CardHeader className="items-center text-center bg-green-50/50 dark:bg-green-900/10 pt-8">
                        <PartyPopper className="h-12 w-12 text-primary" />
                        <CardTitle className="text-3xl font-headline mt-4">Booking Confirmed!</CardTitle>
                        <CardDescription className="max-w-md">
                           Your Himalayan adventure awaits, {booking.customerName}. A confirmation email should arrive shortly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <Card className="bg-background">
                            <CardHeader>
                                <CardTitle className="text-xl">{hotel.name}</CardTitle>
                                <CardDescription>{hotel.city}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p><strong className="text-foreground">Room:</strong> {booking.roomType}</p>
                                <p><strong className="text-foreground">Check-in:</strong> {format(checkInDate, 'EEEE, dd MMMM yyyy')}</p>
                                <p><strong className="text-foreground">Check-out:</strong> {format(checkOutDate, 'EEEE, dd MMMM yyyy')}</p>
                                <p><strong className="text-foreground">Guests:</strong> {booking.guests}</p>
                            </CardContent>
                        </Card>

                        <div className="rounded-lg border bg-background p-4 space-y-2">
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Booking ID</span>
                                <span className="font-mono text-xs">{booking.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Amount Paid</span>
                                <span className="font-bold text-lg">{booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Payment Status</span>
                                <span className="font-semibold text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Confirmed</span>
                            </div>
                        </div>
                        
                         {user?.isAnonymous && (
                            <Card className="bg-blue-50 border-blue-200">
                                <CardHeader className="flex-row items-center gap-4 space-y-0">
                                    <UserPlus className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <CardTitle className="text-lg text-blue-900">Save Your Booking!</CardTitle>
                                        <CardDescription className="text-blue-800">Create an account to view this booking anytime and manage future trips.</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                                        <Link href="/signup">Sign Up for Free</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}


                         <div className="flex flex-col sm:flex-row gap-4">
                            <Button className="w-full" asChild>
                                <Link href="/my-bookings">{user?.isAnonymous ? 'Explore More Hotels' : 'View All My Bookings'}</Link>
                            </Button>
                            <Button className="w-full" variant="outline" asChild>
                                <Link href="/">Back to Home</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function BookingSuccessPage() {
    const params = useParams();
    const firestore = useFirestore();
    const bookingId = params.id as string;
    
    const { user, isLoading: isUserLoading } = useUser();
    const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(true);

    const bookingRef = useMemoFirebase(() => {
        if (!firestore || !user || !bookingId) return null;
        return doc(firestore, 'users', user.uid, 'bookings', bookingId);
    }, [firestore, user, bookingId]);
    
    const { data: booking, isLoading: isBookingLoading } = useDoc<Booking>(bookingRef);

    const hotelRef = useMemoFirebase(() => {
        if (!firestore || !booking) return null;
        return doc(firestore, 'hotels', booking.hotelId);
    }, [firestore, booking]);
    
    const { data: hotel, isLoading: isHotelLoading } = useDoc<Hotel>(hotelRef);

    useEffect(() => {
        if (booking) {
            if (booking.status === 'CONFIRMED') {
                setIsAwaitingConfirmation(false);
            } else {
                // If the status is not confirmed, set a timeout.
                // The onSnapshot listener in useDoc will handle the update if it comes in time.
                const timer = setTimeout(() => {
                    setIsAwaitingConfirmation(false); // Stop waiting after 15 seconds
                }, 15000);

                return () => clearTimeout(timer); // Cleanup the timer
            }
        }
    }, [booking]);

    const isLoading = isUserLoading || isBookingLoading || (booking && isHotelLoading) || (booking && booking.status !== 'CONFIRMED' && isAwaitingConfirmation);

    if (isLoading) {
        return (
            <div className="bg-muted/40 min-h-[calc(100vh-4rem)] flex items-center">
                <div className="container mx-auto max-w-lg py-12 px-4 md:px-6">
                    <Card className="text-center">
                        <CardHeader className="items-center">
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            <CardTitle className="text-3xl font-headline mt-4">Finalizing Your Confirmation</CardTitle>
                            <CardDescription>
                                Your payment was successful! Please wait a moment while we confirm your booking with the hotel.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <p className="text-sm text-muted-foreground">Please do not refresh or close this page.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }
    
    if (!booking || !hotel) {
         return (
            <div className="bg-muted/40 min-h-[calc(100vh-4rem)] flex items-center">
                <div className="container mx-auto max-w-lg py-12 px-4 md:px-6">
                    <Card className="text-center border-destructive">
                        <CardHeader className="items-center">
                            <AlertCircle className="h-12 w-12 text-destructive" />
                            <CardTitle className="text-3xl font-headline mt-4">Booking Not Found</CardTitle>
                            <CardDescription>
                                We couldn't find the details for this booking. It might have been cancelled or the link is incorrect.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-4">
                            <Button className="w-full" asChild>
                                <Link href="/my-bookings">Go to My Bookings</Link>
                            </Button>
                            <Button className="w-full" variant="outline" asChild>
                                <Link href="/">Back to Home</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }
    
    return <SuccessContent booking={booking} hotel={hotel} />;
}
