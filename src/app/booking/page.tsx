'use client';

import { Suspense } from 'react';
import { BookingForm } from '@/components/booking/BookingForm';
import Loading from './loading';

export default function BookingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BookingForm />
    </Suspense>
  );
}
