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
import { MapPin, Calendar as CalendarIcon, Users, Compass, Tent, Search, ArrowRight, Star } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Production Search Filter Engine.
 * Features ultra-aligned Airbnb-style calendar integration for all devices.
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
        <div className="space-y-6 max-w-[1200px] mx-auto w-full px-4 md:px-0">
            <form onSubmit={handleFormSubmit} className="flex flex-col lg:flex-row items-stretch gap-2 bg-white p-2 rounded-[2.5rem] border border-black/5 shadow-luxury relative z-20 transition-all">
                
                {/* Location Node */}
                <div className="flex-[1.2] flex items-center gap-4 bg-muted/40 hover:bg-muted/60 px-6 py-3 rounded-[2rem] transition-all cursor-pointer group">
                    <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ring-1 ring-black/5">
                        <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col items-start flex-1 text-left">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 mb-0.5">Target Destination</span>
                        <Select value={city} onValueChange={setCity}>
                            <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus:ring-0 shadow-none font-black text-primary text-sm w-full tracking-tight">
                                <SelectValue placeholder="All Devbhoomi" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-black/5 rounded-[2rem] shadow-3xl overflow-hidden p-2">
                                <SelectItem value="All" className="rounded-xl font-bold py-3 text-primary text-xs uppercase focus:bg-primary/5">All Uttarakhand</SelectItem>
                                {cities?.map((c) => (
                                    <SelectItem key={c} value={c} className="rounded-xl font-bold py-3 text-primary text-xs uppercase focus:bg-primary/5">{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Date Window - Airbnb Style */}
                <div className="flex-1 flex items-center gap-4 bg-muted/40 hover:bg-muted/60 px-6 py-3 rounded-[2rem] transition-all cursor-pointer group">
                    <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ring-1 ring-black/5">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col items-start flex-1 text-left overflow-hidden">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 mb-0.5">Stay Period</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button type="button" className="text-sm font-black text-primary truncate hover:text-accent transition-colors text-left w-full tracking-tight uppercase">
                                    {dates?.from ? (
                                        dates.to ? `${format(dates.from, 'MMM dd')} — ${format(dates.to, 'MMM dd')}` : format(dates.from, 'MMM dd')
                                    ) : "Add Dates"}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent 
                                className="w-auto p-0 border-0 bg-white rounded-[2.5rem] overflow-hidden shadow-luxury mt-4" 
                                align="center"
                                sideOffset={8}
                            >
                                <CalendarComponent
                                    mode="range"
                                    selected={dates}
                                    onSelect={setDates}
                                    disabled={{ before: new Date() }}
                                    numberOfMonths={1}
                                    className="mx-auto"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Guests */}
                <div className="flex-[0.8] flex items-center gap-4 bg-muted/40 hover:bg-muted/60 px-6 py-3 rounded-[2rem] transition-all group">
                    <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ring-1 ring-black/5">
                        <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col items-start flex-1 text-left">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 mb-0.5">Capacity</span>
                        <div className="flex items-center gap-2">
                            <Input 
                                type="number" 
                                min="1"
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                                className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 shadow-none font-black w-8 text-base text-primary tracking-tight"
                            />
                            <span className="text-[8px] font-black text-primary/30 uppercase tracking-[0.2em]">PAX</span>
                        </div>
                    </div>
                </div>
                
                {/* Execute Button */}
                <Button type="submit" size="lg" className="h-auto bg-accent hover:bg-primary text-accent-foreground hover:text-white rounded-[2rem] px-10 text-xs font-black shadow-xl transition-all active:scale-95 py-5 lg:py-0 group uppercase tracking-[0.2em] saffron-glow">
                    SYNC RESULTS <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </form>

            {/* Mode Protocol Selectors */}
            <div className="flex flex-wrap gap-3 justify-center">
                {[
                    { id: 'standard', label: 'Classic Trail', icon: Compass },
                    { id: 'chardham', label: 'Sacred Access', icon: Star },
                    { id: 'trek', label: 'High Altitude', icon: Tent }
                ].map((p) => (
                    <Button 
                        key={p.id}
                        variant="ghost" 
                        onClick={() => setMode(p.id as any)}
                        className={cn(
                            "h-11 rounded-full text-[10px] font-black uppercase tracking-[0.2em] px-8 border transition-all duration-500 flex items-center gap-3",
                            mode === p.id 
                                ? "bg-primary text-white border-primary shadow-lg scale-105" 
                                : "text-primary/40 border-black/5 hover:bg-primary/5 bg-white/50"
                        )}
                    >
                        <p.icon className="h-3.5 w-3.5" /> {p.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
