'use client';

import { useParams, useRouter, notFound } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useEffect, useMemo } from 'react';
import type { Booking, Hotel } from '@/lib/types';
import { generateBookingConfirmationEmail } from '@/ai/flows/generate-booking-confirmation-email';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, PartyPopper } from 'lucide-react';
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


export default function BookingSuccessPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const bookingId = params.id as string;

    const bookingRef = useMemo(() => {
        if (!firestore || !user || !bookingId) return null;
        return doc(firestore, 'users', user.uid, 'bookings', bookingId);
    }, [firestore, user, bookingId]);

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
                console.log("---- BOOKING CONFIRMATION EMAIL ----");
                console.log("SUBJECT:", email.subject);
                console.log("BODY:", email.body);
                console.log("---- In production, this would be sent via an email service. ----");
                toast({
                    title: "Confirmation Email Generated",
                    description: "Check server console for email content (dev only).",
                });
            }).catch(err => {
                console.error("Failed to generate confirmation email:", err);
            });
        }
    }, [booking, hotel, toast]);
    
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

                         <div className="flex flex-col sm:flex-row gap-4">
                            <Button className="w-full" asChild>
                                <Link href="/my-bookings">View All My Bookings</Link>
                            </Button>
                            <Button className="w-full" variant="outline" asChild>
                                <Link href="/">Back to Home</Link>
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground text-center">A confirmation email has been generated. In a real app, this would be sent to {booking.customerEmail}.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
