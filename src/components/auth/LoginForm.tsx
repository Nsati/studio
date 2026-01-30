
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth } from '@/firebase';
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
import { Loader2, Chrome, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { signInWithEmailAndPassword } from 'firebase/auth';

/**
 * @fileOverview Production-ready Login with Google Integration
 */

export function LoginForm() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setIsGoogleLoading(true);
    setError('');

    try {
      // 1. Client-side Google OAuth
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // 2. Get the secure ID Token (JWT)
      const idToken = await result.user.getIdToken();

      // 3. Call the "Backend" API for verification & DB sync
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server-side verification failed');
      }

      toast({ 
        title: 'Login Successful!', 
        description: `Welcome back, ${data.user.displayName}!` 
      });

      const redirect = searchParams.get('redirect');
      router.push(redirect || '/my-bookings');

    } catch (err: any) {
      console.error("Google Login Flow Error:", err);
      setError(err.message || 'Google Login failed. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: err.message || 'Could not verify your identity.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Welcome Back!' });
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/my-bookings');
    } catch (err: any) {
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Securely access your Himalayan Getaways account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            variant="outline"
            className="w-full h-12 text-base font-semibold hover:bg-muted transition-colors"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-5 w-5 text-blue-500" />
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground">Or email login</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="ankit@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" size="sm" className="text-sm font-medium text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
            <Button
              type="submit"
              className="w-full h-11 text-base font-bold"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6 bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="font-bold text-primary hover:underline">
              Create Account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
