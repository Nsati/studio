import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    // useSearchParams is used in ResetPasswordForm, so it must be wrapped in Suspense
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
