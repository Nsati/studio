'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
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
import { Loader2, Chrome, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

/**
 * @fileOverview Luxury Login Node for Northern Harrier.
 * Features: High-end typography, glassmorphism, and hybrid auth sync.
 */

export function LoginForm() {
  const auth = useAuth();
  const firestore = useFirestore();
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
    if (!auth || !firestore) return;
    setIsGoogleLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      let serverSynced = false;
      try {
        const idToken = await fbUser.getIdToken(true);
        const response = await fetch('/api/auth/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        if (response.ok) serverSynced = true;
      } catch (apiErr) {
        console.warn("⚠️ [AUTH] Server sync node unavailable.");
      }

      if (!serverSynced) {
        const userRef = doc(firestore, 'users', fbUser.uid);
        await setDoc(userRef, {
          uid: fbUser.uid,
          displayName: fbUser.displayName || 'Himalayan Explorer',
          email: fbUser.email,
          mobile: fbUser.phoneNumber || '',
          role: 'user',
          status: 'active',
        }, { merge: true });
      }

      toast({ title: 'Welcome Back!', description: 'Establishing secure Himalayan node...' });
      const redirect = searchParams.get('redirect') || '/my-bookings';
      router.push(redirect);
      
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/popup-blocked') {
        toast({ variant: 'destructive', title: "Identity Link Denied", description: err.message });
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
      toast({ title: 'Sync Successful', description: 'Navigating to expedition hub.' });
      const redirect = searchParams.get('redirect') || '/my-bookings';
      router.push(redirect);
    } catch (err: any) {
        setError('Invalid credentials node. Please verify email and key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container min-h-[90vh] flex items-center justify-center py-20 bg-background/50">
      <Card className="w-full max-w-md rounded-[3rem] shadow-apple-deep border-black/5 overflow-hidden bg-white/80 backdrop-blur-xl">
        <CardHeader className="text-center p-10 pb-6 space-y-4">
          <div className="mx-auto bg-primary/5 p-6 rounded-full w-fit group">
            <Sparkles className="h-10 w-10 text-primary group-hover:rotate-12 transition-transform duration-500" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-4xl font-black tracking-tighter text-primary uppercase">Welcome Back</CardTitle>
            <CardDescription className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Continue Your Himalayan Journey</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-10 pb-10 space-y-8">
          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-muted active:scale-95 border-black/10 flex items-center justify-center gap-3 bg-white"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5 text-blue-500" />}
            <span>Sync via Google Node</span>
          </Button>

          <div className="relative flex items-center justify-center">
            <Separator className="absolute w-full opacity-10" />
            <span className="relative bg-white px-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">
              Identity Protocol
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email Node</Label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="ankit@node.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 rounded-2xl bg-muted/30 border-0 focus-visible:ring-primary font-bold px-5 pl-12"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mx-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Key</Label>
                <Link href="/forgot-password" opacity-50 className="text-[9px] font-black text-primary hover:text-accent uppercase tracking-widest transition-colors">
                  Lost Key?
                </Link>
              </div>
              <div className="relative">
                <Input
                    type="password"
                    placeholder="Enter Secure Sequence"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 rounded-2xl bg-muted/30 border-0 focus-visible:ring-primary font-bold pl-12"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
              </div>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest rounded-2xl text-center border border-destructive/10 animate-in fade-in zoom-in-95">
                    {error}
                </div>
            )}

            <Button
              type="submit"
              className="w-full h-16 rounded-full text-xs font-black uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/20 transition-all active:scale-95 group"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Enter Himalayan Hub'}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-black/5 bg-muted/10 p-8">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            New Explorer? <Link href="/signup" className="font-black text-primary hover:text-accent transition-colors">Create Node</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
