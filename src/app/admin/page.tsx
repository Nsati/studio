'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useEffect } from 'react';
import { HotelManagementClient } from '@/components/admin/HotelManagementClient';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/admin-login');
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role !== 'admin') {
    return (
        <div className="container mx-auto p-4 space-y-8">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
      </div>
    );
  }

  return <HotelManagementClient />;
}
