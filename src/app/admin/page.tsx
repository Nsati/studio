'use client';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { getHotels, getBookings } from '@/lib/data';
import { useState, useEffect } from 'react';
import type { Hotel, Booking } from '@/lib/types';
import { useUser } from '@/hooks/useUser';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: isUserLoading } = useUser();

  useEffect(() => {
    // Wait for user context to load
    if (isUserLoading) {
        return;
    }
    
    // In a real app, you'd check for a custom claim or a document in a specific collection.
    // For this demo, we'll just check the email address.
    if (user && user.role === 'admin') {
      setHotels(getHotels());
      setBookings(getBookings());
    } else {
        // Silently do nothing, or redirect to a non-admin page.
        // The header logic should prevent non-admins from even seeing the link.
    }
    setIsLoading(false);
  }, [user, isUserLoading]);
  
  if (isLoading || isUserLoading) {
      return (
          <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center max-w-7xl py-8 px-4 md:px-6">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Verifying admin access...</p>
              </div>
          </div>
      )
  }

  if (!user || user.role !== 'admin') {
      return (
        <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center max-w-7xl py-8 px-4 md:px-6">
            <div className="flex flex-col items-center gap-4 text-center">
                <h2 className="font-headline text-3xl font-bold">Access Denied</h2>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
            </div>
        </div>
      );
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your hotels, bookings, and content.
        </p>
      </div>

      <AdminTabs hotels={hotels} bookings={bookings} />
    </div>
  );
}
