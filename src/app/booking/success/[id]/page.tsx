'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState, useMemo } from 'react';
import { doc } from 'firebase/firestore';

import type { Booking, Hotel } from '@/lib/types';
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
  CheckCircle,
  Home,
  Calendar,
  Users,
  Hotel as HotelIcon,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { generateBookingConfirmationEmail } from '@/ai/flows/generate-booking-confirmation-email';

function LoadingSkeleton() {
    return (
        <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6 space-y-8">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
}

function VerifyingBooking() {
    return (
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h1 className="mt-8 font-headline text-4xl font-bold">
                Verifying Your Booking...
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Please wait a moment. This should only take a few seconds.
            </p>
        </div>
    )
}


export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { toast } = useToast();
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const [isEmailBeingSent, setIsEmailBeingSent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);


  useEffect(() => {
    if (!isUserLoading && !user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Required',
            description: 'You need to be logged in to view this page.'
        });
        router.push(`/login?redirect=/booking/success/${id}`);
    }
  }, [isUserLoading, user, router, id, toast]);


  const bookingRef = useMemo(() => {
      if (!firestore || !user || !id) return null;
      return doc(firestore, 'users', user.uid, 'bookings', id);
  }, [firestore, user, id]);

  const { data: booking, isLoading: isLoadingBooking } = useDoc<Booking>(bookingRef);

  const hotelRef = useMemo(() => {
    if (!firestore || !booking) return null;
    return doc(firestore, 'hotels', booking.hotelId);
  }, [firestore, booking]);
  const { data: hotel, isLoading: isLoadingHotel } = useDoc<Hotel>(hotelRef);


  useEffect(() => {
    if (booking && hotel && !isEmailBeingSent && !emailSent) {
      setIsEmailBeingSent(true);
      
      console.log('Generating booking confirmation email...');

      generateBookingConfirmationEmail({
        hotelName: hotel.name,
        customerName: booking.customerName,
        checkIn: (booking.checkIn as any).toDate().toISOString(),
        checkOut: (booking.checkOut as any).toDate().toISOString(),
        roomType: booking.roomType,
        totalPrice: booking.totalPrice,
        bookingId: booking.id!,
      }).then(emailContent => {
        console.log("--- GENERATED EMAIL ---");
        console.log("Subject:", emailContent.subject);
        console.log("Body:", emailContent.body);
        console.log("-----------------------");
        toast({
          title: 'Booking Confirmed!',
          description: `A confirmation email has been generated for ${booking.customerEmail}.`,
        });
        setEmailSent(true);
      }).catch(err => {
        console.error("Failed to generate email:", err);
        toast({
            variant: 'destructive',
            title: 'Email Generation Failed',
            description: 'Could not generate the confirmation email.',
        })
      }).finally(() => {
        setIsEmailBeingSent(false);
      })
    }
  }, [booking, hotel, isEmailBeingSent, emailSent, toast]);


  if (isUserLoading || !user) {
      return <LoadingSkeleton />
  }

  if (isLoadingBooking) {
      return <LoadingSkeleton />
  }

  if (!booking) {
    // Instead of 404, show a verifying state to handle Firestore replication delay.
    // onSnapshot will trigger a re-render once the document is available.
    return <VerifyingBooking />;
  }

  if (isLoadingHotel) {
      return <LoadingSkeleton />
  }

  if (!hotel) {
    // If booking exists but hotel doesn't, that's a data integrity issue.
    notFound();
  }

  const hotelImage = PlaceHolderImages.find((img) => img.id === hotel.images[0]);
  const checkInDate = (booking.checkIn as any).toDate ? (booking.checkIn as any).toDate() : new Date(booking.checkIn);
  const checkOutDate = (booking.checkOut as any).toDate ? (booking.checkOut as any).toDate() : new Date(booking.checkOut);


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
        {booking.razorpayPaymentId && (
            <p className="mt-1 text-xs text-muted-foreground">
                Payment ID: <span className="font-mono">{booking.razorpayPaymentId}</span>
            </p>
        )}
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
                {format(checkInDate, 'EEE, LLL dd')} -{' '}
                {format(checkOutDate, 'EEE, LLL dd')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span>{booking.guests} Guests</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold">
                <span>Total Price</span>
                <span>{booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
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
