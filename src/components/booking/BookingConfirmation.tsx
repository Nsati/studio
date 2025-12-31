
import type { Booking } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Mail, Home, BookOpen, Calendar, Users, Hash, IndianRupee } from 'lucide-react';

interface BookingConfirmationProps {
  booking: Booking;
}

export function BookingConfirmation({ booking }: BookingConfirmationProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle className="h-12 w-12 text-primary" />
      </div>

      <h1 className="mt-6 font-headline text-3xl font-bold md:text-4xl">Booking Confirmed!</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Thank you for booking with Uttarakhand Getaways. Your adventure awaits!
      </p>
      
      <div className="mt-4 flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
        <Mail className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        <p className="text-muted-foreground">A confirmation email has been sent to your registered email address.</p>
      </div>

      <div className="mt-8 w-full border-t border-dashed pt-8 text-left">
        <h2 className="font-headline text-2xl font-semibold">Booking Summary</h2>
        <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2 font-semibold text-muted-foreground"><Home className="h-5 w-5"/> Hotel</span>
                <span className="font-medium text-right">{booking.hotelName}, {booking.hotelCity}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2 font-semibold text-muted-foreground"><BookOpen className="h-5 w-5"/> Room</span>
                <span className="font-medium">{booking.roomType}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2 font-semibold text-muted-foreground"><Calendar className="h-5 w-5"/> Dates</span>
                <span className="font-medium">{booking.checkIn} to {booking.checkOut}</span>
            </div>
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2 font-semibold text-muted-foreground"><Users className="h-5 w-5"/> Guests</span>
                <span className="font-medium">{booking.guests}</span>
            </div>
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2 font-semibold text-muted-foreground"><Hash className="h-5 w-5"/> Booking ID</span>
                <span className="font-mono text-sm">{booking.id}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t pt-4 mt-4">
                <span className="flex items-center gap-2 text-lg font-bold"><IndianRupee className="h-5 w-5"/> Total Paid</span>
                <span className="text-lg font-bold">₹{booking.totalPrice.toLocaleString()}</span>
            </div>
        </div>
      </div>

      <div className="mt-10 flex w-full flex-col sm:flex-row justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/my-bookings">View My Bookings</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/search">Explore More Hotels</Link>
        </Button>
      </div>
    </div>
  );
}
