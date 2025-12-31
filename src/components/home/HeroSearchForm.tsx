'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

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
import { getCities } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

export function HeroSearchForm() {
  const router = useRouter();
  const cities = getCities();

  const [city, setCity] = useState<string>('');
  const [dates, setDates] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState<string>('2');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (dates?.from) params.set('checkin', format(dates.from, 'yyyy-MM-dd'));
    if (dates?.to) params.set('checkout', format(dates.to, 'yyyy-MM-dd'));
    if (guests) params.set('guests', guests);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <Card className="shadow-2xl">
      <CardContent className="p-4">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 items-center gap-4 md:grid-cols-10"
        >
          <div className="md:col-span-3">
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <Select onValueChange={setCity} value={city}>
                <SelectTrigger className="w-full border-0 bg-transparent focus:ring-0">
                  <SelectValue placeholder="Where to?" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="md:col-span-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start text-left font-normal bg-muted/50 p-2 h-auto',
                    !dates && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
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
                    <span>Pick check-in and check-out dates</span>
                  )}
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

          <div className="md:col-span-2">
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Guests"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0"
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 md:col-span-1">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
