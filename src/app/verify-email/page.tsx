'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer used and is replaced by /verify-otp
// It will redirect any users who land here to the homepage.
export default function VerifyEmailPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/');
    }, [router]);

    return null;
}
