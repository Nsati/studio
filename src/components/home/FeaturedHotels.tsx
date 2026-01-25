
'use client';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { HotelCard } from '@/components/hotel/HotelCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { dummyHotels } from '@/lib/dummy-data';
import { useMemo } from 'react';

export function FeaturedHotels() {
  const firestore = useFirestore();

  const hotelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'hotels'), limit(4));
  }, [firestore]);

  const { data: liveHotels, isLoading, error } = useCollection<Hotel>(hotelsQuery);

  const featuredHotels = useMemo(() => {
    // If there's an error loading from Firestore (e.g. no credentials), use dummy data.
    if (error) {
      return dummyHotels.slice(0, 4);
    }
    // If data loaded from Firestore, use it.
    if (liveHotels && liveHotels.length > 0) {
      return liveHotels;
    }
    // If still loading, or if firestore is empty, use dummy data as a fallback.
    if (!isLoading && (!liveHotels || liveHotels.length === 0)) {
        return dummyHotels.slice(0, 4);
    }
    return [];
  }, [liveHotels, isLoading, error]);

  if (isLoading && !error) {
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
      return <p className="text-center text-muted-foreground">No featured hotels available yet.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {featuredHotels.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  );
}
