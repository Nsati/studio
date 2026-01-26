'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { HotelCard } from '@/components/hotel/HotelCard';
import Loading from './loading';
import { SearchFilters } from './SearchFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function SearchResults() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const city = searchParams.get('city');

  const hotelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;

    let q = query(collection(firestore, 'hotels'));

    if (city && city !== 'All') {
      q = query(q, where('city', '==', city));
    }
    
    return q;
  }, [firestore, city]);

  const { data: hotels, isLoading } = useCollection<Hotel>(hotelsQuery);
  
  if (isLoading) {
      return (
        <div className="flex-1">
             <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="p-0">
                        <CardContent className="p-0">
                            <Skeleton className="h-48 w-full" />
                        </CardContent>
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    </Card>
                ))}
             </div>
        </div>
      )
  }

  return (
    <div className="flex-1">
        <div className="mb-6">
            <h1 className="font-headline text-3xl font-bold">
                {city && city !== 'All' ? `Hotels in ${city}` : 'All Hotels'}
            </h1>
            <p className="text-muted-foreground mt-1">
                {hotels ? `${hotels.length} properties found.` : 'Finding the best stays for you...'}
            </p>
        </div>
      {hotels && hotels.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">No hotels found for the selected filters.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <SearchFilters />
        <Suspense fallback={<Loading />}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
