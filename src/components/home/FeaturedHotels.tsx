
'use client';
import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { HotelCard } from '@/components/hotel/HotelCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedHotels() {
  const firestore = useFirestore();

  const hotelsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'hotels'), limit(4));
  }, [firestore]);

  const { data: featuredHotels, isLoading } = useCollection<Hotel>(hotelsQuery);

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-border">
                    <CardContent className="p-0">
                    <Skeleton className="aspect-[4/3] w-full" />
                    </CardContent>
                    <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                    </div>
                </Card>
            ))}
        </div>
    )
  }

  if (!featuredHotels || featuredHotels.length === 0) {
      return <p className="text-center text-muted-foreground">No featured hotels available yet. Add some from the admin panel!</p>
  }


  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {featuredHotels.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  );
}
