'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Briefcase, Hotel } from 'lucide-react';
import { UserList } from '@/components/admin/UserList';
import { BookingList } from '@/components/admin/BookingList';
import { HotelList } from '@/components/admin/HotelList';

export default function AdminPage() {
  const { user, userProfile, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && userProfile?.role !== 'admin') {
      router.push('/');
    }
  }, [user, userProfile, isLoading, router]);

  if (isLoading || userProfile?.role !== 'admin') {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/4" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
          <h1 className="font-headline text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your entire operation from one place.</p>
      </div>
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings"><Briefcase className="mr-2 h-4 w-4" />Bookings</TabsTrigger>
          <TabsTrigger value="users"><User className="mr-2 h-4 w-4" />Users</TabsTrigger>
          <TabsTrigger value="hotels"><Hotel className="mr-2 h-4 w-4" />Hotels</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings" className="mt-6">
          <BookingList />
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          <UserList />
        </TabsContent>
        <TabsContent value="hotels" className="mt-6">
          <HotelList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
