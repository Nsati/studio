'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, writeBatch, setDoc } from 'firebase/firestore';
import { Vonage } from '@vonage/server-sdk';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { OtpVerification } from '@/lib/types';


// This function sends a real SMS using Vonage.
// It requires VONAGE_API_KEY and VONAGE_API_SECRET to be set in .env
async function sendOtpSms(phoneNumber: string, otp: string) {
  if (!process.env.VONAGE_API_KEY || !process.env.VONAGE_API_SECRET) {
    const errorMessage = 'Vonage API Key or Secret is not set. Cannot send SMS.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (process.env.VONAGE_API_SECRET === 'YOUR_VONAGE_API_SECRET') {
    const errorMessage = 'Vonage API Secret is a placeholder. Please update it in your .env file.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
  });

  const from = "Uttarakhand Getaways";
  // Assuming Indian numbers, prefix with 91. A production app might need a country code input.
  const to = `91${phoneNumber}`;
  const text = `Your verification code for Uttarakhand Getaways is: ${otp}`;

  try {
    const response = await vonage.sms.send({ to, from, text });
    if (response.messages[0].status === '0') {
      console.log(`SMS sent successfully to ${to}.`);
    } else {
      const errorMessage = response.messages[0]['error-text'];
      console.error(`Error sending SMS via Vonage: ${errorMessage}`);
      throw new Error(`Failed to send SMS: ${errorMessage}`);
    }
  } catch (err) {
    // This will catch errors from the Vonage SDK itself (e.g., network issues)
    console.error("Vonage SDK error:", err);
    throw new Error("An error occurred while trying to send the OTP SMS.");
  }
}


export async function handleOtpSend(
  firestore: any,
  userId: string,
  phoneNumber: string
) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
  const otpRef = doc(firestore, 'otp_verification', userId);
  const otpData: OtpVerification = { otp, expiresAt };

  await sendOtpSms(phoneNumber, otp);
  await setDoc(otpRef, otpData);
}

export function SignupForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
     if (!/^\d{10}$/.test(phoneNumber)) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
    }
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const batch = writeBatch(firestore);
      
      // 1. Create user profile in 'users' collection
      const userRef = doc(firestore, 'users', user.uid);
      batch.set(userRef, {
        uid: user.uid,
        displayName: name,
        email: user.email,
        phoneNumber: phoneNumber,
        role: 'user',
        status: 'pending',
      });
      
      // Commit the user profile write
      await batch.commit();

      // 2. Create, store, and send OTP
      await handleOtpSend(firestore, user.uid, phoneNumber);

      toast({
        title: 'Account Created!',
        description: "We've sent an OTP to your mobile. Please check your messages.",
      });
      
      router.push(`/verify-otp?phone=${encodeURIComponent(phoneNumber)}`);

    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('A user with this email already exists.');
      } else {
        setError(error.message || 'An error occurred during signup.');
        console.error(error);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">
            Create an Account
          </CardTitle>
          <CardDescription>
            Join us to start planning your getaway
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ankit Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phoneNumber">Mobile Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ankit.sharma@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !auth}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
