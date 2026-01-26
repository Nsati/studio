'use client';

import { Suspense } from 'react';
import Script from 'next/script';
import { BookingForm } from './BookingForm';
import { BookingFormSkeleton } from './BookingFormSkeleton';

export default function BookingPage() {
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Suspense fallback={<BookingFormSkeleton />}>
        <BookingForm />
      </Suspense>
    </>
  );
}
