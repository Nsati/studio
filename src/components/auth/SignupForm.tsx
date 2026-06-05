
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
import { Loader2, Chrome, UserPlus, ShieldCheck, MailCheck } from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { sendSignupOTPAction, verifyOTPAction } from '@/app/auth/actions';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  mobile: z
    .string()
    .length(10, { message: 'Mobile number must be 10 digits.' })
    .regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit mobile number.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
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
  
  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
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

      try {
        const idToken = await fbUser.getIdToken(true);
        const response = await fetch('/api/auth/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) throw new Error('API Unavailable');
      } catch (apiErr) {
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

      toast({ title: 'Signup Successful!', description: `Welcome to the family, Explorer!` });
      router.push('/my-bookings');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setServerError(err.message || "Signup failed.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSendOTP = async () => {
    const values = form.getValues();
    const isValid = await form.trigger();
    
    if (!isValid) return;

    setIsLoading(true);
    setServerError('');

    const res = await sendSignupOTPAction(values.email, values.name);
    
    if (res.success) {
      setOtpSent(true);
      toast({ title: 'OTP Sent!', description: res.message });
    } else {
      setServerError(res.message);
    }
    setIsLoading(false);
  };

  const handleVerifyAndSignup = async () => {
    if (otp.length !== 6) {
        setServerError("Please enter a valid 6-digit code.");
        return;
    }

    setIsVerifying(true);
    setServerError('');

    const verifyRes = await verifyOTPAction(form.getValues().email, otp);

    if (verifyRes.success) {
        // 2. Final Firebase Account Creation
        const values = form.getValues();
        try {
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
            
            toast({ title: 'Identity Verified!', description: 'Welcome to Northern Harrier family.' });
            router.push('/my-bookings');
        } catch (error: any) {
            setServerError(error.message);
        }
    } else {
        setServerError(verifyRes.message || "Invalid OTP.");
    }
    setIsVerifying(false);
  };

  if (isUserLoading) {
    return (
      <div className="container flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <CardTitle className="font-black text-4xl tracking-tight text-[#1a1a1a]">
            {otpSent ? 'Verify Identity' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-base font-medium">
            {otpSent ? `Enter the code sent to ${form.getValues().email}` : 'Join the Northern Harrier expedition today.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-10 pb-10">
          {!otpSent ? (
            <>
              <Button
                variant="outline"
                className="w-full h-14 rounded-full text-base font-bold border-black/10 flex items-center justify-center gap-3 transition-all hover:bg-muted active:scale-95"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5 text-blue-500" />}
                <span>Continue with Google</span>
              </Button>

              <div className="relative flex items-center justify-center">
                <Separator className="absolute w-full" />
                <span className="relative bg-white px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Or use secure email
                </span>
              </div>

              <Form {...form}>
                <form className="space-y-5">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Legal Name</FormLabel>
                      <FormControl><Input placeholder="Ankit Sharma" {...field} className="h-14 rounded-2xl bg-muted/50 border-0 focus-visible:ring-primary font-bold px-5" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secure Email Node</FormLabel>
                      <FormControl><Input type="email" placeholder="ankit@example.com" {...field} className="h-14 rounded-2xl bg-muted/50 border-0 focus-visible:ring-primary font-bold px-5" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="mobile" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contact Node</FormLabel>
                      <FormControl><Input type="tel" placeholder="9876543210" {...field} className="h-14 rounded-2xl bg-muted/50 border-0 focus-visible:ring-primary font-bold px-5" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Create Password</FormLabel>
                      <FormControl><Input type="password" {...field} className="h-14 rounded-2xl bg-muted/50 border-0 focus-visible:ring-primary font-bold px-5" /></FormControl>
                      <FormDescription className="text-[9px] font-bold uppercase tracking-widest ml-1 opacity-50">Minimum 8 characters required.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {serverError && <div className="p-4 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest rounded-2xl text-center">{serverError}</div>}

                  <Button
                    type="button"
                    onClick={handleSendOTP}
                    className="w-full h-14 rounded-full text-lg font-black bg-primary text-white shadow-xl shadow-primary/20 transition-all active:scale-95"
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
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-center block text-muted-foreground">Enter 6-Digit Code</Label>
                  <Input 
                    type="text" 
                    maxLength={6} 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-20 text-4xl font-black text-center tracking-[0.5em] rounded-3xl bg-muted/50 border-0 focus-visible:ring-primary"
                    placeholder="000000"
                  />
               </div>

               {serverError && <div className="p-4 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest rounded-2xl text-center">{serverError}</div>}

               <div className="space-y-3">
                    <Button
                        onClick={handleVerifyAndSignup}
                        className="w-full h-16 rounded-full text-lg font-black bg-accent text-accent-foreground shadow-xl saffron-glow transition-all active:scale-95"
                        disabled={isVerifying}
                    >
                        {isVerifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                        SYNC IDENTITY & JOIN
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setOtpSent(false)}
                        className="w-full h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary"
                    >
                        Change Registration Details
                    </Button>
               </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-center border-t border-black/5 bg-muted/20 p-8">
          <p className="text-sm font-medium text-muted-foreground">
            Existing Explorer? <Link href="/login" className="font-black text-primary hover:underline">Sign In Protocol</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
