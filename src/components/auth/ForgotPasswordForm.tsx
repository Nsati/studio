'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase/client/provider';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';

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

export function ForgotPasswordForm() {
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    setIsLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      toast({
        title: 'Email Sent!',
        description: 'A password reset link has been sent to your email address.',
      });
    } catch (error: any) {
      // Don't reveal if user exists or not, for security reasons.
      // Just show a success message regardless.
      setEmailSent(true);
       toast({
        title: 'Email Sent!',
        description: 'If an account exists for this email, a reset link has been sent.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
      return (
         <div className="container flex min-h-[80vh] items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">Check Your Email</CardTitle>
                    <CardDescription>
                       If an account with the address <span className="font-semibold text-foreground">{email}</span> exists, we've sent a password reset link to it. Please check your inbox and spam folder.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                     <Button asChild className="w-full">
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      )
  }


  return (
    <div className="container flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link. No worries, it happens!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading || !auth}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
            <Button variant="link" asChild>
                <Link href="/login">
                    Back to Login
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
