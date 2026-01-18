'use client';

import { useUser } from '@/firebase';
import { Loader2, ShieldAlert } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function AdminDashboard() {
  // This will be the main dashboard component for the admin
  return (
    <div>
      <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Welcome to the control center.</p>
      {/* Analytics and summary cards will go here */}
    </div>
  );
}


export default function AdminPage() {
  const { user, userProfile, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="container flex min-h-[80vh] items-center justify-center text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (userProfile?.role !== 'admin') {
    return (
      <div className="container flex min-h-[80vh] items-center justify-center text-center">
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <ShieldAlert className="h-8 w-8" />
                    Not Authorized
                </CardTitle>
                <CardDescription>
                    You do not have the required permissions to view this page.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Please contact the system administrator if you believe this is a mistake.</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <AdminDashboard />
    </div>
  );
}
