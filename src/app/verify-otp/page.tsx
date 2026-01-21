'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer used since OTP verification was removed.
// It will redirect any users who land here to the homepage.
export default function VerifyOtpPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/');
    }, [router]);

    return null;
}
