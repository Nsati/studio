
'use client';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { getHotels } from '@/lib/data';
import { useState, useEffect } from 'react';
import type { Hotel } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const authorized = sessionStorage.getItem('isAdminAuthorized') === 'true';
    if (authorized) {
      setIsAuthorized(true);
      setHotels(getHotels());
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

  // This part is not needed as redirection will handle unauthorized access.
  // We can leave it to avoid a flash of content.
  if (!isAuthorized) {
      return null;
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your hotels and content.
        </p>
      </div>

      <AdminTabs hotels={hotels} />
    </div>
  );
}
