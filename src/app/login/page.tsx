'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    // useSearchParams is used in LoginForm, so it must be wrapped in Suspense
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
