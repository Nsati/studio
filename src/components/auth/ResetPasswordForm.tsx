'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase/provider';
import { confirmPasswordReset } from 'firebase/auth';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';


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

export function ResetPasswordForm() {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordReset, setPasswordReset] = useState(false);
  
  const oobCode = searchParams.get('oobCode');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !oobCode) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setPasswordReset(true);
      toast({
        title: 'Password Reset Successful!',
        description: 'You can now log in with your new password.',
      });
    } catch (error: any) {
      if (error.code === 'auth/invalid-action-code') {
        setError('The password reset link is invalid or has expired. Please request a new one.');
      } else {
        setError(error.message || 'An error occurred. Please try again.');
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!oobCode) {
      return (
         <div className="container flex min-h-[80vh] items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl text-destructive">Invalid Link</CardTitle>
                    <CardDescription>
                       This password reset link is invalid. It might be missing the required verification code. Please request a new password reset link.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                     <Button asChild className="w-full">
                        <Link href="/forgot-password">Request New Link</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      )
  }

  if (passwordReset) {
      return (
         <div className="container flex min-h-[80vh] items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">Password Changed!</CardTitle>
                    <CardDescription>
                       Your password has been successfully updated.
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
          <CardTitle className="font-headline text-3xl">Reset Your Password</CardTitle>
          <CardDescription>Choose a new, strong password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading || !auth}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set New Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
