
'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useUser, useDoc, useMemoFirebase, type WithId } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { normalizeTimestamp } from '@/lib/firestore-utils';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle, PartyPopper, UserPlus, Loader2, AlertCircle, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';


function SuccessContent({ booking, isFinalized }: { booking: WithId<Booking>, isFinalized: boolean }) {
    const { user } = useUser();
    const checkInDate = normalizeTimestamp(booking.checkIn);
    const checkOutDate = normalizeTimestamp(booking.checkOut);
    
     return (
        <div className="bg-muted/40 min-h-[calc(100vh-4rem)] flex items-center">
            <div className="container mx-auto max-w-2xl py-12 px-4 md:px-6">
                <Card className="shadow-lg">
                    <CardHeader className="items-center text-center bg-green-50/50 dark:bg-green-900/10 pt-8">
                        {isFinalized ? <PartyPopper className="h-12 w-12 text-primary" /> : <Loader2 className="h-12 w-12 text-primary animate-spin" />}
                        <CardTitle className="text-3xl font-headline mt-4">
                           {isFinalized ? "Booking Confirmed!" : "Finalizing your confirmation..."}
                        </CardTitle>
                        <CardDescription className="max-w-md">
                           {isFinalized
                                ? `Your Himalayan adventure awaits, ${booking.customerName}. A confirmation email should arrive shortly.`
                                : "We've received your payment and are confirming with the hotel. This page will update automatically."
                           }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <Card className="bg-background">
                            <CardHeader>
                                <CardTitle className="text-xl">{booking.hotelName}</CardTitle>
                                <CardDescription>{booking.hotelCity}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p><strong className="text-foreground">Room:</strong> {booking.roomType}</p>
                                <p><strong className="text-foreground">Check-in:</strong> {!isNaN(checkInDate.getTime()) ? format(checkInDate, 'EEEE, dd MMMM yyyy') : '...'}</p>
                                <p><strong className="text-foreground">Check-out:</strong> {!isNaN(checkOutDate.getTime()) ? format(checkOutDate, 'EEEE, dd MMMM yyyy') : '...'}</p>
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
                                <span className="text-muted-foreground">Confirmation Status</span>
                                {isFinalized ? (
                                     <span className="font-semibold text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Confirmed</span>
                                ) : (
                                     <span className="font-semibold text-amber-600 flex items-center gap-1"><Loader2 className="h-4 w-4 animate-spin" /> Finalizing...</span>
                                )}
                            </div>
                        </div>
                        
                         {user?.isAnonymous && isFinalized && (
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

const ProcessingState = () => {
    return (
        <div className="bg-muted/40 min-h-[calc(100vh-4rem)] flex items-center">
            <div className="container mx-auto max-w-2xl py-12 px-4 md:px-6">
                <Card className="shadow-lg">
                    <CardHeader className="items-center text-center bg-blue-50/50 dark:bg-blue-900/10 pt-8">
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        <CardTitle className="text-3xl font-headline mt-4">Loading Booking Details</CardTitle>
                        <CardDescription className="max-w-md">
                           Just a moment while we fetch your booking information...
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 text-center">
                         <Button className="w-full" asChild>
                            <Link href="/my-bookings">Go to My Bookings</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
};

const ErrorState = ({ bookingId }: { bookingId: string }) => (
     <div className="bg-muted/40 min-h-[calc(100vh-4rem)] flex items-center">
        <div className="container mx-auto max-w-lg py-12 px-4 md:px-6">
            <Card className="text-center border-destructive/50">
                <CardHeader className="items-center">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <CardTitle className="text-3xl font-headline mt-4 text-destructive">Booking Retrieval Error</CardTitle>
                    <CardDescription>
                        We could not retrieve your booking details. This might be a temporary issue. Please contact support with your Booking ID ({bookingId}) or check "My Bookings".
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

const FailedState = ({ booking }: { booking: WithId<Booking> }) => (
     <div className="bg-muted/40 min-h-[calc(100vh-4rem)] flex items-center">
        <div className="container mx-auto max-w-lg py-12 px-4 md:px-6">
            <Card className="text-center border-destructive/50">
                <CardHeader className="items-center">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                    <CardTitle className="text-3xl font-headline mt-4 text-destructive">Booking Failed</CardTitle>
                    <CardDescription>
                        We received your payment, but unfortunately the room became unavailable. Your booking could not be confirmed. A full refund for {booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} has been initiated and will be processed within 5-7 business days.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <Button className="w-full" asChild>
                        <Link href="/my-bookings">View Bookings</Link>
                    </Button>
                    <Button className="w-full" variant="outline" asChild>
                        <Link href="/">Back to Home</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
);


export default function BookingSuccessPage() {
    const params = useParams();
    const firestore = useFirestore();
    const { user } = useUser();
    const bookingId = params.id as string;
    
    const [optimisticBooking, setOptimisticBooking] = useState<any | null>(null);

    useEffect(() => {
        const storedBookingData = sessionStorage.getItem('optimisticBooking');
        if (storedBookingData) {
            const parsedBooking = JSON.parse(storedBookingData);
            if (parsedBooking.id === bookingId) {
                setOptimisticBooking(parsedBooking);
            }
            sessionStorage.removeItem('optimisticBooking');
        }
    }, [bookingId]);

    const bookingRef = useMemoFirebase(() => {
        if (!firestore || !user?.uid || !bookingId) return null;
        return doc(firestore, 'users', user.uid, 'bookings', bookingId);
    }, [firestore, user?.uid, bookingId]);
    
    const { data: confirmedBooking, error: bookingError } = useDoc<Booking>(bookingRef);

    const displayBooking = confirmedBooking || optimisticBooking;

    const isConfirmed = confirmedBooking?.status === 'CONFIRMED';
    const isFailed = confirmedBooking?.status === 'FAILED';

    if (bookingError) {
        return <ErrorState bookingId={bookingId} />;
    }
    
    if (isFailed) {
        return <FailedState booking={confirmedBooking} />;
    }

    if (displayBooking) {
        return <SuccessContent booking={displayBooking} isFinalized={isConfirmed} />;
    }
    
    return <ProcessingState />;
}
