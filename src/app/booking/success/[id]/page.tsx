'use client';

import { useParams, useRouter, notFound } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import type { Booking, Hotel } from '@/lib/types';
import { generateBookingConfirmationEmail } from '@/ai/flows/generate-booking-confirmation-email';
import { generateArrivalGuide, type ArrivalAssistantOutput } from '@/ai/flows/generate-arrival-assistant';

import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, PartyPopper, UserPlus, Bot, Map, ParkingCircle, Clock, Lightbulb, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function SuccessPageSkeleton() {
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4 md:px-6">
      <Card>
        <CardHeader className="items-center text-center">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-8 w-48 mt-4" />
            <Skeleton className="h-5 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2 rounded-lg border p-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="space-y-2 rounded-lg border p-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
            </div>
            <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

function ArrivalAssistant({ hotel, booking }: { hotel: Hotel, booking: Booking }) {
    const [guide, setGuide] = useState<ArrivalAssistantOutput | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateGuide = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const checkInDate = (booking.checkIn as any).toDate ? (booking.checkIn as any).toDate() : new Date(booking.checkIn);
            const result = await generateArrivalGuide({
                hotelName: hotel.name,
                hotelCity: hotel.city,
                hotelAddress: hotel.address,
                customerName: booking.customerName,
                checkInDate: format(checkInDate, 'PPPP'),
            });
            setGuide(result);
        } catch (err) {
            console.error("Failed to generate arrival guide:", err);
            setError("Sorry, the assistant is currently unavailable. Please try again later.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    if (guide) {
        return (
             <Card className="bg-primary/5 border-primary/20 mt-6">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Bot className="h-6 w-6 text-primary" /> Your Smart Arrival Guide
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <p>{guide.welcomeMessage}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-primary/5 border-primary/20 mt-6 text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                    <Bot className="h-6 w-6 text-primary" />
                    Activate Smart Arrival Assistant
                </CardTitle>
                <CardDescription>Get personalized directions, tips, and reminders for your arrival.</CardDescription>
            </CardHeader>
            <CardContent>
                {isGenerating ? (
                    <Button disabled className="w-full">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Your Guide...
                    </Button>
                ) : (
                    <Button onClick={handleGenerateGuide} className="w-full">
                        Generate Your Arrival Guide
                    </Button>
                )}
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </CardContent>
        </Card>
    )

}


export default function BookingSuccessPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const bookingId = params.id as string;

    const userIdForBooking = useMemo(() => {
        if (user) return user.uid;
        return null;
    },[user]);

    const bookingRef = useMemo(() => {
        if (!firestore || !userIdForBooking || !bookingId) return null;
        return doc(firestore, 'users', userIdForBooking, 'bookings', bookingId);
    }, [firestore, userIdForBooking, bookingId]);

    const { data: booking, isLoading: isBookingLoading } = useDoc<Booking>(bookingRef);

    const hotelRef = useMemo(() => {
        if (!firestore || !booking) return null;
        return doc(firestore, 'hotels', booking.hotelId);
    }, [firestore, booking]);
    
    const { data: hotel, isLoading: isHotelLoading } = useDoc<Hotel>(hotelRef);
    
    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/login');
        }
    }, [user, isUserLoading, router]);
    
    useEffect(() => {
        if (booking && hotel) {
            generateBookingConfirmationEmail({
                hotelName: hotel.name,
                customerName: booking.customerName,
                checkIn: (booking.checkIn as any).toDate ? (booking.checkIn as any).toDate().toISOString() : new Date(booking.checkIn).toISOString(),
                checkOut: (booking.checkOut as any).toDate ? (booking.checkOut as any).toDate().toISOString() : new Date(booking.checkOut).toISOString(),
                roomType: booking.roomType,
                totalPrice: booking.totalPrice,
                bookingId: booking.id!,
            }).then(email => {
                console.log("---- BOOKING CONFIRMATION EMAIL (DEV ONLY) ----");
                console.log("SUBJECT:", email.subject);
                console.log("BODY:", email.body);
            }).catch(err => {
                console.error("Failed to generate confirmation email:", err);
            });
        }
    }, [booking, hotel]);
    
    const isLoading = isUserLoading || isBookingLoading || isHotelLoading;

    if (isLoading) {
        return <SuccessPageSkeleton />
    }

    if (!booking || !hotel) {
        return notFound();
    }

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
                           Your Himalayan adventure awaits, {booking.customerName}. Get ready for an unforgettable experience.
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
                        
                        <ArrivalAssistant hotel={hotel} booking={booking} />

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

                        <p className="text-xs text-muted-foreground text-center">A confirmation email has been generated and logged to the server console for development purposes.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
