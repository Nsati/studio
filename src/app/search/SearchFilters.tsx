'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection } from 'firebase/firestore';

import type { City } from '@/lib/types';
import { dummyCities } from '@/lib/dummy-data';
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


export function SearchFilters() {
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

  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [checkin, setCheckin] = useState(searchParams.get('checkin') || '');
  const [checkout, setCheckout] = useState(searchParams.get('checkout') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '1');
  
  useEffect(() => {
    setCity(searchParams.get('city') || 'All');
    setCheckin(searchParams.get('checkin') || '');
    setCheckout(searchParams.get('checkout') || '');
    setGuests(searchParams.get('guests') || '1');
  }, [searchParams]);

  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(); // Start fresh to remove old params
    for (const [key, value] of Object.entries(params)) {
        if (value) {
            newSearchParams.set(key, value);
        }
    }
    return newSearchParams.toString();
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`${pathname}?${createQueryString({ city: city === 'All' ? null : city, checkin, checkout, guests })}`);
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
              <Select value={city} onValueChange={setCity} disabled={isLoadingCities}>
                <SelectTrigger id="location">
                  <SelectValue placeholder={isLoadingCities ? "Loading cities..." : "Select a city"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Locations</SelectItem>
                  {cities?.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
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
