'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 

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

export function LoginForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResendVerification = async () => {
    if (!auth || !email) return;
    try {
        // We need to sign in the user temporarily to get their user object
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user && !userCredential.user.emailVerified) {
            await sendEmailVerification(userCredential.user);
            toast({
                title: 'Verification Link Sent',
                description: 'A new verification link has been sent to your email address.',
            });
        }
        await signOut(auth); // Sign out immediately after
    } catch (e) {
        setError("Could not resend verification email. Please check your credentials.");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    setIsLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        // Sign out the user
        await signOut(auth);
        
        toast({
            variant: 'destructive',
            title: 'Email Not Verified',
            description: 'Please check your inbox for the verification link.',
        });
        
        setIsLoading(false);
        return;
      }

      // Check for user profile and create if it doesn't exist
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'New User',
          role: 'user',
        });
        toast({
            title: 'Profile Created',
            description: 'We created a basic profile for you to get started.'
        });
      }


      toast({ title: 'Login successful!', description: `Welcome back!` });
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/my-bookings');

    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError('An error occurred during login.');
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Welcome Back</CardTitle>
          <CardDescription>Log in to manage your bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            {error === 'Please verify your email before logging in.' && (
                 <Button variant="link" type="button" onClick={handleResendVerification} className="p-0 h-auto">
                    Resend verification email
                </Button>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !auth || !firestore}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
