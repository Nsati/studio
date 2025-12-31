
'use client';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { getHotels, getBookings } from '@/lib/data';
import { useFirestore, useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import type { Booking, Hotel } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';

export default function AdminPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
        if (user && firestore) {
            const adminRoleDoc = await getDoc(doc(firestore, 'roles_admin', user.uid));
            setIsAdmin(adminRoleDoc.exists());
        }
    }
    checkAdminStatus();
  }, [user, firestore]);

  useEffect(() => {
    async function fetchData() {
      if (!firestore || !user || !isAdmin) return;

      setIsLoading(true);
      
      const fetchedHotels = await getHotels(firestore);
      setHotels(fetchedHotels);

      const allBookings: Booking[] = [];
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      for (const userDoc of usersSnapshot.docs) {
        const userBookings = await getBookings(firestore, userDoc.id);
        allBookings.push(...userBookings);
      }
      setBookings(allBookings);

      setIsLoading(false);
    }

    if (isAdmin) {
        fetchData();
    }
  }, [firestore, user, isAdmin]);


  if (isLoading) {
    return (
        <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                Loading management tools...
                </p>
            </div>
        </div>
    )
  }

  if (!user || !isAdmin) {
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
