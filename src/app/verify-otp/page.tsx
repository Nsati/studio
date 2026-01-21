'use client';

import { Suspense, useState, useEffect } from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import type { OtpVerification } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { handleOtpSend } from '@/components/auth/SignupForm';

function VerifyOtpComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, userProfile, isLoading: isUserLoading } = useUser();

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const phone = searchParams.get('phone') || userProfile?.phoneNumber;

  const RESEND_TIMEOUT = 60; // seconds
  const [timeLeft, setTimeLeft] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || otp.length < 6) return;

    setIsLoading(true);
    try {
      const otpDocRef = doc(firestore, 'otp_verification', user.uid);
      const otpDoc = await getDoc(otpDocRef);

      if (!otpDoc.exists()) {
        throw new Error('OTP not found or has expired. Please request a new one.');
      }
      const otpData = otpDoc.data() as OtpVerification;

      if ((otpData.expiresAt as any).toDate() < new Date()) {
        throw new Error('OTP has expired. Please request a new one.');
      }

      if (otpData.otp !== otp.trim()) {
        throw new Error('Invalid OTP. Please try again.');
      }

      // OTP is valid, activate user and delete OTP doc
      const userRef = doc(firestore, 'users', user.uid);
      const batch = writeBatch(firestore);
      batch.update(userRef, { status: 'active' });
      batch.delete(otpDocRef);
      await batch.commit();

      toast({
        title: 'Account Activated!',
        description: 'You can now log in to your account.',
      });
      router.push('/login');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!firestore || !user || !phone) return;

    setIsResending(true);
    try {
      await handleOtpSend(firestore, user.uid, phone);
      toast({
        title: 'OTP Resent',
        description: 'A new OTP has been generated in your server console.',
      });
      setTimeLeft(RESEND_TIMEOUT);
      setCanResend(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Resend',
        description: error.message,
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !phone) {
    // If the user isn't logged in (which they should be after signup)
    // or phone is missing, redirect them to a safe page.
    router.replace('/login');
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">Verify Your Account</CardTitle>
        <CardDescription>
          A 6-digit code was sent to your mobile number: <br />{' '}
          <span className="font-semibold text-foreground">{phone}</span>
        </CardDescription>
        <p className="text-xs text-muted-foreground pt-2">
          (For development, the OTP is printed to your server console)
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
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
          <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center text-sm">
        <p className="text-muted-foreground">Didn't receive the code?</p>
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={handleResend}
          disabled={isResending || !canResend}
        >
          {isResending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : !canResend ? (
            `Resend in ${timeLeft}s`
          ) : (
            'Resend OTP'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="container flex min-h-[80vh] items-center justify-center">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
        <VerifyOtpComponent />
      </Suspense>
    </div>
  );
}
