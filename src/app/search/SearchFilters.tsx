'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { Hotel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Calendar as CalendarIcon, Users } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function SearchFilters() {
    const firestore = useFirestore();

    const hotelsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'hotels');
    }, [firestore]);

    const { data: allHotels, isLoading: isLoadingHotels } = useCollection<Hotel>(hotelsQuery);

    const cities = useMemoFirebase(() => {
        if (!allHotels) return [];
        const cityNames = allHotels.map(hotel => hotel.city);
        const uniqueCities = [...new Set(cityNames)];
        return uniqueCities.sort((a, b) => a.localeCompare(b));
    }, [allHotels]);


    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [city, setCity] = useState(searchParams.get('city') || 'All');
    const [dates, setDates] = useState<DateRange | undefined>();
    const [guests, setGuests] = useState(searchParams.get('guests') || '2');
    
    useEffect(() => {
        setCity(searchParams.get('city') || 'All');
        setGuests(searchParams.get('guests') || '2');
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');
        if (checkIn && checkOut) {
            try {
                setDates({
                    from: new Date(checkIn),
                    to: new Date(checkOut)
                });
            } catch (e) {
                console.error("Invalid date format in URL params");
                setDates(undefined);
            }
        } else {
            setDates(undefined);
        }
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
        // Reset page number on new search
        newSearchParams.delete('page');
        return newSearchParams.toString();
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const path = pathname === '/search' ? pathname : '/search';
        router.push(`${path}?${createQueryString({
            city: city === 'All' ? null : city,
            guests,
            checkIn: dates?.from ? format(dates.from, 'yyyy-MM-dd') : null,
            checkOut: dates?.to ? format(dates.to, 'yyyy-MM-dd') : null,
        })}`);
    }

    return (
        <Card className="w-full shadow-lg bg-background/80 backdrop-blur-sm border-white/20">
            <CardContent className="p-2">
                <form onSubmit={handleFormSubmit} className="flex flex-col md:flex-row items-center gap-2">
                    {/* Location */}
                    <div className="flex items-center gap-2 px-3 py-2 w-full flex-1 bg-background rounded-md border">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <Select value={city} onValueChange={setCity} disabled={isLoadingHotels}>
                            <SelectTrigger className="w-full font-medium text-base border-0 bg-transparent focus:ring-0 shadow-none p-0 h-auto focus:ring-offset-0">
                                <SelectValue placeholder={isLoadingHotels ? "Loading..." : "Select Location"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Locations</SelectItem>
                                {cities?.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2 px-3 py-2 w-full flex-1 bg-background rounded-md border">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className={cn("w-full justify-start text-left font-medium hover:bg-transparent p-0 h-auto text-base focus-visible:ring-0 focus-visible:ring-offset-0", !dates && "text-muted-foreground")}
                                >
                                    {dates?.from ? (
                                        dates.to ? (
                                            <>
                                                {format(dates.from, 'LLL dd, y')} - {format(dates.to, 'LLL dd, y')}
                                            </>
                                        ) : format(dates.from, 'LLL dd, y')
                                    ) : (
                                        <span>Pick dates</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dates?.from}
                                    selected={dates}
                                    onSelect={setDates}
                                    numberOfMonths={2}
                                    disabled={{ before: new Date() }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Guests */}
                    <div className="flex items-center gap-2 px-3 py-2 w-full flex-1 md:flex-none md:w-32 bg-background rounded-md border">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <Input 
                            type="number" 
                            placeholder="Guests" 
                            min="1"
                            value={guests}
                            onChange={(e) => setGuests(e.target.value)}
                            className="font-medium text-base border-0 bg-transparent focus-visible:ring-0 p-0 h-auto shadow-none focus-visible:ring-offset-0"
                        />
                    </div>
                    
                    <Button type="submit" size="lg" className="h-full w-full md:w-auto px-6 text-base">
                        <Search className="mr-2 h-4 w-4" />
                        Search
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
