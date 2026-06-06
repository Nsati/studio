'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Mail, 
  Lock, 
  ArrowRight, 
  Mountain, 
  Star, 
  Heart, 
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';

/**
 * @fileOverview Production-Hardened Split-Panel Login Node.
 * Optimized for production with strictly defined prop types for Next.js components.
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
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      // Ensure user profile exists
      const userRef = doc(firestore, 'users', fbUser.uid);
      await setDoc(userRef, {
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'Himalayan Explorer',
        email: fbUser.email,
        mobile: fbUser.phoneNumber || '',
        role: 'user',
        status: 'active',
      }, { merge: true });

      toast({ title: 'Welcome Back!', description: 'Establishing secure Himalayan node...' });
      router.push(searchParams.get('redirect') || '/my-bookings');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast({ variant: 'destructive', title: "Identity Link Denied", description: "Could not link your Google account. Please try again." });
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
      router.push(searchParams.get('redirect') || '/my-bookings');
    } catch (err: any) {
        setError('Invalid credentials node. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center p-4 md:p-10">
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        
        {/* Left Side: Visual Expedition */}
        <div className="md:w-5/12 relative hidden md:block overflow-hidden">
            <Image 
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1200" 
                alt="Expedition" 
                fill 
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent" />
            
            <div className="absolute inset-0 p-12 flex flex-col justify-between text-white">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center">
                    <Mountain className="h-6 w-6 text-primary" />
                </div>
                
                <div className="space-y-6">
                    <h2 className="text-4xl font-black tracking-tight leading-tight">
                        Explore the Himalayas like never before.
                    </h2>
                    <p className="text-sm font-medium opacity-80 leading-relaxed max-w-xs">
                        Curated journeys, real experiences and unforgettable memories.
                    </p>
                    
                    <div className="pt-10 flex items-center gap-8">
                        <div className="text-center space-y-2">
                            <Mountain className="h-5 w-5 mx-auto opacity-70" />
                            <p className="text-[8px] font-black uppercase tracking-widest leading-none">Handpicked<br/>Destinations</p>
                        </div>
                        <div className="text-center space-y-2">
                            <Star className="h-5 w-5 mx-auto opacity-70" />
                            <p className="text-[8px] font-black uppercase tracking-widest leading-none">Expert Curated<br/>Packages</p>
                        </div>
                        <div className="text-center space-y-2">
                            <Heart className="h-5 w-5 mx-auto opacity-70" />
                            <p className="text-[8px] font-black uppercase tracking-widest leading-none">Authentic<br/>Experiences</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Side: Elite Form Node */}
        <div className="flex-1 p-8 md:p-16 flex flex-col items-center justify-center bg-white">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-3">
                    <div className="h-14 w-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto border border-primary/10">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome back!</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Continue your Himalayan journey</p>
                    </div>
                </div>

                <Button 
                    variant="outline" 
                    className="w-full h-14 rounded-full font-bold text-sm border-slate-200 hover:bg-slate-50 gap-3 shadow-sm transition-all"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading || isLoading}
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.48-.98 7.31-2.64l-3.57-2.77c-1 .67-2.28 1.07-3.74 1.07-2.88 0-5.32-1.92-6.19-4.51H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.81 14.15c-.22-.67-.35-1.39-.35-2.15s.13-1.48.35-2.15V7.01H2.18C1.4 8.61 1 10.39 1 12s.4 3.39 1.18 4.99l3.63-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.01l3.63 2.84c.87-2.6 3.31-4.51 6.19-4.51z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </Button>

                <div className="flex items-center gap-4 py-2">
                    <div className="h-px flex-1 bg-slate-100" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">OR SECURE LOGIN</span>
                    <div className="h-px flex-1 bg-slate-100" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    type="email" 
                                    placeholder="nsati09@gmail.com" 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="h-14 rounded-full pl-12 bg-slate-50 border-0 focus-visible:ring-primary font-bold text-sm" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Password</Label>
                                <Link href="/forgot-password" className="text-[10px] font-black text-primary hover:underline">Forgot Password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    type="password" 
                                    placeholder="••••••••••" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="h-14 rounded-full pl-12 bg-slate-50 border-0 focus-visible:ring-primary font-bold text-sm" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox id="remember" className="rounded-md border-slate-300" />
                        <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer">Remember me</label>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        disabled={isLoading || isGoogleLoading}
                        className="w-full h-14 rounded-full bg-primary text-white font-black text-base shadow-xl hover:bg-slate-900 transition-all active:scale-95 group"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                </form>

                <div className="text-center">
                    <p className="text-sm font-bold text-slate-400">
                        New here? <Link href="/signup" className="text-primary font-black hover:underline">Create an Account</Link>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}