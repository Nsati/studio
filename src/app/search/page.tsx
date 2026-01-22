import { Suspense } from 'react';
import { searchHotels } from './actions';
import { SearchFilters } from './SearchFilters';
import { HotelCard } from '@/components/hotel/HotelCard';
import { Hotel } from '@/lib/types';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}


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

// This is an async Server Component that fetches and displays search results.
async function Results({ searchParams }: SearchPageProps) {
  const city = typeof searchParams.city === 'string' ? searchParams.city : null;
  const checkIn = typeof searchParams.checkIn === 'string' ? searchParams.checkIn : null;
  const checkOut = typeof searchParams.checkOut === 'string' ? searchParams.checkOut : null;
  const guests = typeof searchParams.guests === 'string' ? searchParams.guests : null;
  
  // Await the server action to get hotels based on search criteria.
  const hotels: Hotel[] = await searchHotels({ city, checkIn, checkOut, guests });

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
          <h3 className="font-headline text-2xl font-bold">No Results Found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search filters. Availability is checked for the selected dates.
          </p>
        </div>
      )}
    </div>
  );
}


export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* SearchFilters is a Client Component for interactivity. */}
        <SearchFilters />
        
        {/* Results is a Server Component, wrapped in Suspense for streaming. */}
        <Suspense fallback={<ResultsSkeleton />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
