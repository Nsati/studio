'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { Search, MapPin, Calendar as CalendarIcon, Users } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';

export function SearchFilters() {
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const router = useRouter();

    const hotelsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'hotels');
    }, [firestore]);

    const { data: allHotels } = useCollection<Hotel>(hotelsQuery);

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
        <form onSubmit={handleFormSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-1 bg-white p-2 rounded-pill shadow-apple-deep">
            {/* Location Pill */}
            <div className="flex-1 flex items-center gap-4 px-8 py-4 hover:bg-muted/50 rounded-full transition-all duration-300 group cursor-pointer border-b lg:border-b-0 lg:border-r border-black/5">
                <div className="p-2.5 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <MapPin className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start flex-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Where to?</span>
                    <Select value={city} onValueChange={setCity}>
                        <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus:ring-0 shadow-none font-bold text-base tracking-tight">
                            <SelectValue placeholder="Select Destination" />
                        </SelectTrigger>
                        <SelectContent className="rounded-3xl border-black/5 shadow-apple-deep p-2">
                            <SelectItem value="All" className="rounded-xl">All Locations</SelectItem>
                            {cities?.map((c) => (
                                <SelectItem key={c} value={c} className="rounded-xl">{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Dates Pill */}
            <div className="flex-1 flex items-center gap-4 px-8 py-4 hover:bg-muted/50 rounded-full transition-all duration-300 group cursor-pointer border-b lg:border-b-0 lg:border-r border-black/5">
                <div className="p-2.5 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <CalendarIcon className="h-5 w-5" />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <button type="button" className="flex flex-col items-start flex-1 text-left">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">When?</span>
                            <span className="text-base font-bold truncate tracking-tight">
                                {dates?.from ? (
                                    dates.to ? `${format(dates.from, 'MMM dd')} - ${format(dates.to, 'MMM dd')}` : format(dates.from, 'MMM dd')
                                ) : "Add Stay dates"}
                            </span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-6 rounded-[2.5rem] border-black/5 shadow-apple-deep" align="center">
                        <CalendarComponent
                            mode="range"
                            selected={dates}
                            onSelect={setDates}
                            disabled={{ before: new Date() }}
                            className="rounded-2xl"
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Guests Pill */}
            <div className="flex-[0.7] flex items-center gap-4 px-8 py-4 hover:bg-muted/50 rounded-full transition-all duration-300 group cursor-pointer border-b lg:border-b-0 lg:border-r border-black/5">
                <div className="p-2.5 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <Users className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start flex-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Who?</span>
                    <Input 
                        type="number" 
                        min="1"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 shadow-none font-bold text-base tracking-tight"
                    />
                </div>
            </div>
            
            {/* Modern Action Button */}
            <Button type="submit" size="lg" className="lg:w-16 lg:h-16 w-full h-16 rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all duration-500 active:scale-95 mx-2">
                <Search className="h-6 w-6" />
                <span className="lg:hidden ml-3 font-black tracking-tight text-lg">Search Now</span>
            </Button>
        </form>
    );
}
