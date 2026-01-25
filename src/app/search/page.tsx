
'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

import { SearchFilters } from './SearchFilters';
import { HotelCard } from '@/components/hotel/HotelCard';
import { Hotel } from '@/lib/types';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';


function ResultsSkeleton() {
    return (
      <div className="flex-1">
        <div className="mb-6">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="mt-2 h-5 w-1/4" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
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

function Results({ hotels, isLoading, city }: { hotels: Hotel[], isLoading: boolean, city: string | null }) {

  if (isLoading) {
    return <ResultsSkeleton />;
  }

  return (
    <div className="flex-1">
      <div className="mb-6">
        <h2 className="font-headline text-2xl font-bold md:text-3xl">
          {city && city !== 'All' ? `Stays in ${city}` : 'All Our Stays'}
        </h2>
        <p className="text-muted-foreground">{hotels?.length || 0} properties found.</p>
      </div>
      {hotels && hotels.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <HotelCard hotel={hotel} key={hotel.id} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
          <SearchX className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="font-headline text-2xl font-bold">No Stays Found</h3>
          <p className="mt-2 max-w-md text-muted-foreground">
            We couldn't find any properties matching your search. Add some from the admin panel to see them here.
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <Link href="/search">Clear Filters & View All</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function SearchPageComponent() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  const city = searchParams.get('city');

  // Memoize the query so useCollection doesn't cause infinite re-renders
  const hotelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;

    let q = query(collection(firestore, 'hotels'));
    
    // Apply city filter if it exists in the URL
    if (city && city !== 'All') {
      q = query(q, where('city', '==', city));
    }
    
    // Note: Availability filtering (by date/guests) is complex and was
    // dependent on a server-side action. To ensure the frontend reliably
    // displays data from Firestore, this client-side search currently
    // only filters by city.
    
    return q;
  }, [firestore, city]);

  const { data: hotels, isLoading } = useCollection<Hotel>(hotelsQuery);


  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <SearchFilters />
        <Results hotels={hotels || []} isLoading={isLoading} city={city} />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    // Suspense is required because SearchPageComponent uses useSearchParams
    <Suspense fallback={<div className="container mx-auto max-w-7xl py-8 px-4 md:px-6"><ResultsSkeleton/></div>}>
      <SearchPageComponent />
    </Suspense>
  )
}
