
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


// Updated SuccessContent to handle the `isFinalized` state
function SuccessContent({ booking, isFinalized }: { booking: WithId<Booking>, isFinalized: boolean }) {
    const { user } = useUser();
    // normalizeTimestamp safely handles Date objects and ISO strings
    const checkInDate = normalizeTimestamp(booking.checkIn);
    const checkOutDate = normalizeTimestamp(booking.checkOut);
    
     return (
        <div className="bg-muted/40 min-h-[calc(100vh-4rem)] flex items-center">
            <div className="container mx-auto max-w-2xl py-12 px-4 md:px-6">
                <Card className="shadow-lg">
                    <CardHeader className="items-center text-center bg-green-50/50 dark:bg-green-900/10 pt-8">
                        {isFinalized ? <PartyPopper className="h-12 w-12 text-primary" /> : <Loader2 className="h-12 w-12 text-primary animate-spin" />}
                        <CardTitle className="text-3xl font-headline mt-4">
                           {isFinalized ? "Booking Confirmed!" : "Payment Successful!"}
                        </CardTitle>
                        <CardDescription className="max-w-md">
                           {isFinalized
                                ? `Your Himalayan adventure awaits, ${booking.customerName}. A confirmation email should arrive shortly.`
                                : "We've received your payment and are finalizing the confirmation. This screen will update automatically."
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

// Kept as a fallback for initial load
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


export default function BookingSuccessPage() {
    const params = useParams();
    const firestore = useFirestore();
    const { user } = useUser();
    const bookingId = params.id as string;
    
    // State to hold the optimistic booking data from session storage
    const [optimisticBooking, setOptimisticBooking] = useState<any | null>(null);

    // This effect runs ONLY ONCE on the client to grab the optimistic data
    useEffect(() => {
        const storedBookingData = sessionStorage.getItem('optimisticBooking');
        if (storedBookingData) {
            const parsedBooking = JSON.parse(storedBookingData);
            // Ensure the data is for the booking ID in the URL
            if (parsedBooking.id === bookingId) {
                setOptimisticBooking(parsedBooking);
            }
            // Important: Clean up immediately after reading to prevent reuse.
            sessionStorage.removeItem('optimisticBooking');
        }
    }, [bookingId]);

    // This ref points to the authoritative data source in Firestore
    const bookingRef = useMemoFirebase(() => {
        if (!firestore || !user?.uid || !bookingId) return null;
        return doc(firestore, 'users', user.uid, 'bookings', bookingId);
    }, [firestore, user?.uid, bookingId]);
    
    // This hook fetches the REAL, confirmed data in the background
    const { data: confirmedBooking, error: bookingError } = useDoc<Booking>(bookingRef);

    // Determine the final booking data to display. Prioritize confirmed data.
    const displayBooking = confirmedBooking || optimisticBooking;

    // Determine the status of the booking
    const isFinalized = confirmedBooking?.status === 'CONFIRMED';
    const isFailed = confirmedBooking && confirmedBooking.status !== 'PENDING' && confirmedBooking.status !== 'CONFIRMED';


    // --- RENDER LOGIC ---

    // 1. If there's a hard error from Firestore or the booking has failed
    if (bookingError || isFailed) {
        return <ErrorState bookingId={bookingId} />;
    }

    // 2. If we have ANY booking data (optimistic or confirmed), show the success page.
    if (displayBooking) {
        return <SuccessContent booking={displayBooking} isFinalized={isFinalized} />;
    }
    
    // 3. If we have no data at all yet (e.g., direct navigation, still loading), show a generic processing state.
    return <ProcessingState />;
}
