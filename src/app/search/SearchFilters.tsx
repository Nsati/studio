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
import { Search, MapPin, Calendar as CalendarIcon, Users, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function SearchFilters() {
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const hotelsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'hotels');
    }, [firestore]);

    const { data: allHotels, isLoading: isLoadingHotels } = useCollection<Hotel>(hotelsQuery);

    const cities = useMemoFirebase(() => {
        if (!allHotels) return [];
        const uniqueCities = [...new Set(allHotels.map(h => h.city))];
        return uniqueCities.sort((a, b) => a.localeCompare(b));
    }, [allHotels]);

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
                setDates({ from: new Date(checkIn), to: new Date(checkOut) });
            } catch (e) { setDates(undefined); }
        }
    }, [searchParams]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (city && city !== 'All') params.set('city', city); else params.delete('city');
        params.set('guests', guests);
        if (dates?.from) params.set('checkIn', format(dates.from, 'yyyy-MM-dd'));
        if (dates?.to) params.set('checkOut', format(dates.to, 'yyyy-MM-dd'));
        router.push(`/search?${params.toString()}`);
    }

    return (
        <form onSubmit={handleFormSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-1 bg-white p-2 rounded-[2rem] lg:rounded-full shadow-2xl ring-1 ring-black/5">
            {/* Location Pill */}
            <div className="flex-1 flex items-center gap-3 px-6 py-3 hover:bg-muted/50 rounded-full transition-colors group cursor-pointer border-b lg:border-b-0 lg:border-r border-black/5">
                <div className="p-2 bg-primary/5 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <MapPin className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start flex-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Where to?</span>
                    <Select value={city} onValueChange={setCity}>
                        <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus:ring-0 shadow-none font-bold text-sm">
                            <SelectValue placeholder="Select Destination" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-black/5 shadow-xl">
                            <SelectItem value="All">All Locations</SelectItem>
                            {cities?.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Dates Pill */}
            <div className="flex-1 flex items-center gap-3 px-6 py-3 hover:bg-muted/50 rounded-full transition-colors group cursor-pointer border-b lg:border-b-0 lg:border-r border-black/5">
                <div className="p-2 bg-primary/5 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <CalendarIcon className="h-4 w-4" />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <button type="button" className="flex flex-col items-start flex-1 text-left">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">When?</span>
                            <span className="text-sm font-bold truncate">
                                {dates?.from ? (
                                    dates.to ? `${format(dates.from, 'MMM dd')} - ${format(dates.to, 'MMM dd')}` : format(dates.from, 'MMM dd')
                                ) : "Add dates"}
                            </span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 rounded-3xl border-black/5 shadow-2xl" align="center">
                        <CalendarComponent
                            mode="range"
                            selected={dates}
                            onSelect={setDates}
                            disabled={{ before: new Date() }}
                            className="rounded-xl"
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Guests Pill */}
            <div className="flex-[0.6] flex items-center gap-3 px-6 py-3 hover:bg-muted/50 rounded-full transition-colors group cursor-pointer border-b lg:border-b-0 lg:border-r border-black/5">
                <div className="p-2 bg-primary/5 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Users className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start flex-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Who?</span>
                    <Input 
                        type="number" 
                        min="1"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 shadow-none font-bold text-sm"
                    />
                </div>
            </div>
            
            {/* Modern Search Button */}
            <Button type="submit" size="lg" className="lg:w-14 lg:h-14 w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95">
                <Search className="h-5 w-5" />
                <span className="lg:hidden ml-2 font-bold">Search Now</span>
            </Button>
        </form>
    );
}