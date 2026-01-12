'use client';

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getBookingById, getHotelById } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Home, Calendar, Users, Hotel as HotelIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function BookingSuccessPage() {
  const params = useParams();
  const id = params.id as string;
  const booking = getBookingById(id);

  if (!booking) {
    notFound();
  }

  const hotel = getHotelById(booking.hotelId);

  if (!hotel) {
    // This case should ideally not happen if data is consistent
    notFound();
  }

  const hotelImage = PlaceHolderImages.find((img) => img.id === hotel.images[0]);

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
      <div className="flex flex-col items-center text-center">
        <CheckCircle className="h-20 w-20 text-green-500" />
        <h1 className="mt-6 font-headline text-4xl font-bold">
          Booking Confirmed!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Thank you for booking with Uttarakhand Getaways. Your adventure awaits!
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Booking ID: <span className="font-mono">{booking.id}</span>
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Your Booking Details</CardTitle>
          <CardDescription>
            A confirmation email has been sent to your address.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="relative h-64 w-full overflow-hidden rounded-lg">
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
          <div className="space-y-4">
            <h3 className="font-headline text-2xl font-bold">{hotel.name}</h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <HotelIcon className="h-5 w-5" />
              <span>{booking.roomType} Room</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <span>
                {format(new Date(booking.checkIn), 'EEE, LLL dd')} -{' '}
                {format(new Date(booking.checkOut), 'EEE, LLL dd')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span>{booking.guests} Guests</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold">
                <span>Total Paid</span>
                <span>₹{booking.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-center">
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
