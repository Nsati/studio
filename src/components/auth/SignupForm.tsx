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
 * @fileOverview Compact Expedition Onboarding Node.
 */

const formSchema = z.object({
  name: z.string().min(2, { message: 'Legal name required.' }),
  email: z.string().email({ message: 'Valid email node required.' }),
  mobile: z
    .string()
    .length(10, { message: '10 digits required.' })
    .regex(/^\d{10}$/, { message: 'Numbers only.' }),
  password: z
    .string()
    .min(8, { message: 'Min 8 characters.' })
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

      toast({ title: 'Identity Established', description: 'Welcome explorer.' });
      router.push('/my-bookings');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setServerError("Identity link failed.");
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
          toast({ title: 'Code Dispatched', description: res.message });
        } else {
          setServerError(res.message);
          setUseFallback(true);
        }
    } catch (e: any) {
        setServerError("Auth node offline.");
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
        setServerError(verifyRes.message || "Incorrect sequence.");
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
        toast({ title: 'Node Established', description: 'Welcome to the grid.' });
        router.push('/my-bookings');
    } catch (error: any) {
        setServerError("Registration failed.");
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="container min-h-[90vh] flex items-center justify-center py-16 bg-background/50">
      <Card className="w-full max-w-sm shadow-apple-deep border-black/5 bg-white/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="text-center space-y-3 p-8 pb-4">
          <div className="mx-auto bg-primary/5 p-4 rounded-full w-fit">
            {otpSent ? (
                <MailCheck className="h-8 w-8 text-primary animate-pulse" />
            ) : (
                <Fingerprint className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="space-y-0.5">
            <CardTitle className="font-black text-2xl tracking-tighter uppercase text-primary">
                {otpSent ? 'Verify Protocol' : 'Join Expedition'}
            </CardTitle>
            <CardDescription className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Establish Your Identity
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          {!otpSent ? (
            <>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl text-[9px] font-black uppercase tracking-widest border-black/5 flex items-center justify-center gap-3 transition-all hover:bg-muted bg-white"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4 text-blue-500" />}
                <span>ID SYNC VIA GOOGLE</span>
              </Button>

              <div className="relative flex items-center justify-center">
                <Separator className="absolute w-full opacity-5" />
                <span className="relative bg-white/95 px-3 text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">Secure Node</span>
              </div>

              <Form {...form}>
                <form className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] font-black uppercase tracking-widest ml-1">Legal Name</FormLabel>
                      <FormControl><Input placeholder="Explorer Name" {...field} className="h-12 rounded-xl bg-muted/40 border-0 focus-visible:ring-primary font-bold px-4 text-xs" /></FormControl>
                      <FormMessage className="text-[8px]" />
                    </FormItem>
                  )} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[9px] font-black uppercase tracking-widest ml-1">Email</FormLabel>
                        <FormControl><Input type="email" placeholder="node@travel.com" {...field} className="h-12 rounded-xl bg-muted/40 border-0 focus-visible:ring-primary font-bold px-4 text-xs" /></FormControl>
                        <FormMessage className="text-[8px]" />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="mobile" render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[9px] font-black uppercase tracking-widest ml-1">Contact</FormLabel>
                        <FormControl><Input type="tel" placeholder="10 Digits" {...field} className="h-12 rounded-xl bg-muted/40 border-0 focus-visible:ring-primary font-bold px-4 text-xs" /></FormControl>
                        <FormMessage className="text-[8px]" />
                        </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] font-black uppercase tracking-widest ml-1">Access Key</FormLabel>
                      <div className="relative">
                        <Input type="password" placeholder="Min 8 chars" {...field} className="h-12 rounded-xl bg-muted/40 border-0 focus-visible:ring-primary font-bold pl-10 text-xs" />
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                      </div>
                      <FormMessage className="text-[8px]" />
                    </FormItem>
                  )} />

                  {serverError && (
                    <div className="p-3 bg-destructive/10 text-destructive text-[8px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 border border-destructive/10">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{serverError}</span>
                    </div>
                  )}

                  {!useFallback ? (
                    <Button
                        type="button"
                        onClick={initiateVerification}
                        className="w-full h-14 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-primary text-white shadow-lg transition-all active:scale-95 group"
                        disabled={isLoading || isGoogleLoading}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        Initialize Node
                    </Button>
                  ) : (
                    <Button
                        type="button"
                        onClick={handleStandardRegistration}
                        className="w-full h-14 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-accent text-accent-foreground shadow-lg transition-all active:scale-95"
                        disabled={isLoading}
                    >
                        JOIN DIRECTLY
                    </Button>
                  )}
                </form>
              </Form>
            </>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
               <div className="space-y-3 text-center">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground block">Protocol Code</label>
                  <Input 
                    type="text" 
                    maxLength={6} 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="h-20 text-4xl font-black text-center tracking-[0.4em] rounded-2xl bg-muted/20 border-black/5 focus-visible:ring-primary text-primary"
                    placeholder="000000"
                  />
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Valid for 10 minutes</p>
               </div>
               
               {serverError && <div className="p-3 bg-destructive/10 text-destructive text-[8px] font-black uppercase tracking-widest rounded-xl text-center border border-destructive/10">{serverError}</div>}
               
               <div className="space-y-3">
                    <Button
                        onClick={finalizeRegistration}
                        className="w-full h-14 rounded-full text-[10px] font-black uppercase tracking-widest bg-accent text-accent-foreground shadow-lg transition-all active:scale-95"
                        disabled={isVerifying}
                    >
                        {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Finalize Identity
                    </Button>
                    <Button variant="ghost" onClick={() => setOtpSent(false)} className="w-full h-10 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors" disabled={isVerifying}>
                        Modify Registry Details
                    </Button>
               </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center border-t border-black/5 bg-muted/5 p-6">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Known Explorer? <Link href="/login" className="font-black text-primary hover:text-accent transition-colors">Sign In</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}