
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { checkServerConfig } from '@/app/booking/actions';

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
import { Search, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export function SearchFilters() {
  const firestore = useFirestore();
  const [isServerConfigured, setIsServerConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    checkServerConfig().then(result => {
        setIsServerConfigured(result.isConfigured);
    });
  }, []);
  
  const citiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'cities');
  }, [firestore]);
  
  const { data: citiesFromDB, isLoading: isLoadingCities } = useCollection<City>(citiesQuery);

  const cities = useMemoFirebase(() => {
    const sortedCities = (citiesFromDB || []).sort((a, b) => a.name.localeCompare(b.name));
    if (sortedCities.length > 0) return sortedCities;
    if (!isLoadingCities) return dummyCities;
    return [];
  }, [citiesFromDB, isLoadingCities]);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [checkin, setCheckin] = useState(searchParams.get('checkIn') || '');
  const [checkout, setCheckout] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '1');
  
  useEffect(() => {
    setCity(searchParams.get('city') || 'All');
    setCheckin(searchParams.get('checkIn') || '');
    setCheckout(searchParams.get('checkOut') || '');
    setGuests(searchParams.get('guests') || '1');
  }, [searchParams]);

  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value) {
            newSearchParams.set(key, value);
        }
    }
    return newSearchParams.toString();
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`${pathname}?${createQueryString({ city: city === 'All' ? null : city, checkIn: isServerConfigured ? checkin : null, checkOut: isServerConfigured ? checkout: null, guests: isServerConfigured ? guests : null })}`);
  }
  
  const availabilitySearchDisabled = isServerConfigured === false;

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
                <div className="flex items-center justify-between">
                    <Label htmlFor="checkin" className={cn("text-lg font-semibold", availabilitySearchDisabled && "text-muted-foreground")}>
                        Check-in
                    </Label>
                    {availabilitySearchDisabled && (
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                <TooltipContent>
                                    <p>Server not configured for availability search.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <Input id="checkin" type="date" value={checkin} onChange={e => setCheckin(e.target.value)} disabled={availabilitySearchDisabled} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="checkout" className={cn("text-lg font-semibold", availabilitySearchDisabled && "text-muted-foreground")}>
                    Check-out
                </Label>
                <Input id="checkout" type="date" value={checkout} onChange={e => setCheckout(e.target.value)} disabled={availabilitySearchDisabled} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="guests" className={cn("text-lg font-semibold", availabilitySearchDisabled && "text-muted-foreground")}>
                    Guests
                </Label>
                <Input id="guests" type="number" min="1" placeholder="2" value={guests} onChange={e => setGuests(e.target.value)} disabled={availabilitySearchDisabled}/>
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
