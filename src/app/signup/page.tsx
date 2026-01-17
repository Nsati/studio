'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, limit, query, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { revalidateAdminPanel } from '../admin/actions';

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if this is the first user OR if the email is the special admin email
      const usersQuery = query(collection(firestore, 'users'), limit(1));
      const usersSnapshot = await getDocs(usersQuery);
      const isFirstUser = usersSnapshot.empty;
      const isAdminEmail = email.toLowerCase() === 'admin@uttarakhandgetaways.com';
      const role = isFirstUser || isAdminEmail ? 'admin' : 'user';

      // Create user profile in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        displayName: name,
        email: user.email,
        role: role
      });

      await revalidateAdminPanel();
      toast({ 
        title: role === 'admin' ? 'Welcome, Admin!' : 'Account created!', 
        description: role === 'admin' ? "You have been registered as an admin." : "You've been successfully signed up." 
      });
      router.push(role === 'admin' ? '/admin' : '/my-bookings');

    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            setError('A user with this email already exists.');
        } else {
            setError('An error occurred during signup.');
            console.error(error);
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
          <CardDescription>Join us to start planning your getaway</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ankit Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ankit.sharma@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading || !auth || !firestore}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
