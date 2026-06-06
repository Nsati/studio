'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  ArrowRight, 
  Mountain, 
  Star, 
  Heart, 
  Mail,
  Lock,
  Fingerprint,
  MailCheck,
  Smartphone
} from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Image from 'next/image';
import { sendSignupOTPAction, verifyOTPAction } from '@/app/auth/actions';

/**
 * @fileOverview Production-Hardened Split-Panel Signup Node.
 * Redesigned for a more compact and balanced proportional layout.
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

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/my-bookings');
    }
  }, [user, isUserLoading, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', mobile: '', password: '' },
  });

  const handleGoogleSignup = async () => {
    if (!auth || !firestore) return;
    setIsGoogleLoading(true);
    setServerError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      await setDoc(doc(firestore, 'users', fbUser.uid), {
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
      if (err.code !== 'auth/popup-closed-by-user') setServerError("Identity link failed.");
    } finally { setIsGoogleLoading(false); }
  };

  const initiateVerification = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    setIsLoading(true);
    try {
        const values = form.getValues();
        const res = await sendSignupOTPAction(values.email, values.name);
        if (res.success) {
          setOtpSent(true);
          toast({ title: 'Code Dispatched', description: res.message });
        } else {
          setServerError(res.message);
        }
    } catch (e: any) { 
        setServerError("Verification node currently under maintenance. Please try again soon."); 
    } finally { setIsLoading(false); }
  };

  const finalizeRegistration = async () => {
    if (otpCode.length !== 6) { setServerError("6 digits required."); return; }
    setIsVerifying(true);
    const values = form.getValues();
    try {
        const verifyRes = await verifyOTPAction(values.email, otpCode);
        if (verifyRes.success) { 
            await handleStandardRegistration(); 
        } else { 
            setServerError(verifyRes.message || "Incorrect verification sequence."); 
        }
    } catch (e) {
        setServerError("Critical error during identity finalization.");
    } finally {
        setIsVerifying(false);
    }
  };

  const handleStandardRegistration = async () => {
    if (!auth || !firestore) return;
    const values = form.getValues();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const fbUser = userCredential.user;
        await setDoc(doc(firestore, 'users', fbUser.uid), {
            uid: fbUser.uid,
            displayName: values.name,
            email: values.email,
            mobile: values.mobile,
            role: 'user',
            status: 'active',
        });
        toast({ title: 'Node Established', description: 'Welcome to Northern Harrier.' });
        router.push('/my-bookings');
    } catch (error: any) { 
        setServerError("Registration protocol failed. Please contact support."); 
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center p-4">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Visual Branding (Compact) */}
        <div className="md:w-[38%] relative hidden md:block overflow-hidden">
            <Image 
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200" 
                alt="Mountains" 
                fill 
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent" />
            <div className="absolute inset-0 p-10 flex flex-col justify-between text-white">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center"><Mountain className="h-5 w-5 text-primary" /></div>
                <div className="space-y-4">
                    <h2 className="text-3xl font-black tracking-tight leading-tight uppercase">Join the <br/>Expedition.</h2>
                    <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Discover the soul of Uttarakhand with us.</p>
                    <div className="pt-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3"><Star className="h-4 w-4 opacity-70" /><p className="text-[7px] font-black uppercase tracking-widest">Verified Stays</p></div>
                        <div className="flex items-center gap-3"><Heart className="h-4 w-4 opacity-70" /><p className="text-[7px] font-black uppercase tracking-widest">Local Protocol</p></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Side: Signup Form Node (Focused) */}
        <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                    <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto border border-primary/10">
                        {otpSent ? <MailCheck className="h-5 w-5 text-primary" /> : <Fingerprint className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">{otpSent ? 'Verify Protocol' : 'Join Hub'}</h1>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Establish identity node</p>
                    </div>
                </div>

                {!otpSent ? (
                    <>
                        <Button 
                            variant="outline" 
                            className="w-full h-12 rounded-full font-bold text-xs border-slate-200 hover:bg-slate-50 gap-3 shadow-sm"
                            onClick={handleGoogleSignup}
                            disabled={isGoogleLoading || isLoading}
                        >
                             <svg className="h-4 w-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.48-.98 7.31-2.64l-3.57-2.77c-1 .67-2.28 1.07-3.74 1.07-2.88 0-5.32-1.92-6.19-4.51H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.81 14.15c-.22-.67-.35-1.39-.35-2.15s.13-1.48.35-2.15V7.01H2.18C1.4 8.61 1 10.39 1 12s.4 3.39 1.18 4.99l3.63-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.01l3.63 2.84c.87-2.6 3.31-4.51 6.19-4.51z" fill="#EA4335"/>
                            </svg>
                            Sync with Google
                        </Button>

                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-slate-100" />
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">IDENTITY</span>
                            <div className="h-px flex-1 bg-slate-100" />
                        </div>

                        <Form {...form}>
                            <form className="space-y-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[9px] font-black uppercase text-slate-400 ml-1">Legal Name</FormLabel>
                                        <FormControl><Input placeholder="Himalayan Explorer" {...field} className="h-12 rounded-full bg-slate-50 border-0 font-bold px-5 text-xs" /></FormControl>
                                        <FormMessage className="text-[9px]" />
                                    </FormItem>
                                )} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-[9px] font-black uppercase text-slate-400 ml-1">Email Node</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                                    <Input type="email" placeholder="node@domain.com" {...field} className="h-12 rounded-full bg-slate-50 border-0 font-bold pl-10 pr-4 text-xs" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[9px]" />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="mobile" render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-[9px] font-black uppercase text-slate-400 ml-1">Contact Node</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                                    <Input type="tel" placeholder="10 digits" {...field} className="h-12 rounded-full bg-slate-50 border-0 font-bold pl-10 pr-4 text-xs" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[9px]" />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="password" render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[9px] font-black uppercase text-slate-400 ml-1">Access Key</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                                <Input type="password" placeholder="Min 8 characters" {...field} className="h-12 rounded-full bg-slate-50 border-0 font-bold pl-10 pr-4 text-xs" />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[9px]" />
                                    </FormItem>
                                )} />

                                {serverError && <div className="p-2 bg-red-50 text-red-600 text-[8px] font-black uppercase rounded-xl text-center border border-red-100">{serverError}</div>}

                                <Button 
                                    type="button" 
                                    onClick={initiateVerification}
                                    className="w-full h-12 rounded-full bg-primary text-white font-black text-sm shadow-xl hover:bg-slate-900 transition-all active:scale-95 group"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register Identity'}
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </form>
                        </Form>
                    </>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3">
                        <div className="space-y-3 text-center">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Protocol Code</Label>
                            <Input 
                                type="text" maxLength={6} value={otpCode} onChange={e => setOtpCode(e.target.value)}
                                className="h-16 text-3xl font-black text-center tracking-[0.3em] rounded-2xl bg-slate-50 border-0 focus-visible:ring-primary text-primary"
                                placeholder="000000"
                            />
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Dispatched to your email</p>
                        </div>
                        <Button 
                            onClick={finalizeRegistration} 
                            disabled={isVerifying}
                            className="w-full h-14 rounded-full bg-primary font-black text-sm shadow-xl"
                        >
                            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Establish Node'}
                        </Button>
                        <Button variant="ghost" onClick={() => setOtpSent(false)} className="w-full text-[8px] font-black uppercase tracking-widest text-slate-400">Modify Data</Button>
                    </div>
                )}
                
                <p className="text-center text-xs font-bold text-slate-400">
                    Already an explorer? <Link href="/login" className="text-primary font-black hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
