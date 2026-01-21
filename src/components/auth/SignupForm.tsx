'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, writeBatch, setDoc } from 'firebase/firestore';
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
import { Loader2 } from 'lucide-react';
import { OtpVerification } from '@/lib/types';
import { sendOtpSmsAction } from '@/app/auth/actions';

export async function handleOtpSend(
  firestore: any,
  userId: string,
  phoneNumber: string
) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
  const otpRef = doc(firestore, 'otp_verification', userId);
  const otpData: OtpVerification = { otp, expiresAt };

  // First, save the OTP to Firestore
  await setDoc(otpRef, otpData);
  
  // Then, call the server action to send the SMS
  const result = await sendOtpSmsAction(phoneNumber, otp);

  // Throw an error from the server action if it fails, so we can catch it.
  if (!result.success) {
    throw new Error('Failed to send OTP SMS. Please check server logs.');
  }
}

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phoneNumber: z
    .string()
    .regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit mobile number.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[a-z]/, { message: 'Password needs a lowercase letter.' })
    .regex(/[A-Z]/, { message: 'Password needs an uppercase letter.' })
    .regex(/[0-9]/, { message: 'Password needs a number.' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Password needs a special character.' }),
});

export function SignupForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!auth || !firestore) return;

    setIsLoading(true);
    setServerError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      const batch = writeBatch(firestore);

      const userRef = doc(firestore, 'users', user.uid);
      batch.set(userRef, {
        uid: user.uid,
        displayName: values.name,
        email: user.email,
        phoneNumber: values.phoneNumber,
        role: 'user',
        status: 'pending',
      });

      await batch.commit();
      await handleOtpSend(firestore, user.uid, values.phoneNumber);

      toast({
        title: 'Account Created!',
        description: "We've sent an OTP to your mobile. Please verify to continue.",
      });

      router.push(`/verify-otp?phone=${encodeURIComponent(values.phoneNumber)}`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        form.setError('email', { message: 'A user with this email already exists.' });
      } else {
        setServerError(error.message || 'An error occurred during signup.');
        console.error(error);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">
            Create an Account
          </CardTitle>
          <CardDescription>
            Join us to start planning your getaway
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Ankit Sharma" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="9876543210" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ankit.sharma@example.com" {...field} />
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
                      <Input type="password" {...field} />
                    </FormControl>
                     <FormDescription className="text-xs">
                        Must be 8+ characters with uppercase, lowercase, number, and special characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !auth}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign Up
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
