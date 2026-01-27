'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useUser, useDoc, useMemoFirebase, type WithId } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { normalizeTimestamp } from '@/lib/firestore-utils';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle, PartyPopper, UserPlus, Loader2, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';


// Component for CONFIRMED state
function SuccessContent({ booking }: { booking: WithId<Booking> }) {
    const { user } = useUser();
    const checkInDate = normalizeTimestamp(booking.checkIn);
    const checkOutDate = normalizeTimestamp(booking.checkOut);
    
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
                                <CardTitle className="text-xl">{booking.hotelName}</CardTitle>
                                <CardDescription>{booking.hotelCity}</CardDescription>
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

// Component for PENDING/LOADING state
const ProcessingState = ({ showDelayedMessage }: { showDelayedMessage: boolean }) => {
    return (
        <div className="bg-muted/40 min-h-[calc(100vh-4rem)] flex items-center">
            <div className="container mx-auto max-w-2xl py-12 px-4 md:px-6">
                <Card className="shadow-lg">
                    <CardHeader className="items-center text-center bg-blue-50/50 dark:bg-blue-900/10 pt-8">
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        <CardTitle className="text-3xl font-headline mt-4">Processing Your Booking</CardTitle>
                        <CardDescription className="max-w-md">
                           {showDelayedMessage
                                ? "This is taking a bit longer than usual. Please don't worry, your booking is safe and will be confirmed shortly. You can also check 'My Bookings' in a moment."
                                : "Your payment was successful! We are finalizing the confirmation. This page will update automatically."
                           }
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


export default function BookingSuccessPage() {
    const params = useParams();
    const firestore = useFirestore();
    const { user, isLoading: isUserLoading } = useUser();
    const bookingId = params.id as string;
    
    const [showDelayedMessage, setShowDelayedMessage] = useState(false);

    const bookingRef = useMemoFirebase(() => {
        // Only create the ref if we have the user's UID.
        if (!firestore || !user?.uid || !bookingId) return null;
        return doc(firestore, 'users', user.uid, 'bookings', bookingId);
    }, [firestore, user?.uid, bookingId]);
    
    const { data: booking, isLoading: isBookingLoading, error: bookingError } = useDoc<Booking>(bookingRef);

    const isProcessing = isUserLoading || (bookingRef && isBookingLoading && !booking) || (booking && booking.status === 'PENDING');

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        if (isProcessing) {
            // Set a timeout to show the delayed message
            timeoutId = setTimeout(() => {
                setShowDelayedMessage(true);
            }, 10000); // 10 seconds
        }

        return () => {
            // Clear the timeout if the component unmounts or the status changes
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isProcessing]);


    if (isProcessing) {
        return <ProcessingState showDelayedMessage={showDelayedMessage} />;
    }
    
    if (bookingError || !booking) {
        return <ErrorState bookingId={bookingId} />;
    }
    
    if (booking.status === 'CONFIRMED') {
        return <SuccessContent booking={booking} />;
    }
    
    // Fallback for any other unexpected status (e.g. CANCELLED)
    return <ProcessingState showDelayedMessage={showDelayedMessage} />;
}
