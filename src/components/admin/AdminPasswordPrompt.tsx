'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface AdminPasswordPromptProps {
  onSuccess: () => void;
}

export function AdminPasswordPrompt({ onSuccess }: AdminPasswordPromptProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      try {
        localStorage.setItem('admin_authenticated', 'true');
        onSuccess();
      } catch (e) {
        setError('Could not save session. Please enable cookies/localStorage.');
      }
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit">
                    <Shield className="h-8 w-8"/>
                </div>
                <CardTitle className="font-headline text-3xl mt-4">Admin Access Required</CardTitle>
                <CardDescription>Please enter the admin password to continue.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    <Button type="submit" className="w-full">
                        Unlock Admin Panel
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
