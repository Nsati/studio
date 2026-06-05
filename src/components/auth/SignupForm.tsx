'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Chrome, UserPlus, ShieldCheck, MailCheck, Lock, Smartphone, AlertCircle, Compass, Sparkles, Fingerprint } from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { sendSignupOTPAction, verifyOTPAction } from '@/app/auth/actions';

/**
 * @fileOverview Premium Expedition Onboarding Node for Northern Harrier.
 * Multi-step verification with luxury Himalayan styling.
 */

const formSchema = z.object({
  name: z.string().min(2, { message: 'Legal name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Valid email node required.' }),
  mobile: z
    .string()
    .length(10, { message: 'Mobile node must be exactly 10 digits.' })
    .regex(/^\d{10}$/, { message: 'Numeric characters only.' }),
  password: z
    .string()
    .min(8, { message: 'Key must be at least 8 characters long.' })
});

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isLoading: isUserLoading } = useUser();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/my-bookings');
    }
  }, [user, isUserLoading, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      mobile: '',
      password: '',
    },
  });

  const handleGoogleSignup = async () => {
    if (!auth || !firestore) return;
    setIsGoogleLoading(true);
    setServerError('');

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      const userRef = doc(firestore, 'users', fbUser.uid);
      await setDoc(userRef, {
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'Himalayan Explorer',
        email: fbUser.email,
        mobile: fbUser.phoneNumber || '',
        role: 'user',
        status: 'active',
      }, { merge: true });

      toast({ title: 'Identity Established', description: 'Welcome to Northern Harrier.' });
      router.push('/my-bookings');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setServerError(err.message || "Identity link failed.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const initiateVerification = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsLoading(true);
    setServerError('');

    try {
        const values = form.getValues();
        const res = await sendSignupOTPAction(values.email, values.name);
        
        if (res.success) {
          setOtpSent(true);
          toast({ title: 'Protocol Initialized', description: res.message });
        } else {
          setServerError(res.message);
          setUseFallback(true);
        }
    } catch (e: any) {
        setServerError("Authentication server unreachable.");
        setUseFallback(true);
    } finally {
        setIsLoading(false);
    }
  };

  const finalizeRegistration = async () => {
    if (otpCode.length !== 6) {
        setServerError("6 digits required.");
        return;
    }
    setIsVerifying(true);
    setServerError('');
    const values = form.getValues();
    const verifyRes = await verifyOTPAction(values.email, otpCode);
    if (verifyRes.success) {
        handleStandardRegistration();
    } else {
        setServerError(verifyRes.message || "Incorrect verification sequence.");
    }
    setIsVerifying(false);
  };

  const handleStandardRegistration = async () => {
    if (!auth || !firestore) return;
    setIsLoading(true);
    const values = form.getValues();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const fbUser = userCredential.user;
        const newUserProfile: UserProfile = {
            uid: fbUser.uid,
            displayName: values.name,
            email: values.email,
            mobile: values.mobile,
            role: 'user',
            status: 'active',
        };
        await setDoc(doc(firestore, 'users', fbUser.uid), newUserProfile);
        toast({ title: 'Node Established', description: 'Welcome to the expedition grid.' });
        router.push('/my-bookings');
    } catch (error: any) {
        setServerError(error.message || "Registration failed.");
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="container min-h-screen flex items-center justify-center py-24 bg-background/50">
      <Card className="w-full max-w-md shadow-apple-deep border-black/5 bg-white/80 backdrop-blur-xl rounded-[3rem] overflow-hidden">
        <CardHeader className="text-center space-y-4 p-10 pb-6">
          <div className="mx-auto bg-primary/5 p-6 rounded-full w-fit group">
            {otpSent ? (
                <MailCheck className="h-10 w-10 text-primary animate-bounce" />
            ) : (
                <Fingerprint className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-500" />
            )}
          </div>
          <div className="space-y-1">
            <CardTitle className="font-black text-4xl tracking-tighter uppercase text-primary">
                {otpSent ? 'Verify Protocol' : 'Join Expedition'}
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                {otpSent ? `Sequence sent to inbox` : 'Establish Your Himalayan Identity'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-10 pb-10">
          {!otpSent ? (
            <>
              <Button
                variant="outline"
                className="w-full h-14 rounded-2xl text-[10px] font-black tracking-widest border-black/10 flex items-center justify-center gap-3 transition-all hover:bg-muted bg-white"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5 text-blue-500" />}
                <span>ID SYNC VIA GOOGLE</span>
              </Button>

              <div className="relative flex items-center justify-center">
                <Separator className="absolute w-full opacity-10" />
                <span className="relative bg-white px-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Secure Node</span>
              </div>

              <Form {...form}>
                <form className="space-y-5">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-2">Explorer Name</FormLabel>
                      <FormControl><Input placeholder="Full Legal Name" {...field} className="h-14 rounded-2xl bg-muted/30 border-0 focus-visible:ring-primary font-bold px-5" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-2">Email Node</FormLabel>
                        <FormControl><Input type="email" placeholder="node@travel.com" {...field} className="h-14 rounded-2xl bg-muted/30 border-0 focus-visible:ring-primary font-bold px-5" /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="mobile" render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-2">Contact</FormLabel>
                        <FormControl><Input type="tel" placeholder="10 Digits" {...field} className="h-14 rounded-2xl bg-muted/30 border-0 focus-visible:ring-primary font-bold px-5" /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-2">Access Key Sequence</FormLabel>
                      <div className="relative">
                        <Input type="password" placeholder="Min 8 characters" {...field} className="h-14 rounded-2xl bg-muted/30 border-0 focus-visible:ring-primary font-bold pl-12" />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {serverError && (
                    <div className="p-4 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 border border-destructive/10">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{serverError}</span>
                    </div>
                  )}

                  {!useFallback ? (
                    <Button
                        type="button"
                        onClick={initiateVerification}
                        className="w-full h-16 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-primary text-white shadow-xl transition-all active:scale-95 group"
                        disabled={isLoading || isGoogleLoading}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                        Initialize Node
                    </Button>
                  ) : (
                    <Button
                        type="button"
                        onClick={handleStandardRegistration}
                        className="w-full h-16 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-accent text-accent-foreground shadow-xl saffron-glow transition-all active:scale-95"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Compass className="mr-2 h-5 w-5" />}
                        JOIN DIRECTLY
                    </Button>
                  )}
                </form>
              </Form>
            </>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
               <div className="space-y-4 text-center">
                  <label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground block">Input Protocol Code</label>
                  <Input 
                    type="text" 
                    maxLength={6} 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="h-24 text-5xl font-black text-center tracking-[0.5em] rounded-3xl bg-muted/20 border-black/5 focus-visible:ring-primary text-primary shadow-inner"
                    placeholder="000000"
                  />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Code Expires in 10 minutes</p>
               </div>
               
               {serverError && <div className="p-4 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest rounded-2xl text-center border border-destructive/10">{serverError}</div>}
               
               <div className="space-y-4">
                    <Button
                        onClick={finalizeRegistration}
                        className="w-full h-16 rounded-full text-xs font-black uppercase tracking-widest bg-accent text-accent-foreground shadow-xl saffron-glow transition-all active:scale-95"
                        disabled={isVerifying}
                    >
                        {isVerifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                        Finalize Identity
                    </Button>
                    <Button variant="ghost" onClick={() => setOtpSent(false)} className="w-full h-12 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors" disabled={isVerifying}>
                        Modify Registry Details
                    </Button>
               </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center border-t border-black/5 bg-muted/10 p-8">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Known Explorer? <Link href="/login" className="font-black text-primary hover:text-accent transition-colors">Sign In</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}
