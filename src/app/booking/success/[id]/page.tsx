
'use client';

import { useParams, useRouter, notFound } from 'next/navigation';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import type { Booking, Hotel } from '@/lib/types';
import { generateTripGuide, type TripAssistantOutput } from '@/ai/flows/generate-arrival-assistant';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle, PartyPopper, UserPlus, Bot, Map, ParkingCircle, Clock, Lightbulb, Loader2, Mountain, UtensilsCrossed, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function TripAssistant({ hotel, booking }: { hotel: Hotel, booking: Booking }) {
    const [guide, setGuide] = useState<TripAssistantOutput | null>(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [error, setError] = useState('');

    const generateGuide = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const checkInDate = (booking.checkIn as any).toDate ? (booking.checkIn as any).toDate() : new Date(booking.checkIn);
            const result = await generateTripGuide({
                hotelName: hotel.name,
                hotelCity: hotel.city,
                hotelAddress: hotel.address,
                customerName: booking.customerName,
                checkInDate: format(checkInDate, 'PPPP'),
            });
            setGuide(result);
        } catch (err) {
            console.error("Failed to generate trip guide:", err);
            setError("Sorry, the assistant is currently unavailable. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        generateGuide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotel, booking]);

    if (isGenerating) {
        return (
            <Card className="bg-primary/5 border-primary/20 mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-primary">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Generating Your Personal Trip Assistant...
                    </CardTitle>
                    <CardDescription>Our AI is crafting personalized tips for your trip. Please wait a moment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <Skeleton className="h-5 w-full" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="bg-destructive/10 border-destructive/20 mt-6 text-center">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                        <Bot className="h-6 w-6 text-destructive" />
                        Assistant Unavailable
                    </CardTitle>
                    <CardDescription className="text-destructive/80">{error}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={generateGuide} variant="secondary">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        )
    }
    
    if (guide) {
        return (
             <Card className="bg-primary/5 border-primary/20 mt-6">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Bot className="h-6 w-6 text-primary" /> Your Smart Trip Assistant
                    </CardTitle>
                    <CardDescription>{guide.welcomeMessage}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                        <div className="flex gap-3 items-start">
                            <Map className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                            <div><strong className="block text-foreground">Navigation</strong> <a href={guide.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">Get Directions</a></div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <ParkingCircle className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                            <div><strong className="block text-foreground">Parking</strong> {guide.parkingInfo}</div>
                        </div>
                         <div className="flex gap-3 items-start">
                            <Clock className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                            <div><strong className="block text-foreground">Check-in</strong> {guide.checkInReminder}</div>
                        </div>
                         <div className="flex gap-3 items-start">
                            <Lightbulb className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                            <div><strong className="block text-foreground">Local Tip</strong> {guide.localTip}</div>
                        </div>
                         <div className="flex gap-3 items-start">
                            <Mountain className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                            <div><strong className="block text-foreground">Activity Suggestion</strong> {guide.suggestedActivity}</div>
                        </div>
                         <div className="flex gap-3 items-start">
                            <UtensilsCrossed className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                            <div><strong className="block text-foreground">Must-Try Cuisine</strong> {guide.localCuisineRecommendation}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return null;
}

export default function BookingSuccessPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: isUserLoading } = useUser();
    const firestore = useFirestore();

    const bookingId = params.id as string;
    
    // Guest checkout may result in an anonymous user. We need their UID.
    const userIdForBooking = useMemo(() => user?.uid, [user]);

    // This reference is now stable and will trigger useDoc only when the user/bookingId changes.
    const bookingRef = useMemo(() => {
        if (!firestore || !userIdForBooking || !bookingId) return null;
        return doc(firestore, 'users', userIdForBooking, 'bookings', bookingId);
    }, [firestore, userIdForBooking, bookingId]);

    // useDoc is a real-time listener. It will automatically update when the booking status changes.
    const { data: booking, isLoading: isBookingLoading } = useDoc<Booking>(bookingRef);

    const hotelRef = useMemo(() => {
        if (!firestore || !booking) return null;
        return doc(firestore, 'hotels', booking.hotelId);
    }, [firestore, booking]);
    
    const { data: hotel, isLoading: isHotelLoading } = useDoc<Hotel>(hotelRef);
    
    // Redirect to login if user is not authenticated after loading.
    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/login');
        }
    }, [user, isUserLoading, router]);
    
    // This combines all loading states into one.
    const isLoading = isUserLoading || isBookingLoading || isHotelLoading;

    // The key change: The "Processing" state is now tied to the real-time hook's loading state
    // AND the booking status itself. It will show this screen until the status is no longer 'PENDING'.
    if (isLoading || (booking && booking.status === 'PENDING')) {
        return (
            <div className="bg-muted/40 min-h-[calc(100vh-4rem)] flex items-center">
                <div className="container mx-auto max-w-lg py-12 px-4 md:px-6">
                    <Card className="text-center">
                        <CardHeader className="items-center">
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            <CardTitle className="text-3xl font-headline mt-4">Confirming Your Booking</CardTitle>
                            <CardDescription>
                                Your payment was successful! We are finalizing your booking with the hotel. This may take a moment.
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
    
    // If loading is complete AND the booking is still not found or not confirmed, show an error.
    if (!booking || !hotel || booking.status !== 'CONFIRMED') {
        return notFound();
    }

    // --- Success UI ---
    const checkInDate = (booking.checkIn as any).toDate ? (booking.checkIn as any).toDate() : new Date(booking.checkIn);
    const checkOutDate = (booking.checkOut as any).toDate ? (booking.checkOut as any).toDate() : new Date(booking.checkOut);

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
                        
                        <TripAssistant hotel={hotel} booking={booking} />

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
