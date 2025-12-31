'use client';

import { useState } from 'react';
import { getBookings } from '@/lib/data';
import type { Booking } from '@/lib/types';
import { BookingCard } from '@/components/booking/BookingCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(getBookings());

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: 'Cancelled' } : booking
      )
    );
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your upcoming and past stays.
        </p>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onCancel={handleCancelBooking} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
          <h3 className="font-headline text-2xl font-bold">No Bookings Yet</h3>
          <p className="mt-2 text-muted-foreground">
            Your next adventure is waiting. Let's find your perfect stay.
          </p>
          <Button asChild className="mt-6">
            <Link href="/search">Start Exploring</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
