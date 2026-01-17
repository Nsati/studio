'use client';

import React, { useMemo } from 'react';
import { useUser } from '@/firebase';
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
import { Calendar, Hotel as HotelIcon, Home, Users, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { dummyBookings, dummyHotels } from '@/lib/dummy-data';

function BookingItem({ booking }: { booking: Booking }) {
    const isLoading = false;
    const hotel = dummyHotels.find(h => h.id === booking.hotelId);

    if (isLoading) {
        return (
            <Card className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    <Skeleton className="h-48 w-full md:h-full" />
                    <div className="col-span-2 p-6 space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="grid gap-4 p-0 md:grid-cols-2">
                           <Skeleton className="h-5 w-full" />
                           <Skeleton className="h-5 w-full" />
                           <Skeleton className="h-5 w-full" />
                           <Skeleton className="h-5 w-full" />
                        </div>
                        <Skeleton className="h-8 w-1/3" />
                    </div>
                </div>
            </Card>
        )
    }

    if (!hotel) return null;
    
    const hotelImage = PlaceHolderImages.find(
        (img) => img.id === hotel.images[0]
    );

    return (
        <Card key={booking.id} className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="relative h-48 md:h-full">
                {hotelImage && (
                <Image
                    src={hotelImage.imageUrl}
                    alt={hotel.name}
                    fill
                    className="object-cover"
                />
                )}
            </div>
            <div className="col-span-2 p-6">
                <CardHeader className="p-0">
                <CardTitle className="font-headline text-2xl hover:text-primary">
                    <Link href={`/hotels/${hotel.id}`}>{hotel.name}</Link>
                </CardTitle>
                <CardDescription>
                    Booking ID: <span className="font-mono">{booking.id}</span>
                </CardDescription>
                </CardHeader>
                <CardContent className="mt-4 grid gap-4 p-0 md:grid-cols-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <HotelIcon className="h-5 w-5" />
                        <span>{booking.roomType} Room</span>
                    </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-5 w-5" />
                        <span>{booking.guests} Guests</span>
                    </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <span>
                    {format(booking.checkIn, 'EEE, LLL dd, yyyy')}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-5 w-5 text-red-500" />
                    <span>
                        {format(booking.checkOut, 'EEE, LLL dd, yyyy')}
                    </span>
                </div>
                
                </CardContent>
                    <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total Paid</span>
                        <span>₹{booking.totalPrice.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            </div>
        </Card>
    )
}


export default function MyBookingsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);
  
  const { data: bookings, isLoading: areBookingsLoading } = useMemo(() => {
    if (!user) return { data: [], isLoading: true };
    // In a real app, you'd fetch this based on user.uid.
    // For this demo, we'll show bookings for the dummy user if the email matches.
    const matchingUser = user.email === 'ankit.sharma@example.com';
    const userBookings = matchingUser ? dummyBookings.filter(b => b.userId === 'test-user-id') : [];
    return { data: userBookings, isLoading: false };
  }, [user]);

  const isLoading = isUserLoading || areBookingsLoading;

  if (isLoading || !user) {
    return <div className="container mx-auto p-4 flex justify-center items-center h-[50vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
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
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <CardHeader>
            <CardTitle>No Bookings Yet</CardTitle>
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
