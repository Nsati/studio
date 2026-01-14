'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import { getBookingsForUser, getHotelById } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Calendar,
  Users,
  Hotel as HotelIcon,
  Home,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { Booking } from '@/lib/types';


export default function MyBookingsPage() {
  const { user, isLoading } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        setBookings(getBookingsForUser(user.uid));
      }
      setIsDataLoading(false);
    }
  }, [user, isLoading]);

  if (isLoading || isDataLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center max-w-4xl py-12 px-4 md:px-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
      return (
          <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center max-w-4xl py-12 px-4 md:px-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="font-headline text-3xl font-bold">Please Log In</h2>
              <p className="text-muted-foreground">
                You need to be logged in to view your bookings.
              </p>
            </div>
          </div>
      )
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">My Bookings</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Here are your past and upcoming reservations with Uttarakhand Getaways.
        </p>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-8">
          {bookings.map((booking) => {
            const hotel = getHotelById(booking.hotelId);
            if (!hotel) return null; // Should not happen with consistent data

            const hotelImage = PlaceHolderImages.find((img) => img.id === hotel.images[0]);
            const isUpcoming = new Date(booking.checkIn) > new Date();

            return (
              <Card key={booking.id}>
                <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <CardTitle>{hotel.name}</CardTitle>
                    <CardDescription>
                      Booking ID: <span className="font-mono text-xs">{booking.id}</span>
                    </CardDescription>
                  </div>
                  <Badge variant={isUpcoming ? 'default' : 'secondary'}>
                    {isUpcoming ? 'Upcoming' : 'Completed'}
                  </Badge>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="relative h-64 w-full overflow-hidden rounded-lg">
                    {hotelImage && (
                       <Link href={`/hotels/${hotel.slug}`}>
                        <Image
                          src={hotelImage.imageUrl}
                          alt={hotel.name}
                          data-ai-hint={hotelImage.imageHint}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                       </Link>
                    )}
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-headline text-2xl font-bold">{booking.roomType} Room</h3>
                     <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-5 w-5" />
                      <span>
                        {format(new Date(booking.checkIn), 'EEE, LLL dd, yyyy')} -{' '}
                        {format(new Date(booking.checkOut), 'EEE, LLL dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-5 w-5" />
                      <span>{booking.guests} Guests</span>
                    </div>
                     <div className="border-t pt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Paid</span>
                        <span>₹{booking.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={`/hotels/${hotel.slug}`}>
                            <HotelIcon className="mr-2 h-4 w-4" />
                            View Hotel
                        </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
            <h3 className="font-headline text-2xl font-bold">No Bookings Yet</h3>
            <p className="mt-2 text-muted-foreground">
                You haven&apos;t made any bookings. Time to plan your next adventure!
            </p>
            <Button asChild className="mt-6">
                <Link href="/search">
                <Home className="mr-2 h-4 w-4" />
                Explore Hotels
                </Link>
            </Button>
        </div>
      )}
    </div>
  );
}
