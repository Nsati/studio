'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { verifyOtpAction, sendOtpAction } from '../auth/actions';
import { useUser, useAuth } from '@/firebase';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();


  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const email = searchParams.get('email');

  if (!email) {
    // This can happen if the user navigates here directly.
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            No email address was provided. Please start the signup process
            again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid OTP',
        description: 'Please enter a 6-digit OTP.',
      });
      return;
    }
    setIsLoading(true);

    const result = await verifyOtpAction({ email, otp });

    if (result.success) {
      toast({
        title: 'Account Verified!',
        description: 'You have been successfully logged in.',
      });
      router.push('/my-bookings');
    } else {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: result.error,
      });
      setIsLoading(false);
    }
  };
  
  const handleResend = async () => {
    if (!user || !auth) {
        toast({ variant: 'destructive', title: 'You must be signed in to resend an OTP.'})
        return;
    }
    setIsResending(true);
    const result = await sendOtpAction({
        userId: user.uid,
        email: user.email!,
        name: user.displayName || "User"
    });
    
     if (result.success) {
        toast({
            title: 'OTP Resent',
            description: 'A new OTP has been sent to your email address.',
        });
     } else {
        toast({
            variant: 'destructive',
            title: 'Failed to Resend',
            description: result.error,
        });
     }
    setIsResending(false);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">Check your email</CardTitle>
        <CardDescription>
          We've sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>. The code
          expires in 5 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Account
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Didn't receive the email?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={handleResend} disabled={isResending}>
            {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Resend OTP
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyOtpPage() {
    return (
        <div className="container flex min-h-[80vh] items-center justify-center">
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                <VerifyOtpForm />
            </Suspense>
        </div>
    )
}
