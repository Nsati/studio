'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import type { Hotel, City } from '@/lib/types';
import { HotelCard } from '@/components/hotel/HotelCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import Loading from './loading';
import { dummyCities, dummyHotels } from '@/lib/dummy-data';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

function SearchResults() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const city = searchParams.get('city');

  const hotelsQuery = useMemo(() => {
    if (!firestore) return null;
    let q = query(collection(firestore, 'hotels'));
    if (city && city !== 'All') {
      q = query(q, where('city', '==', city));
    }
    return q;
  }, [firestore, city]);

  const { data: liveHotels, isLoading } = useCollection<Hotel>(hotelsQuery);

  const hotels = useMemo(() => {
    if (liveHotels && liveHotels.length > 0) {
      return liveHotels;
    }
    if (!isLoading && (!liveHotels || liveHotels.length === 0)) {
      if (city && city !== 'All') {
        return dummyHotels.filter(h => h.city === city);
      }
      return dummyHotels;
    }
    return null;
  }, [liveHotels, isLoading, city]);

  if (isLoading || hotels === null) {
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

  return (
    <div className="flex-1">
      <div className="mb-6">
        <h2 className="font-headline text-2xl font-bold md:text-3xl">
          {searchParams.get('city') && searchParams.get('city') !== 'All' ? `Stays in ${searchParams.get('city')}` : 'All Our Stays'}
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
            Try adjusting your search filters or explore all our hotels.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              window.location.href = '/search';
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

function SearchFilters() {
  const firestore = useFirestore();
  const citiesQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'cities');
  }, [firestore]);

  const { data: citiesFromDB, isLoading: isLoadingCities } = useCollection<City>(citiesQuery);

  const cities = useMemo(() => {
    const sortedCities = (citiesFromDB || []).sort((a, b) => a.name.localeCompare(b.name));
    if (sortedCities.length > 0) return sortedCities;
    if (!isLoadingCities) return dummyCities;
    return [];
  }, [citiesFromDB, isLoadingCities]);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [checkin, setCheckin] = useState(searchParams.get('checkin') || '');
  const [checkout, setCheckout] = useState(searchParams.get('checkout') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '1');
  
  useEffect(() => {
    setSelectedCity(searchParams.get('city') || '');
    setCheckin(searchParams.get('checkin') || '');
    setCheckout(searchParams.get('checkout') || '');
    setGuests(searchParams.get('guests') || '1');
  }, [searchParams]);

  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
        if (value) {
            newSearchParams.set(key, value);
        } else {
            newSearchParams.delete(key);
        }
    }
    return newSearchParams.toString();
  };
  
  const handleCityChange = (city: string) => {
    const newCity = city === 'All' ? '' : city;
    setSelectedCity(newCity);
    router.push(`${pathname}?${createQueryString({ city: newCity || null })}`);
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`${pathname}?${createQueryString({ city: selectedCity === 'All' ? null : selectedCity, checkin, checkout, guests })}`);
  }

  return (
     <aside className="w-full lg:w-1/4 lg:pr-8">
      <Card>
        <CardContent className="p-4">
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-lg font-semibold">
                Location
              </Label>
              <Select value={selectedCity} onValueChange={handleCityChange} disabled={isLoadingCities}>
                <SelectTrigger id="location">
                  <SelectValue placeholder={isLoadingCities ? "Loading cities..." : "Select a city"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Locations</SelectItem>
                  {cities?.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkin" className="text-lg font-semibold">
                Check-in
              </Label>
              <Input id="checkin" type="date" value={checkin} onChange={e => setCheckin(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout" className="text-lg font-semibold">
                Check-out
              </Label>
              <Input id="checkout" type="date" value={checkout} onChange={e => setCheckout(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guests" className="text-lg font-semibold">
                Guests
              </Label>
              <Input id="guests" type="number" min="1" placeholder="2" value={guests} onChange={e => setGuests(e.target.value)} />
            </div>
            <Button type="submit" className="w-full text-lg h-12 bg-accent text-accent-foreground hover:bg-accent/90">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>
    </aside>
  );
}


export default function SearchPage() {
  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <Suspense fallback={<Loading />}>
            <SearchFilters />
            <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
