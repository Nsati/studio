'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { getHotels, getCities } from '@/lib/data';
import type { Hotel } from '@/lib/types';
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

function SearchResults() {
  const searchParams = useSearchParams();
  const city = searchParams.get('city');
  const hotels: Hotel[] = getHotels(city || undefined);

  return (
    <div className="flex-1">
      <div className="mb-6">
        <h2 className="font-headline text-3xl font-bold">
          {city ? `Stays in ${city}` : 'All Our Stays'}
        </h2>
        <p className="text-muted-foreground">{hotels.length} properties found.</p>
      </div>
      {hotels.length > 0 ? (
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
          <Button variant="outline" className="mt-4">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const cities = getCities();

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full lg:w-1/4 lg:pr-8">
          <Card>
            <CardContent className="p-4">
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-lg font-semibold">
                    Location
                  </Label>
                  <Select>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
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
                  <Input id="checkin" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout" className="text-lg font-semibold">
                    Check-out
                  </Label>
                  <Input id="checkout" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guests" className="text-lg font-semibold">
                    Guests
                  </Label>
                  <Input id="guests" type="number" min="1" placeholder="2" />
                </div>
                <Button type="submit" className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Update Search
                </Button>
              </form>
            </CardContent>
          </Card>
        </aside>
        <Suspense fallback={<div>Loading...</div>}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
