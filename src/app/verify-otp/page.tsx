'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer used as OTP verification has been temporarily removed.
// It will redirect any users who land here to the signup page.
export default function VerifyOtpPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/signup');
    }, [router]);

    return null;
}
