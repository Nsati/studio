
'use client';

import { useState } from 'react';
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
import { useAuth, useFirestore } from '@/firebase';
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
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState('');

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
      // 1. Trigger Google OAuth
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // 2. Get secure JWT (ID Token)
      const idToken = await result.user.getIdToken(true);

      // 3. Verify and sync with backend
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Backend verification failed');
      }

      toast({
        title: 'Signup Successful!',
        description: `Welcome to the family, ${data.user.displayName}!`,
      });
      
      router.push('/my-bookings');
    } catch (error: any) {
      console.error("Google signup error:", error);
      
      // Handle browser blocking the popup
      if (error.code === 'auth/popup-blocked') {
        toast({
          variant: 'destructive',
          title: 'Popup Blocked',
          description: 'Please allow popups for this website in your browser settings to sign up with Google.',
        });
      }
      // Handle the user closing the popup manually
      else if (error.code === 'auth/popup-closed-by-user') {
        toast({
          title: 'Signup Cancelled',
          description: 'The Google sign-up window was closed before completion.',
        });
      } else {
        setServerError(error.message || 'Could not sign up with Google. Please try again.');
        toast({
          variant: 'destructive',
          title: 'Auth Error',
          description: error.message || 'Verification failed.',
        });
      }
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
        const user = userCredential.user;

        const newUserProfile: UserProfile = {
            uid: user.uid,
            displayName: values.name,
            email: values.email,
            mobile: values.mobile,
            role: 'user',
            status: 'active',
        };

        // Create user profile in Firestore
        await setDoc(doc(firestore, 'users', user.uid), newUserProfile);
      
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
        console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-2xl border-border/50">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-2">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl font-bold">
            Create Account
          </CardTitle>
          <CardDescription>
            Join Uttarakhand Getaways and explore the Himalayas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            variant="outline"
            className="w-full h-12 text-base font-semibold"
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
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-medium">Or sign up with email</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Ankit Sharma" {...field} className="h-11" />
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ankit@example.com"
                        {...field}
                        className="h-11"
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
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="9876543210" {...field} className="h-11" />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} className="h-11" />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Minimum 8 characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-md text-center">
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-bold shadow-lg"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6 bg-muted/10">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
