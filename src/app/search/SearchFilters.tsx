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
import { MapPin, Calendar as CalendarIcon, Users, Compass, Tent, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Elite Search Filters for Northern Harrier.
 * Hardened visibility for Dark Luxury theme.
 */

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
    const [mode, setMode] = useState<'standard' | 'chardham' | 'trek'>(
        (searchParams.get('mode') as any) || 'standard'
    );
    
    useEffect(() => {
        setCity(searchParams.get('city') || 'All');
        setGuests(searchParams.get('guests') || '2');
        setMode((searchParams.get('mode') as any) || 'standard');
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
        params.set('mode', mode);
        if (dates?.from) params.set('checkIn', format(dates.from, 'yyyy-MM-dd'));
        if (dates?.to) params.set('checkOut', format(dates.to, 'yyyy-MM-dd'));
        router.push(`/search?${params.toString()}`);
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleFormSubmit} className="flex flex-col lg:flex-row items-stretch gap-2 bg-white/5 backdrop-blur-2xl p-2 rounded-[2.5rem] border border-white/10 shadow-2xl">
                {/* Location */}
                <div className="flex-1 flex items-center gap-4 bg-slate-900/50 hover:bg-slate-900/80 px-6 py-4 rounded-2xl border border-transparent focus-within:border-primary/50 transition-all cursor-pointer group">
                    <MapPin className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col items-start flex-1 text-left">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">Destination</span>
                        <Select value={city} onValueChange={setCity}>
                            <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus:ring-0 shadow-none font-bold text-white text-sm w-full">
                                <SelectValue placeholder="Where to?" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                                <SelectItem value="All" className="focus:bg-primary/20 focus:text-white">All Uttarakhand</SelectItem>
                                {cities?.map((c) => (
                                    <SelectItem key={c} value={c} className="focus:bg-primary/20 focus:text-white">{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Dates */}
                <div className="flex-1 flex items-center gap-4 bg-slate-900/50 hover:bg-slate-900/80 px-6 py-4 rounded-2xl border border-transparent focus-within:border-primary/50 transition-all cursor-pointer group">
                    <CalendarIcon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col items-start flex-1 text-left">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">Travel Window</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button type="button" className="text-sm font-bold text-white truncate hover:text-primary transition-colors text-left w-full">
                                    {dates?.from ? (
                                        dates.to ? `${format(dates.from, 'MMM dd')} — ${format(dates.to, 'MMM dd')}` : format(dates.from, 'MMM dd')
                                    ) : "Select dates"}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-white/10 bg-slate-900" align="center">
                                <CalendarComponent
                                    mode="range"
                                    selected={dates}
                                    onSelect={setDates}
                                    disabled={{ before: new Date() }}
                                    numberOfMonths={2}
                                    className="bg-slate-900 text-white"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Guests */}
                <div className="flex-[0.7] flex items-center gap-4 bg-slate-900/50 hover:bg-slate-900/80 px-6 py-4 rounded-2xl border border-transparent focus-within:border-primary/50 transition-all group">
                    <Users className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col items-start flex-1 text-left">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">Travelers</span>
                        <div className="flex items-center gap-2">
                            <Input 
                                type="number" 
                                min="1"
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                                className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 shadow-none font-bold w-8 text-sm text-white"
                            />
                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Guests</span>
                        </div>
                    </div>
                </div>
                
                {/* Search Button */}
                <Button type="submit" size="lg" className="h-auto bg-primary hover:bg-primary/90 text-background rounded-2xl px-12 text-lg font-black shadow-lg transition-all active:scale-95 py-6 lg:py-0">
                    Execute Search
                </Button>
            </form>

            {/* Mode Selectors */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Button 
                    variant="ghost" 
                    onClick={() => setMode('standard')}
                    className={cn(
                        "h-10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] px-6 border transition-all",
                        mode === 'standard' ? "bg-primary text-background border-primary shadow-lg" : "text-white/60 border-white/10 hover:bg-white/5 hover:text-white"
                    )}
                >
                    Standard Stay
                </Button>
                <Button 
                    variant="ghost" 
                    onClick={() => setMode('chardham')}
                    className={cn(
                        "h-10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] px-6 border transition-all flex items-center gap-2",
                        mode === 'chardham' ? "bg-primary text-background border-primary shadow-lg" : "text-white/60 border-white/10 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <Compass className="h-3 w-3" /> Char Dham Mode
                </Button>
                <Button 
                    variant="ghost" 
                    onClick={() => setMode('trek')}
                    className={cn(
                        "h-10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] px-6 border transition-all flex items-center gap-2",
                        mode === 'trek' ? "bg-primary text-background border-primary shadow-lg" : "text-white/60 border-white/10 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <Tent className="h-3 w-3" /> Trek Mode
                </Button>
            </div>
        </div>
    );
}
