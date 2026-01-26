'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';

import type { City } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Info, Calendar, Users } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';


export function SearchFilters() {
  const firestore = useFirestore();
  
  const citiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'cities');
  }, [firestore]);
  
  const { data: citiesFromDB, isLoading: isLoadingCities } = useCollection<City>(citiesQuery);

  const cities = useMemoFirebase(() => {
    return (citiesFromDB || []).sort((a, b) => a.name.localeCompare(b.name));
  }, [citiesFromDB]);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [city, setCity] = useState(searchParams.get('city') || 'All');
  
  useEffect(() => {
    setCity(searchParams.get('city') || 'All');
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
    router.push(`${pathname}?${createQueryString({ city: city === 'All' ? null : city })}`);
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
            
            <TooltipProvider>
                <div className="space-y-4 border-t pt-4">
                     <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold text-muted-foreground">
                            Filter by Date &amp; Guests
                        </Label>
                        <Tooltip>
                            <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                            <TooltipContent>
                                <p>This feature is coming soon!</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="space-y-2 opacity-50">
                        <Label htmlFor="checkin" className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Check-in</Label>
                        <Input id="checkin" type="date" disabled />
                    </div>
                     <div className="space-y-2 opacity-50">
                        <Label htmlFor="checkout" className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Check-out</Label>
                        <Input id="checkout" type="date" disabled />
                    </div>
                     <div className="space-y-2 opacity-50">
                        <Label htmlFor="guests" className="flex items-center gap-2"><Users className="h-4 w-4" /> Guests</Label>
                        <Input id="guests" type="number" min="1" placeholder="2" disabled />
                    </div>
                </div>
            </TooltipProvider>

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
