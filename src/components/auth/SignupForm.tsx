'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import crypto from 'crypto';

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


// This function simulates sending an email. In a real app, you'd use a service like SendGrid or Mailgun.
async function sendOtpEmail(email: string, otp: string) {
  console.log('--- OTP VERIFICATION EMAIL ---');
  console.log(`To: ${email}`);
  console.log(`Your verification code is: ${otp}`);
  console.log('--- In production, this would be sent via a real email service. ---');
}

export async function handleOtpSend(
  firestore: any,
  userId: string,
  email: string
) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
  const otpRef = doc(firestore, 'otp_verification', userId);
  const otpData: OtpVerification = { otp, expiresAt };

  await sendOtpEmail(email, otp);
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
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
        role: 'user',
        status: 'pending',
      });
      
      // 2. Create and store OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
      const otpRef = doc(firestore, 'otp_verification', user.uid);
      const otpData: OtpVerification = { otp, expiresAt };
      batch.set(otpRef, otpData);

      // Commit both writes at once
      await batch.commit();

      // 3. Send OTP email (simulation)
      await sendOtpEmail(user.email!, otp);

      toast({
        title: 'Account Created!',
        description: "We've sent a verification code to your email.",
      });
      
      router.push(`/verify-otp?email=${encodeURIComponent(user.email!)}`);

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
