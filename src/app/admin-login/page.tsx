'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

export default function AdminLoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const adminEmail = 'admin@uttarakhandgetaways.com'; // Hardcoded admin email

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    setIsLoading(true);
    setError('');

    try {
      // Use the hardcoded admin email
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, password);
      const user = userCredential.user;

      // Check if user is an admin
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && (userDoc.data() as UserProfile).role === 'admin') {
        toast({ title: 'Admin Login Successful!', description: `Welcome back, Admin!` });
        router.push('/admin');
      } else {
        await auth.signOut(); // Log out the user if they are not an admin
        setError('Access Denied. You do not have admin privileges.');
      }
    } catch (error: any) {
      // Provide a more helpful error for the user
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          setError('Invalid Password. Please ensure the admin account exists and the password is correct.');
      } else {
        setError('An unknown error occurred.');
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Admin Login</CardTitle>
          <CardDescription>
            Enter the admin password to access the dashboard.
            <br />
            <span className="text-xs text-muted-foreground">(First, sign up with email: admin@uttarakhandgetaways.com to create the admin account)</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              Log In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
