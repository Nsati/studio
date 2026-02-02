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
import { MapPin, Calendar as CalendarIcon, Users } from 'lucide-react';
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
        <form onSubmit={handleFormSubmit} className="flex flex-col lg:flex-row items-stretch gap-1 bg-[#febb02] p-1 rounded-sm booking-shadow">
            {/* Location */}
            <div className="flex-1 flex items-center gap-3 bg-white px-4 py-3 rounded-sm border-2 border-transparent focus-within:border-accent">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                    <Select value={city} onValueChange={setCity}>
                        <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus:ring-0 shadow-none font-bold text-sm">
                            <SelectValue placeholder="Where are you going?" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Uttarakhand</SelectItem>
                            {cities?.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Dates */}
            <div className="flex-1 flex items-center gap-3 bg-white px-4 py-3 rounded-sm border-2 border-transparent focus-within:border-accent">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <Popover>
                    <PopoverTrigger asChild>
                        <button type="button" className="text-sm font-bold truncate">
                            {dates?.from ? (
                                dates.to ? `${format(dates.from, 'EEE, MMM dd')} — ${format(dates.to, 'EEE, MMM dd')}` : format(dates.from, 'EEE, MMM dd')
                            ) : "Check-in — Check-out"}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                        <CalendarComponent
                            mode="range"
                            selected={dates}
                            onSelect={setDates}
                            disabled={{ before: new Date() }}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Guests */}
            <div className="flex-[0.7] flex items-center gap-3 bg-white px-4 py-3 rounded-sm border-2 border-transparent focus-within:border-accent">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div className="flex items-center gap-2">
                    <Input 
                        type="number" 
                        min="1"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 shadow-none font-bold w-12 text-sm"
                    />
                    <span className="text-sm font-bold text-muted-foreground">guests</span>
                </div>
            </div>
            
            {/* Search Button */}
            <Button type="submit" size="lg" className="bg-[#006ce4] hover:bg-[#005bb8] text-white text-xl font-bold py-6 px-10 rounded-none h-auto">
                Search
            </Button>
        </form>
    );
}