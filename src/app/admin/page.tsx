
'use client';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { getHotels, getBookings } from '@/lib/data';
import { useState, useEffect } from 'react';
import type { Booking, Hotel, User } from '@/lib/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const authorized = sessionStorage.getItem('isAdminAuthorized') === 'true';
    if (authorized) {
      setIsAuthorized(true);
      setHotels(getHotels());
      setBookings(getBookings());
    } else {
      router.replace('/admin/login');
    }
    setIsLoading(false);
  }, [router]);
  
  if (isLoading) {
      return (
          <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
              <p>Loading...</p>
          </div>
      )
  }

  if (!isAuthorized) {
      // This will be shown briefly before redirect
      return (
          <div className="container mx-auto max-w-2xl py-12 px-4 md:px-6">
              <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Access Denied</AlertTitle>
                  <AlertDescription>
                      You do not have permission to view this page. Redirecting to login...
                  </AlertDescription>
              </Alert>
          </div>
      )
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your hotels, bookings, and content.
        </p>
      </div>

      <AdminTabs hotels={hotels} initialBookings={bookings} />
    </div>
  );
}
