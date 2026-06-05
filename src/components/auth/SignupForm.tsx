
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
import { Loader2, Chrome, UserPlus, ShieldCheck, MailCheck, Lock, Smartphone } from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { sendSignupOTPAction, verifyOTPAction } from '@/app/auth/actions';

/**
 * @fileOverview High-Security Two-Step Registration Form.
 * Features: SMTP OTP Verification and Hybrid Identity Sync.
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
  
  // Protocol Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

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

      // Identity Sync Node
      const userRef = doc(firestore, 'users', fbUser.uid);
      await setDoc(userRef, {
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'Himalayan Explorer',
        email: fbUser.email,
        mobile: fbUser.phoneNumber || '',
        role: 'user',
        status: 'active',
      }, { merge: true });

      toast({ title: 'Gateway Synchronized', description: 'Welcome to Northern Harrier.' });
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

    const values = form.getValues();
    const res = await sendSignupOTPAction(values.email, values.name);
    
    if (res.success) {
      setOtpSent(true);
      toast({ title: 'Protocol Initialized', description: res.message });
    } else {
      setServerError(res.message);
    }
    setIsLoading(false);
  };

  const finalizeRegistration = async () => {
    if (otpCode.length !== 6) {
        setServerError("Invalid code length. 6 digits required.");
        return;
    }

    setIsVerifying(true);
    setServerError('');

    const values = form.getValues();
    const verifyRes = await verifyOTPAction(values.email, otpCode);

    if (verifyRes.success) {
        try {
            // Establish Firebase Auth Identity
            const userCredential = await createUserWithEmailAndPassword(auth!, values.email, values.password);
            const fbUser = userCredential.user;

            const newUserProfile: UserProfile = {
                uid: fbUser.uid,
                displayName: values.name,
                email: values.email,
                mobile: values.mobile,
                role: 'user',
                status: 'active',
            };

            await setDoc(doc(firestore!, 'users', fbUser.uid), newUserProfile);
            
            toast({ title: 'Verification Success', description: 'Explorer identity established.' });
            router.push('/my-bookings');
        } catch (error: any) {
            setServerError(error.message || "Auth establishment failed.");
        }
    } else {
        setServerError(verifyRes.message || "Incorrect verification sequence.");
    }
    setIsVerifying(false);
  };

  if (isUserLoading) {
    return (
      <div className="container min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Syncing Satellites</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container min-h-screen flex items-center justify-center py-24 bg-muted/30">
      <Card className="w-full max-w-md shadow-2xl border-black/5 bg-white rounded-[3rem] overflow-hidden">
        <CardHeader className="text-center space-y-3 p-10 pb-6">
          <div className="mx-auto bg-primary/10 p-5 rounded-full w-fit">
            {otpSent ? <MailCheck className="h-8 w-8 text-primary" /> : <UserPlus className="h-8 w-8 text-primary" />}
          </div>
          <CardTitle className="font-black text-4xl tracking-tighter text-[#1a1a1a]">
            {otpSent ? 'Verify Protocol' : 'Join Expedition'}
          </CardTitle>
          <CardDescription className="text-base font-medium">
            {otpSent ? `Sync code sent to ${form.getValues().email}` : 'Establish your Himalayan identity node.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-10 pb-10">
          {!otpSent ? (
            <>
              <Button
                variant="outline"
                className="w-full h-14 rounded-full text-[11px] font-black tracking-widest border-black/10 flex items-center justify-center gap-3 transition-all hover:bg-muted active:scale-95"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4 text-blue-500" />}
                <span>IDENTITY SYNC VIA GOOGLE</span>
              </Button>

              <div className="relative flex items-center justify-center">
                <Separator className="absolute w-full opacity-10" />
                <span className="relative bg-white px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Secure Protocol
                </span>
              </div>

              <Form {...form}>
                <form className="space-y-5">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Legal Name</FormLabel>
                      <FormControl><Input placeholder="Explorer Name" {...field} className="h-14 rounded-2xl bg-muted/50 border-0 focus-visible:ring-primary font-bold px-5" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Node</FormLabel>
                      <FormControl><Input type="email" placeholder="explorer@node.com" {...field} className="h-14 rounded-2xl bg-muted/50 border-0 focus-visible:ring-primary font-bold px-5" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="mobile" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contact Node</FormLabel>
                      <div className="relative">
                        <Input type="tel" placeholder="Mobile Number" {...field} className="h-14 rounded-2xl bg-muted/50 border-0 focus-visible:ring-primary font-bold pl-12" />
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Key Sequence</FormLabel>
                      <div className="relative">
                        <Input type="password" placeholder="Min 8 characters" {...field} className="h-14 rounded-2xl bg-muted/50 border-0 focus-visible:ring-primary font-bold pl-12" />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {serverError && <div className="p-4 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest rounded-2xl text-center">{serverError}</div>}

                  <Button
                    type="button"
                    onClick={initiateVerification}
                    className="w-full h-16 rounded-full text-sm font-black bg-primary text-white shadow-xl shadow-primary/20 transition-all active:scale-95"
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                    INITIATE VERIFICATION
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-center block text-muted-foreground">Input 6-Digit Protocol Code</label>
                  <Input 
                    type="text" 
                    maxLength={6} 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="h-24 text-5xl font-black text-center tracking-[0.5em] rounded-3xl bg-muted/50 border-0 focus-visible:ring-primary text-primary"
                    placeholder="000000"
                  />
               </div>

               {serverError && <div className="p-4 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest rounded-2xl text-center">{serverError}</div>}

               <div className="space-y-4">
                    <Button
                        onClick={finalizeRegistration}
                        className="w-full h-16 rounded-full text-sm font-black bg-accent text-accent-foreground shadow-xl saffron-glow transition-all active:scale-95"
                        disabled={isVerifying}
                    >
                        {isVerifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                        FINALIZE IDENTITY
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setOtpSent(false)}
                        className="w-full h-12 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary"
                        disabled={isVerifying}
                    >
                        Modify Node Details
                    </Button>
               </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-center border-t border-black/5 bg-muted/20 p-8">
          <p className="text-sm font-medium text-muted-foreground">
            Known Explorer? <Link href="/login" className="font-black text-primary hover:underline">Sign In Protocol</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
