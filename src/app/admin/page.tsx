
'use client';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { getHotels, getBookings } from '@/lib/data';
import { useFirestore, useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import type { Booking, Hotel } from '@/lib/types';
import { collection, getDocs, query } from 'firebase/firestore';

export default function AdminPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!firestore || !user) return;

      setIsLoading(true);

      // Fetch all hotels
      const fetchedHotels = await getHotels(firestore);
      setHotels(fetchedHotels);

      // Fetch all bookings from all users
      const allBookings: Booking[] = [];
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      for (const userDoc of usersSnapshot.docs) {
        const userBookings = await getBookings(firestore, userDoc.id);
        allBookings.push(...userBookings);
      }
      setBookings(allBookings);

      setIsLoading(false);
    }
    fetchData();
  }, [firestore, user]);


  if (isLoading) {
    return (
        <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                Loading management tools...
                </p>
            </div>
            {/* You can add a skeleton loader here */}
        </div>
    )
  }

  // TODO: Add proper admin role check
  if (!user) {
     return (
        <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground mt-2">
                You must be an administrator to view this page.
                </p>
            </div>
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
