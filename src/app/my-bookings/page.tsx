'use client';

import { useUser } from '@/contexts/UserContext';
import { getBookingsForUser, getHotelById } from '@/lib/data';
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
import { Calendar, Hotel, Home, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyBookingsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="container mx-auto p-4">Loading your bookings...</div>;
  }

  const bookings = getBookingsForUser(user.uid);

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">My Bookings</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Here are all the amazing trips you've planned with us.
        </p>
      </div>

      {bookings.length === 0 ? (
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
          {bookings.map((booking) => {
            const hotel = getHotelById(booking.hotelId);
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
                        <Link href={`/hotels/${hotel.slug}`}>{hotel.name}</Link>
                      </CardTitle>
                      <CardDescription>
                        Booking ID: <span className="font-mono">{booking.id}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-4 grid gap-4 p-0 md:grid-cols-2">
                       <div className="flex items-center gap-2 text-muted-foreground">
                            <Hotel className="h-5 w-5" />
                            <span>{booking.roomType} Room</span>
                        </div>
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-5 w-5" />
                            <span>{booking.guests} Guests</span>
                        </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-5 w-5" />
                        <span>
                          {format(new Date(booking.checkIn), 'EEE, LLL dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-5 w-5 text-red-500" />
                        <span>
                           {format(new Date(booking.checkOut), 'EEE, LLL dd, yyyy')}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
