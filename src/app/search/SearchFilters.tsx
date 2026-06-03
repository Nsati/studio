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
 * @fileOverview Studio Elite Search Filters.
 * High-visibility inputs with glassmorphism and bold gold accents.
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
        <div className="space-y-8">
            {/* Main Search Pill */}
            <form onSubmit={handleFormSubmit} className="flex flex-col lg:flex-row items-stretch gap-3 bg-white/5 backdrop-blur-3xl p-3 rounded-[3rem] border border-white/10 shadow-2xl luxury-shadow">
                
                {/* Location Node */}
                <div className="flex-[1.2] flex items-center gap-6 bg-slate-950/60 hover:bg-slate-900/80 px-8 py-5 rounded-[2.5rem] border border-white/5 focus-within:border-primary/40 transition-all cursor-pointer group">
                    <MapPin className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-500" />
                    <div className="flex flex-col items-start flex-1 text-left">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 mb-1">Destination Node</span>
                        <Select value={city} onValueChange={setCity}>
                            <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus:ring-0 shadow-none font-black text-white text-lg w-full tracking-tight">
                                <SelectValue placeholder="Target Hub" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-white/10 text-white rounded-2xl shadow-3xl">
                                <SelectItem value="All" className="focus:bg-primary/20 focus:text-white font-bold py-3">All Uttarakhand</SelectItem>
                                {cities?.map((c) => (
                                    <SelectItem key={c} value={c} className="focus:bg-primary/20 focus:text-white font-bold py-3">{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Temporal Window (Dates) */}
                <div className="flex-1 flex items-center gap-6 bg-slate-950/60 hover:bg-slate-900/80 px-8 py-5 rounded-[2.5rem] border border-white/5 focus-within:border-primary/40 transition-all cursor-pointer group">
                    <CalendarIcon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-500" />
                    <div className="flex flex-col items-start flex-1 text-left">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 mb-1">Travel Window</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button type="button" className="text-lg font-black text-white truncate hover:text-primary transition-colors text-left w-full tracking-tight">
                                    {dates?.from ? (
                                        dates.to ? `${format(dates.from, 'MMM dd')} — ${format(dates.to, 'MMM dd')}` : format(dates.from, 'MMM dd')
                                    ) : "Initialize Dates"}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-white/10 bg-slate-950 rounded-3xl overflow-hidden shadow-3xl" align="center">
                                <CalendarComponent
                                    mode="range"
                                    selected={dates}
                                    onSelect={setDates}
                                    disabled={{ before: new Date() }}
                                    numberOfMonths={2}
                                    className="bg-slate-950 text-white p-6"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Explorer Capacity (Guests) */}
                <div className="flex-[0.8] flex items-center gap-6 bg-slate-950/60 hover:bg-slate-900/80 px-8 py-5 rounded-[2.5rem] border border-white/5 focus-within:border-primary/40 transition-all group">
                    <Users className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-500" />
                    <div className="flex flex-col items-start flex-1 text-left">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 mb-1">Explorer Count</span>
                        <div className="flex items-center gap-3">
                            <Input 
                                type="number" 
                                min="1"
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                                className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 shadow-none font-black w-10 text-xl text-white tracking-tighter"
                            />
                            <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">PAX</span>
                        </div>
                    </div>
                </div>
                
                {/* Execute Button */}
                <Button type="submit" size="lg" className="h-auto bg-primary hover:bg-white text-background rounded-[2.2rem] px-12 text-xl font-black shadow-2xl transition-all active:scale-95 py-8 lg:py-0 group">
                    EXECUTE <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                </Button>
            </form>

            {/* Protocol Selectors */}
            <div className="flex flex-wrap gap-4 justify-center">
                {[
                    { id: 'standard', label: 'Standard Protocol', icon: Compass },
                    { id: 'chardham', label: 'Char Dham Node', icon: Star },
                    { id: 'trek', label: 'Trek Protocol', icon: Tent }
                ].map((p) => (
                    <Button 
                        key={p.id}
                        variant="ghost" 
                        onClick={() => setMode(p.id as any)}
                        className={cn(
                            "h-12 rounded-full text-[11px] font-black uppercase tracking-[0.4em] px-10 border transition-all duration-500 flex items-center gap-3",
                            mode === p.id 
                                ? "bg-primary text-background border-primary shadow-[0_10px_30px_rgba(254,187,2,0.2)]" 
                                : "text-white/40 border-white/10 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <p.icon className="h-4 w-4" /> {p.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
