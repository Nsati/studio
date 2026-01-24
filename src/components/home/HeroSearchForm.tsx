'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { collection } from 'firebase/firestore';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Search,
} from 'lucide-react';
import type { City } from '@/lib/types';
import { cn } from '@/lib/utils';
import { dummyCities } from '@/lib/dummy-data';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';

export function HeroSearchForm() {
  const router = useRouter();
  
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


  const [city, setCity] = useState<string>('');
  const [dates, setDates] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState<string>('2');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city && city !== 'All') params.set('city', city);
    if (dates?.from) params.set('checkin', format(dates.from, 'yyyy-MM-dd'));
    if (dates?.to) params.set('checkout', format(dates.to, 'yyyy-MM-dd'));
    if (guests) params.set('guests', guests);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-2 md:p-3">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 items-center gap-2 md:grid-cols-12"
        >
          <div className="flex items-center gap-2 rounded-md p-2 md:col-span-4">
            <MapPin className="h-5 w-5 text-primary" />
            <div className="flex-grow">
                <p className="text-xs font-semibold text-left text-muted-foreground">Location</p>
                 <Select onValueChange={setCity} value={city} disabled={isLoadingCities}>
                    <SelectTrigger className="w-full border-0 bg-transparent p-0 h-auto focus:ring-0 text-base font-semibold">
                    <SelectValue placeholder={isLoadingCities ? "Loading..." : "Where to?"} />
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
          </div>

          <div className="md:col-span-5">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start text-left font-normal p-2 h-auto hover:bg-transparent',
                    !dates && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Dates</p>
                    <p className="font-semibold text-base text-foreground">
                        {dates?.from ? (
                        dates.to ? (
                            <>
                            {format(dates.from, 'LLL dd, y')} -{' '}
                            {format(dates.to, 'LLL dd, y')}
                            </>
                        ) : (
                            format(dates.from, 'LLL dd, y')
                        )
                        ) : (
                        <span>Pick your dates</span>
                        )}
                    </p>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dates}
                  onSelect={setDates}
                  initialFocus
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2 rounded-md p-2 md:col-span-2">
            <Users className="h-5 w-5 text-primary" />
             <div className="flex-grow">
                <p className="text-xs font-semibold text-left text-muted-foreground">Guests</p>
                <Input
                    type="number"
                    placeholder="Guests"
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 font-semibold text-base"
                />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-bold md:col-span-1 bg-accent text-accent-foreground hover:bg-accent/90">
            <Search className="h-5 w-5 md:hidden" />
            <span className="hidden md:inline">Search</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
