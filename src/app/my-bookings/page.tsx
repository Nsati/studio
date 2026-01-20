'use client';

import React, { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import type { Booking, Hotel } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar, Hotel as HotelIcon, Home, Loader2, Download, Ban } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

function BookingItemSkeleton() {
    return (
        <Card className="overflow-hidden shadow-md">
            <div className="flex flex-col md:flex-row">
                <div className="relative h-48 w-full md:w-1/3 md:h-auto flex-shrink-0">
                    <Skeleton className="h-full w-full"/>
                </div>
                <div className="flex flex-col flex-grow justify-between p-4 sm:p-6">
                    <div>
                        <Skeleton className="h-8 w-3/4 mb-2" />
                        <Skeleton className="h-5 w-1/4 mb-4" />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-3/5" />
                            <Skeleton className="h-5 w-2/5" />
                            <Skeleton className="h-5 w-full sm:col-span-2" />
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-6 w-1/2" />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-6">
                        <Skeleton className="h-9 w-28" />
                        <Skeleton className="h-9 w-36" />
                        <Skeleton className="h-9 w-36" />
                    </div>
                </div>
            </div>
        </Card>
    );
}


function BookingItem({ booking }: { booking: Booking }) {
    const firestore = useFirestore();

    const hotelRef = useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'hotels', booking.hotelId);
    }, [firestore, booking.hotelId]);

    const { data: hotel, isLoading } = useDoc<Hotel>(hotelRef);


    if (isLoading) {
        return <BookingItemSkeleton />;
    }

    if (!hotel) {
        return (
            <Card className="p-4 border-destructive">
                <p className="font-bold text-destructive">Hotel data not found for this booking.</p>
                <p className="text-sm text-muted-foreground">The hotel might have been removed.</p>
                <p className="mt-2 font-mono text-xs">Booking ID: {booking.id}</p>
            </Card>
        )
    }
    
    const hotelImage = PlaceHolderImages.find(
        (img) => img.id === hotel.images[0]
    );

    const checkInDate = (booking.checkIn as any).toDate ? (booking.checkIn as any).toDate() : new Date(booking.checkIn);
    const checkOutDate = (booking.checkOut as any).toDate ? (booking.checkOut as any).toDate() : new Date(booking.checkOut);

    return (
        <Card key={booking.id} className="overflow-hidden shadow-md transition-shadow hover:shadow-lg">
            <div className="flex flex-col md:flex-row">
                {/* Column 1: Image */}
                <div className="relative w-full aspect-video md:w-1/3 md:aspect-auto flex-shrink-0">
                    {hotelImage ? (
                        <Image
                            src={hotelImage.imageUrl}
                            alt={hotel.name}
                            data-ai-hint={hotelImage.imageHint}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                            <HotelIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* Column 2: Details */}
                <div className="flex flex-col flex-grow justify-between p-4 sm:p-6">
                    <div>
                        <h3 className="font-headline text-xl sm:text-2xl font-bold hover:text-primary">
                            <Link href={`/hotels/${hotel.id}`}>{hotel.name}</Link>
                        </h3>
                        <p className="text-muted-foreground mb-4">{hotel.city}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <p><span className="font-semibold text-foreground">Check-in:</span> {format(checkInDate, 'dd MMM yyyy')}</p>
                            <p><span className="font-semibold text-foreground">Check-out:</span> {format(checkOutDate, 'dd MMM yyyy')}</p>
                            <p><span className="font-semibold text-foreground">Room:</span> {booking.roomType}</p>
                            <p><span className="font-semibold text-foreground">Guests:</span> {booking.guests}</p>
                            <p className="col-span-1 sm:col-span-2"><span className="font-semibold text-foreground">Booking ID:</span> <span className="font-mono text-xs">{booking.id}</span></p>
                            <p><span className="font-semibold text-foreground">Amount Paid:</span> <span className="font-bold text-foreground">{booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span></p>
                            <div className="flex items-center">
                                <span className="font-semibold text-foreground mr-2">Payment Status:</span>
                                <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'destructive'} className="capitalize">
                                    {booking.status === 'CONFIRMED' ? '✅ ' : ''}
                                    {booking.status?.toLowerCase()}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-6">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/hotels/${hotel.id}`}>View Details</Link>
                        </Button>
                        <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Download Invoice</Button>
                        {booking.status === 'CONFIRMED' && (
                            <Button variant="destructive" size="sm"><Ban className="mr-2 h-4 w-4" /> Cancel Booking</Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}


export default function MyBookingsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/my-bookings');
    }
  }, [user, isUserLoading, router]);
  
  const bookingsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'bookings');
  }, [firestore, user]);

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

  const isLoading = isUserLoading || areBookingsLoading;

  if (isLoading || !user) {
    return (
        <div className="container mx-auto max-w-5xl py-12 px-4 md:px-6">
            <div className="mb-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-5 w-1/2 mt-4" />
            </div>
            <div className="space-y-8">
                <BookingItemSkeleton />
                <BookingItemSkeleton />
            </div>
        </div>
    );
  }

  return (
    <div className="bg-muted/40 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-5xl py-12 px-4 md:px-6">
        <div className="mb-8">
            <h1 className="font-headline text-3xl font-bold md:text-4xl">My Bookings</h1>
            <p className="mt-2 text-base text-muted-foreground md:text-lg">
            Here are all the amazing trips you've planned with us.
            </p>
        </div>

        {bookings?.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed bg-transparent">
            <CardHeader>
                <CardTitle className="font-headline">No Bookings Yet</CardTitle>
                <CardDescription>
                You haven't booked any stays with us. Let's find your next
                adventure!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                <Link href="/search">
                    <Home className="mr-2 h-4 w-4" />
                    Explore Hotels
                </Link>
                </Button>
            </CardContent>
            </Card>
        ) : (
            <div className="space-y-8">
            {bookings?.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
            ))}
            </div>
        )}
        </div>
    </div>
  );
}
