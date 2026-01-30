
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
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
import { Loader2, Chrome, Mail, Lock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function LoginForm() {
  const auth = useAuth();
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && !isUserLoading) {
      const redirect = searchParams.get('redirect') || '/my-bookings';
      router.push(redirect);
    }
  }, [user, isUserLoading, router, searchParams]);

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setIsGoogleLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(true);
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!response.ok) throw new Error('Identity verification failed');
      const redirect = searchParams.get('redirect') || '/my-bookings';
      router.push(redirect);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/popup-blocked') {
        toast({ variant: 'destructive', title: "Auth Error", description: err.message });
      }
      if (err.code === 'auth/popup-blocked') {
        toast({ variant: 'destructive', title: "Popup Blocked", description: "Please allow popups for this website to sign in with Google." });
      }
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
      const redirect = searchParams.get('redirect') || '/my-bookings';
      router.push(redirect);
    } catch (err: any) {
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container min-h-screen flex items-center justify-center py-24 bg-muted/30">
      <Card className="w-full max-w-md rounded-[3rem] shadow-2xl border-black/5 overflow-hidden">
        <CardHeader className="text-center p-10 pb-6 space-y-4">
          <div className="mx-auto bg-primary/10 p-5 rounded-full w-fit">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-4xl font-black tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-base font-medium">Continue your Himalayan journey</CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10 space-y-8">
          <Button
            variant="outline"
            className="w-full h-14 rounded-full text-base font-bold transition-all hover:bg-muted active:scale-95 border-black/10"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Chrome className="mr-2 h-5 w-5 text-blue-500" />}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><Separator /></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <span className="bg-white px-4">Or secure login</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <Input
                type="email"
                placeholder="ankit@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 rounded-2xl bg-muted/50 border-0 focus-visible:ring-primary font-bold"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                <Link href="/forgot-password" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 rounded-2xl bg-muted/50 border-0 focus-visible:ring-primary font-bold pl-12"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            {error && <div className="p-4 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest rounded-2xl text-center">{error}</div>}
            <Button
              type="submit"
              className="w-full h-14 rounded-full text-lg font-black bg-primary text-white shadow-xl shadow-primary/20 transition-all active:scale-95"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-black/5 bg-muted/20 p-8">
          <p className="text-sm font-medium text-muted-foreground">
            New here? <Link href="/signup" className="font-black text-primary hover:underline">Create an Account</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
