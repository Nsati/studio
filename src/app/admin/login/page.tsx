
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // In a real app, this would be a secure check against a backend.
    // For this mock implementation, we'll use a simple hardcoded password.
    setTimeout(() => {
      if (password === 'admin123') {
        sessionStorage.setItem('isAdminAuthorized', 'true');
        toast({
          title: 'Login Successful',
          description: 'Welcome, Admin!',
        });
        router.push('/admin');
      } else {
        setError('Incorrect password. Please try again.');
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'The password you entered is incorrect.',
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-muted/40">
      <div className="mx-auto grid w-[380px] gap-6">
        <div className="grid gap-2 text-center">
            <Logo className="justify-center" />
             <h1 className="text-3xl font-bold font-headline mt-4">Admin Access</h1>
            <p className="text-balance text-muted-foreground">
                Enter the administrator password to access the dashboard.
            </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              This area is restricted to authorized personnel only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
