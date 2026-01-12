'use client';

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

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
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  Home,
  Calendar,
  Users,
  Hotel as HotelIcon,
  Mail,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  type GenerateBookingConfirmationEmailOutput,
} from '@/ai/flows/generate-booking-confirmation-email';
import { generateEmailAction } from '@/app/booking/actions';

function EmailPreview({
  email,
}: {
  email: GenerateBookingConfirmationEmailOutput;
}) {
  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center gap-4">
        <Mail className="h-6 w-6 text-muted-foreground" />
        <div>
          <CardTitle>Email Confirmation Preview</CardTitle>
          <CardDescription>
            This is a preview of the email sent to the customer.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-4 flex items-center gap-2 border-b pb-2">
            <FileText className="h-4 w-4" />
            <h4 className="font-bold">{email.subject}</h4>
          </div>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function BookingSuccessPage() {
  const params = useParams();
  const id = params.id as string;
  const [email, setEmail] = useState<GenerateBookingConfirmationEmailOutput | null>(null);
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);

  const booking = getBookingById(id);

  if (!booking) {
    notFound();
  }

  const hotel = getHotelById(booking.hotelId);

  useEffect(() => {
    if (booking && hotel) {
      const generateEmail = async () => {
        setIsLoadingEmail(true);
        const emailContent = await generateEmailAction({
          hotelName: hotel.name,
          customerName: booking.customerName,
          checkIn: format(new Date(booking.checkIn), 'PPP'),
          checkOut: format(new Date(booking.checkOut), 'PPP'),
          roomType: booking.roomType,
          guests: booking.guests,
          totalPrice: booking.totalPrice,
          bookingId: booking.id,
        });
        setEmail(emailContent);
        setIsLoadingEmail(false);
      };
      generateEmail();
    }
  }, [booking, hotel]);

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
            A confirmation email has been sent to {booking.customerEmail}.
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
      
      {isLoadingEmail ? (
        <div className="mt-8 space-y-4">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-40 w-full" />
        </div>
      ) : email ? (
        <EmailPreview email={email} />
      ) : null}

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
