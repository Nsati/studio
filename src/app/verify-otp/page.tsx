'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createUser } from '@/app/auth/actions';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyOtpComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const mobile = searchParams.get('mobile');

    useEffect(() => {
        if (!mobile) {
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: 'Mobile number not found. Please start over.',
            });
            router.replace('/signup');
        }
    }, [mobile, router, toast]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const correctOtp = sessionStorage.getItem('signup_otp');
        const signupDataString = sessionStorage.getItem('signup_data');

        if (!correctOtp || !signupDataString) {
            setError('Session expired. Please try signing up again.');
            setIsLoading(false);
            return;
        }

        if (otp === correctOtp) {
            try {
                const signupData = JSON.parse(signupDataString);
                const result = await createUser({
                    name: signupData.name,
                    email: signupData.email,
                    mobile: signupData.mobile,
                    pass: signupData.password,
                });
                
                if (result.success) {
                    // Cleanup session storage
                    sessionStorage.removeItem('signup_data');
                    sessionStorage.removeItem('signup_otp');

                    toast({
                        title: 'Account Created!',
                        description: 'You can now log in with your credentials.',
                    });
                    router.push('/login');
                } else {
                    throw new Error(result.error || 'Failed to create account.');
                }

            } catch (e: any) {
                setError(e.message);
            }
        } else {
            setError('Invalid OTP. Please try again.');
        }

        setIsLoading(false);
    };

    return (
        <div className="container flex min-h-[80vh] items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">Verify Your Mobile</CardTitle>
                    <CardDescription>
                        We've sent a 6-digit OTP to your number ending in ...{mobile?.slice(-4)}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-center">
                            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        
                        {error && <p className="text-sm text-center text-destructive">{error}</p>}
                        
                        <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify & Create Account
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-center text-sm text-muted-foreground">
                    <p>Didn't receive the OTP?</p>
                    <Button variant="link" asChild>
                         <Link href="/signup">Try signing up again</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}


export default function VerifyOtpPage() {
    return (
        // Suspense is needed because VerifyOtpComponent uses useSearchParams
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpComponent />
        </Suspense>
    );
}