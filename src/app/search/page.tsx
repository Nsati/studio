'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { collection, query, where } from 'firebase/firestore';

import type { Hotel, City } from '@/lib/types';
import { useCollection, useFirestore } from '@/firebase';
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
import { Skeleton } from '@/components/ui/skeleton';

function SearchResults() {
  const searchParams = useSearchParams();
  const city = searchParams.get('city');
  const firestore = useFirestore();

  const hotelsQuery = useMemo(() => {
    if (!firestore) return null;
    const hotelsRef = collection(firestore, 'hotels');
    if (!city || city === 'All') {
      return hotelsRef;
    }
    return query(hotelsRef, where('city', '==', city));
  }, [firestore, city]);

  const { data: hotels, isLoading } = useCollection<Hotel>(hotelsQuery);

  if (isLoading) {
      return (
         <div className="flex-1">
          <div className="mb-6">
            <Skeleton className="h-9 w-1/2" />
            <Skeleton className="mt-2 h-5 w-1/4" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
               <Card key={i}><CardContent className="p-0"><Skeleton className="h-48 w-full" /></CardContent><div className="p-4 space-y-2"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-1/4" /></div></Card>
            ))}
          </div>
        </div>
      )
  }

  return (
    <div className="flex-1">
      <div className="mb-6">
        <h2 className="font-headline text-3xl font-bold">
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
  const { data: cities } = useCollection<City>(citiesQuery);
  
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
              <Select value={selectedCity} onValueChange={handleCityChange}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select a city" />
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
            <Button type="submit" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Update Search
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
