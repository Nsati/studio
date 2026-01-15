'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useEffect } from 'react';
import { HotelManagementClient } from '@/components/admin/HotelManagementClient';

export default function AdminPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return <HotelManagementClient />;
}
