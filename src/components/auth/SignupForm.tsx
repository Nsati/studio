
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
import { Loader2, Chrome, UserPlus } from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

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
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState('');

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
    if (!auth) return;
    setIsGoogleLoading(true);
    setServerError('');

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Identity verification failed');
      }

      toast({
        title: 'Signup Successful!',
        description: `Welcome to the family, ${data.user.displayName}!`,
      });
      
      router.push('/my-bookings');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setIsGoogleLoading(false);
        return;
      }
      if (err.code === 'auth/popup-blocked') {
        toast({
          variant: 'destructive',
          title: "Popup Blocked",
          description: "Please allow popups for this website to sign in with Google.",
        });
        setIsGoogleLoading(false);
        return;
      }
      const description = err.message || "Signup failed. Please try again.";
      setServerError(description);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!auth || !firestore) {
        setServerError("Authentication service is not available.");
        return;
    }
    
    setIsLoading(true);
    setServerError('');

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
      
        toast({
            title: 'Account Created!',
            description: 'Welcome aboard! Redirecting to your dashboard...',
        });
        
        router.push('/my-bookings');
      
    } catch (error: any) {
        let errorMessage = 'An unexpected error occurred during signup.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered. Please log in.';
        } else if (error.code) {
            errorMessage = error.code.replace('auth/', '').replace(/-/g, ' ');
        }
        setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="container flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card/50 backdrop-blur-sm rounded-[2rem] overflow-hidden">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-2">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl font-bold tracking-tight">
            Create Account
          </CardTitle>
          <CardDescription>
            Join Uttarakhand Getaways and explore the Himalayas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-8">
          <Button
            variant="outline"
            className="w-full h-12 text-sm font-bold transition-all active:scale-[0.98] hover:bg-muted/50 rounded-full border-black/10"
            onClick={handleGoogleSignup}
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
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <span className="bg-white px-4">Or sign up with email</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Ankit Sharma" {...field} className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-primary font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ankit@example.com"
                        {...field}
                        className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-primary font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mobile Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="9876543210" {...field} className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-primary font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-primary font-bold" />
                    </FormControl>
                    <FormDescription className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                      Minimum 8 characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <div className="bg-destructive/10 text-destructive text-[11px] font-black uppercase tracking-widest p-3 rounded-xl text-center">
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] rounded-full"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6 bg-muted/10 p-8">
          <p className="text-sm font-medium text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-black text-primary hover:underline transition-all"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
