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
  CardFooter,
} from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar, Hotel as HotelIcon, Home, Users, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

function BookingItem({ booking }: { booking: Booking }) {
    const firestore = useFirestore();

    const hotelRef = useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'hotels', booking.hotelId);
    }, [firestore, booking.hotelId]);

    const { data: hotel, isLoading } = useDoc<Hotel>(hotelRef);


    if (isLoading) {
        return (
            <Card className="overflow-hidden shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="relative h-56 md:h-full">
                        <Skeleton className="h-full w-full"/>
                    </div>
                     <div className="col-span-2 flex flex-col p-6 space-y-4">
                        <Skeleton className="h-7 w-3/4"/>
                        <Skeleton className="h-4 w-1/2"/>
                        <div className="grid gap-x-6 gap-y-4 pt-4 md:grid-cols-2">
                            <Skeleton className="h-10 w-full"/>
                            <Skeleton className="h-10 w-full"/>
                            <Skeleton className="h-10 w-full"/>
                            <Skeleton className="h-10 w-full"/>
                        </div>
                        <div className="flex-grow"></div>
                        <div className="border-t pt-4 flex justify-between items-end">
                             <Skeleton className="h-6 w-20" />
                             <div className="text-right space-y-1">
                                <Skeleton className="h-4 w-16 ml-auto" />
                                <Skeleton className="h-7 w-24 ml-auto" />
                             </div>
                        </div>
                     </div>
                </div>
            </Card>
        )
    }

    if (!hotel) {
        return (
            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle>Booking for an unknown hotel</CardTitle>
                    <CardDescription>
                        Booking ID: <span className="font-mono">{booking.id}</span>
                    </CardDescription>
                </CardHeader>
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
            <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="relative h-56 md:h-full">
                    {hotelImage && (
                    <Image
                        src={hotelImage.imageUrl}
                        alt={hotel.name}
                        data-ai-hint={hotelImage.imageHint}
                        fill
                        className="object-cover"
                    />
                    )}
                </div>
                <div className="col-span-2 flex flex-col p-6">
                    <CardHeader className="p-0">
                        <CardTitle className="font-headline text-2xl hover:text-primary">
                            <Link href={`/hotels/${hotel.id}`}>{hotel.name}</Link>
                        </CardTitle>
                        <CardDescription>
                            Booking ID: <span className="font-mono text-xs">{booking.id}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow p-0 mt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <div className="flex items-center gap-2">
                                <HotelIcon className="h-5 w-5 text-primary flex-shrink-0" />
                                <span>{booking.roomType} Room</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary flex-shrink-0" />
                                <span>{booking.guests} Guests</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold">Check-in</span>
                                    <p className="text-muted-foreground">{format(checkInDate, 'EEE, LLL dd, yyyy')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold">Check-out</span>
                                    <p className="text-muted-foreground">{format(checkOutDate, 'EEE, LLL dd, yyyy')}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-0 pt-6 mt-auto">
                        <div className="flex w-full items-end justify-between">
                            <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'destructive'} className="capitalize">
                                {booking.status?.toLowerCase()}
                            </Badge>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total Paid</p>
                                <p className="font-headline text-2xl font-bold">₹{booking.totalPrice.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardFooter>
                </div>
            </div>
        </Card>
    )
}


export default function MyBookingsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
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
        <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
            <div className="mb-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-5 w-1/2 mt-4" />
            </div>
            <div className="space-y-8">
                <Card className="overflow-hidden shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="relative h-56 md:h-full">
                            <Skeleton className="h-full w-full"/>
                        </div>
                        <div className="col-span-2 flex flex-col p-6 space-y-4">
                            <Skeleton className="h-7 w-3/4"/>
                            <Skeleton className="h-4 w-1/2"/>
                            <div className="grid gap-x-6 gap-y-4 pt-4 md:grid-cols-2">
                                <Skeleton className="h-10 w-full"/>
                                <Skeleton className="h-10 w-full"/>
                                <Skeleton className="h-10 w-full"/>
                                <Skeleton className="h-10 w-full"/>
                            </div>
                            <div className="flex-grow"></div>
                            <div className="border-t pt-4 flex justify-between items-end">
                                <Skeleton className="h-6 w-20" />
                                <div className="text-right space-y-1">
                                    <Skeleton className="h-4 w-16 ml-auto" />
                                    <Skeleton className="h-7 w-24 ml-auto" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card className="overflow-hidden shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="relative h-56 md:h-full">
                            <Skeleton className="h-full w-full"/>
                        </div>
                        <div className="col-span-2 flex flex-col p-6 space-y-4">
                            <Skeleton className="h-7 w-3/4"/>
                            <Skeleton className="h-4 w-1/2"/>
                            <div className="grid gap-x-6 gap-y-4 pt-4 md:grid-cols-2">
                                <Skeleton className="h-10 w-full"/>
                                <Skeleton className="h-10 w-full"/>
                                <Skeleton className="h-10 w-full"/>
                                <Skeleton className="h-10 w-full"/>
                            </div>
                            <div className="flex-grow"></div>
                            <div className="border-t pt-4 flex justify-between items-end">
                                <Skeleton className="h-6 w-20" />
                                <div className="text-right space-y-1">
                                    <Skeleton className="h-4 w-16 ml-auto" />
                                    <Skeleton className="h-7 w-24 ml-auto" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">My Bookings</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Here are all the amazing trips you've planned with us.
        </p>
      </div>

      {bookings?.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">No Bookings Yet</CardTitle>
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
  );
}
