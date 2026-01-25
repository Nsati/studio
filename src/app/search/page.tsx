
import Link from 'next/link';
import { searchHotels } from './actions';
import { SearchFilters } from './SearchFilters';
import { HotelCard } from '@/components/hotel/HotelCard';
import { Hotel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { SearchX, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


function Results({ hotels, city }: { hotels: Hotel[], city: string | null }) {
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
            We couldn't find any properties matching your search. Try adjusting your dates, changing your location, or removing some filters.
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <Link href="/search">Clear Filters & View All</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

// This is a server component that fetches data directly.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: { city?: string; checkIn?: string; checkOut?: string; guests?: string };
}) {

  // Data fetching happens on the server, before the page is rendered.
  const { hotels, error } = await searchHotels(searchParams);

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <SearchFilters />
        <div className="flex-1">
          {error ? (
             <Alert variant="destructive">
               <Terminal className="h-4 w-4" />
               <AlertTitle>Search Unavailable</AlertTitle>
               <AlertDescription>
                 {error} This is likely a server configuration issue. If you are the administrator, please ensure the Firebase Admin SDK is correctly set up with the necessary environment variables.
               </AlertDescription>
             </Alert>
          ) : (
            <Results hotels={hotels} city={searchParams.city || null} />
          )}
        </div>
      </div>
    </div>
  );
}
