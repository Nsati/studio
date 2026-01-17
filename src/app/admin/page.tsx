'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { verifyAdminPassword } from './actions';
import { ContentManagement } from '@/components/admin/ContentManagement';


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


export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <AdminLoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
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
