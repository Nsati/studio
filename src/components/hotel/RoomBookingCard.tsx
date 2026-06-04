'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ShieldCheck, ChevronRight, Users } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';

import type { Hotel, Room } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import type { WithId } from '@/firebase';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/**
 * @fileOverview Hardened Room Booking Card.
 * Fixed production import paths and stabilized alignment.
 */

export function RoomBookingCard({ hotel, rooms, isLoadingRooms }: { hotel: WithId<Hotel>, rooms: WithId<Room>[], isLoadingRooms: boolean }) {
  const [dates, setDates] = useState<DateRange | undefined>();
  const [selectedRoom, setSelectedRoom] = useState<WithId<Room> | null>(null);
  const [guests, setGuests] = useState('1');
  const router = useRouter();
  const { toast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const nights = dates?.from && dates?.to ? differenceInDays(dates.to, dates.from) : 0;
  const isDateRangeValid = nights > 0;

  const handleBookNow = () => {
    if (!selectedRoom || !isDateRangeValid || !dates?.from || !dates.to) {
        toast({ variant: 'destructive', title: 'Selection Missing', description: 'Please select dates and a room type to continue.' });
        return;
    }
    const params = new URLSearchParams({
        hotelId: hotel.id,
        roomId: selectedRoom.id,
        checkIn: format(dates.from, 'yyyy-MM-dd'),
        checkOut: format(dates.to, 'yyyy-MM-dd'),
        guests
    });
    router.push(`/booking?${params.toString()}`);
  }

  if (!mounted) return <Skeleton className="h-[400px] w-full rounded-sm" />;

  return (
    <Card className="sticky top-24 rounded-2xl border-border/10 bg-white shadow-apple-deep overflow-hidden">
      <CardHeader className="bg-primary p-6 text-white space-y-1">
        <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-bold opacity-80 uppercase tracking-[0.2em]">Live Price Sync</span>
            <CardTitle className="text-3xl font-black">
                {hotel.minPrice?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
            </CardTitle>
        </div>
        <CardDescription className="text-white/70 flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Verified Northern Harrier Protocol
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-primary/40 ml-1 tracking-widest">Stay Window</label>
            <Popover>
                <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-12 rounded-xl justify-start font-bold border-border/10 hover:border-primary/30 hover:bg-primary/5 transition-all text-sm group">
                    <CalendarIcon className="mr-3 h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                    <span className="truncate">
                        {dates?.from ? (
                        dates.to ? `${format(dates.from, 'MMM dd')} — ${format(dates.to, 'MMM dd')}` : format(dates.from, 'MMM dd')
                        ) : "SELECT TRAVEL DATES"}
                    </span>
                </Button>
                </PopoverTrigger>
                <PopoverContent 
                    className="w-auto p-0 rounded-3xl border-0 shadow-luxury bg-white overflow-hidden" 
                    align="end"
                >
                    <Calendar 
                        mode="range" 
                        selected={dates} 
                        onSelect={setDates} 
                        disabled={{ before: new Date() }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-primary/40 ml-1 tracking-widest">Guest Count</label>
            <div className="flex items-center gap-3 h-12 w-full rounded-xl border border-border/10 px-4 bg-background group focus-within:border-primary/30 transition-all">
                <Users className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <input 
                    type="number" 
                    min="1" 
                    value={guests} 
                    onChange={e => setGuests(e.target.value)}
                    className="flex-1 bg-transparent font-bold text-sm focus:outline-none"
                />
                <span className="text-[9px] font-black text-primary/30 uppercase tracking-widest">PAX</span>
            </div>
          </div>
        </div>

        <Separator className="opacity-10" />

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Live Inventory</h4>
          {isLoadingRooms ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : rooms.length === 0 ? (
            <Alert className="rounded-xl bg-amber-50 border-amber-100 p-4"><AlertDescription className="text-xs font-bold text-amber-800 uppercase tracking-widest text-center">No active inventory found</AlertDescription></Alert>
          ) : !isDateRangeValid ? (
            <div className="py-8 px-6 bg-muted/20 border-2 border-dashed border-border/10 rounded-2xl text-center">
                <p className="text-[10px] font-black text-primary/30 uppercase tracking-[0.3em] leading-relaxed">Define stay dates <br/> to unlock pricing</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const isSoldOut = room.availableRooms !== undefined && room.availableRooms <= 0;
                const price = hotel.discount ? room.price * (1 - hotel.discount / 100) : room.price;

                return (
                    <div
                        key={room.id}
                        onClick={() => !isSoldOut && setSelectedRoom(room)}
                        className={cn(
                            'p-4 border-2 transition-all cursor-pointer flex items-center justify-between group rounded-2xl',
                            isSelected ? 'border-primary bg-primary/5 shadow-inner' : 'border-border/5 hover:border-primary/20 bg-white',
                            isSoldOut && 'opacity-40 grayscale cursor-not-allowed'
                        )}
                    >
                        <div className="space-y-1">
                            <p className="font-bold text-xs text-primary uppercase tracking-tight">{room.type}</p>
                            <p className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">Sleeps {room.capacity} Pax</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-primary text-base">₹{price.toLocaleString()}</p>
                            {isSelected && <Badge className="text-[7px] h-4 rounded-full mt-1 bg-primary text-white font-black tracking-widest px-2 shadow-sm">SELECTED</Badge>}
                        </div>
                    </div>
                )
              })}
            </div>
          )}
        </div>

        {selectedRoom && isDateRangeValid && (
          <div className='pt-2 space-y-4'>
            <Button
              onClick={handleBookNow}
              size="lg"
              className="w-full h-14 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transition-all active:scale-95"
            >
              Secure Stay Protocol <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center gap-2 text-[8px] font-black text-green-700 uppercase tracking-[0.3em]">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full" /> Cloud Gateway Verified
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
