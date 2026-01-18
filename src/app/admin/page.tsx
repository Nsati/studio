'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldAlert } from 'lucide-react';
import { verifyAdminPassword } from './actions';
import { ContentManagement } from '@/components/admin/ContentManagement';
import { useUser } from '@/firebase';


function AdminLoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        const success = await verifyAdminPassword(password);
        if (success) {
          onLoginSuccess();
        } else {
          setError('Invalid password.');
        }
    } catch (e) {
        setError('An error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Admin Access</CardTitle>
          <CardDescription>
            Enter the password to access the dashboard.
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function NotAuthorized() {
    return (
        <div className="container flex min-h-[80vh] flex-col items-center justify-center text-center">
            <ShieldAlert className="h-16 w-16 text-destructive" />
            <h1 className="mt-8 font-headline text-4xl font-bold">
                Not Authorized
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                You do not have the required permissions to view this page.
            </p>
        </div>
    )
}


export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { userProfile, isLoading } = useUser();

  if (!isLoggedIn) {
    return <AdminLoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }
  
  if (isLoading) {
      return (
        <div className="container flex min-h-[80vh] items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      )
  }

  if (userProfile?.role !== 'admin') {
      return <NotAuthorized />;
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
          <h1 className="font-headline text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your users, hotels, and bookings from this dashboard.</p>
      </div>
      <ContentManagement />
    </div>
  );
}
