'use client';

import { useUser, useAuth } from '@/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { MailCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyEmailPage() {
    const { user, isLoading } = useUser();
    const auth = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        // If user is already verified, redirect them away
        if (user && user.emailVerified) {
            router.replace('/my-bookings');
        }
    }, [user, router]);

    const handleResend = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'You are not logged in.' });
            return;
        }
        setIsSending(true);
        try {
            await sendEmailVerification(user);
            toast({
                title: 'Email Sent!',
                description: 'A new verification link has been sent to your email.'
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to send verification email.'
            });
        } finally {
            setIsSending(false);
        }
    }


    return (
        <div className="container flex min-h-[80vh] items-center justify-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto w-fit rounded-full bg-primary/10 p-4">
                        <MailCheck className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-3xl mt-4">Verify Your Email</CardTitle>
                    <CardDescription>
                        We've sent a verification link to{' '}
                        <span className="font-semibold text-foreground">
                           {isLoading ? <Loader2 className="inline-block h-4 w-4 animate-spin" /> : user?.email || 'your email address'}
                        </span>.
                         Please check your inbox (and spam folder) to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Button 
                        onClick={handleResend} 
                        disabled={isSending || isLoading || !user} 
                        className="w-full"
                    >
                       {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Resend Verification Email
                    </Button>
                </CardContent>
                 <CardFooter className="flex-col gap-4 text-sm text-muted-foreground">
                    <p>After verifying, you can log in to your account.</p>
                     <Button variant="outline" asChild>
                        <Link href="/login">
                           Go to Login
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
