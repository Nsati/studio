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
            <form onSubmit={handleFormSubmit} className="flex flex-col lg:flex-row items-stretch gap-3 bg-white p-3 rounded-[3rem] border border-black/5 shadow-luxury saffron-glow relative z-20">
                
                {/* Location Node */}
                <div className="flex-[1.2] flex items-center gap-5 bg-muted/40 hover:bg-muted/60 px-8 py-5 rounded-[2.5rem] transition-all cursor-pointer group">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-start flex-1 text-left">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-1">Target Node</span>
                        <Select value={city} onValueChange={setCity}>
                            <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus:ring-0 shadow-none font-black text-primary text-lg w-full tracking-tighter">
                                <SelectValue placeholder="All Devbhoomi" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-black/5 rounded-3xl shadow-3xl">
                                <SelectItem value="All" className="focus:bg-primary/5 font-bold py-4 text-primary text-sm uppercase">All Uttarakhand</SelectItem>
                                {cities?.map((c) => (
                                    <SelectItem key={c} value={c} className="focus:bg-primary/5 font-bold py-4 text-primary text-sm uppercase">{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Date Window */}
                <div className="flex-1 flex items-center gap-5 bg-muted/40 hover:bg-muted/60 px-8 py-5 rounded-[2.5rem] transition-all cursor-pointer group">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-start flex-1 text-left">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-1">Stay Window</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button type="button" className="text-lg font-black text-primary truncate hover:text-accent transition-colors text-left w-full tracking-tighter uppercase">
                                    {dates?.from ? (
                                        dates.to ? `${format(dates.from, 'MMM dd')} - ${format(dates.to, 'MMM dd')}` : format(dates.from, 'MMM dd')
                                    ) : "Select Dates"}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-black/5 bg-white rounded-[2rem] overflow-hidden shadow-luxury" align="center">
                                <CalendarComponent
                                    mode="range"
                                    selected={dates}
                                    onSelect={setDates}
                                    disabled={{ before: new Date() }}
                                    numberOfMonths={2}
                                    className="bg-white text-primary p-6"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Guests */}
                <div className="flex-[0.8] flex items-center gap-5 bg-muted/40 hover:bg-muted/60 px-8 py-5 rounded-[2.5rem] transition-all group">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-start flex-1 text-left">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-1">Travelers</span>
                        <div className="flex items-center gap-3">
                            <Input 
                                type="number" 
                                min="1"
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                                className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 shadow-none font-black w-10 text-xl text-primary tracking-tighter"
                            />
                            <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">PAX</span>
                        </div>
                    </div>
                </div>
                
                {/* Execute Button */}
                <Button type="submit" size="lg" className="h-auto bg-accent hover:bg-primary text-accent-foreground hover:text-white rounded-[2.5rem] px-12 text-lg font-black shadow-2xl transition-all active:scale-95 py-6 lg:py-0 group saffron-glow uppercase tracking-widest">
                    EXPLORE <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                </Button>
            </form>

            {/* Protocol Selectors */}
            <div className="flex flex-wrap gap-4 justify-center">
                {[
                    { id: 'standard', label: 'Traditional Trail', icon: Compass },
                    { id: 'chardham', label: 'Sacred Char Dham', icon: Star },
                    { id: 'trek', label: 'Mountain Trek', icon: Tent }
                ].map((p) => (
                    <Button 
                        key={p.id}
                        variant="ghost" 
                        onClick={() => setMode(p.id as any)}
                        className={cn(
                            "h-12 rounded-full text-[10px] font-black uppercase tracking-[0.3em] px-10 border transition-all duration-500 flex items-center gap-3",
                            mode === p.id 
                                ? "bg-primary text-white border-primary shadow-xl scale-105" 
                                : "text-primary/40 border-black/5 hover:bg-primary/5 bg-white/50"
                        )}
                    >
                        <p.icon className="h-4 w-4" /> {p.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
