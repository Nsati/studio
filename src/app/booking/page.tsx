'use client';

import { Suspense } from 'react';
import { BookingForm } from '@/components/booking/BookingForm';
import { BookingFormSkeleton } from './BookingFormSkeleton';

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingFormSkeleton />}>
      <BookingForm />
    </Suspense>
  );
}
