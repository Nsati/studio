'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ShieldCheck, ChevronRight, Users, Info } from 'lucide-react';
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
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

/**
 * @fileOverview Standardized, high-conversion Availability Selection Form.
 * Styled to match the professional design language with fixed calendar centering and balance.
 */

export function RoomBookingCard({ hotel, rooms, isLoadingRooms }: { hotel: WithId<Hotel>, rooms: WithId<Room>[], isLoadingRooms: boolean }) {
  const [dates, setDates] = useState<DateRange | undefined>();
  const [selectedRoom, setSelectedRoom] = useState<WithId<Room> | null>(null);
  const [guests, setGuests] = useState('1');
  const router = useRouter();
  const { toast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
    <Card className="sticky top-24 rounded-sm border-border bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-primary p-6 text-white space-y-1">
        <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Prices from</span>
            <CardTitle className="text-2xl font-black">
                {hotel.minPrice?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
            </CardTitle>
        </div>
        <CardDescription className="text-white/70 flex items-center gap-1.5 font-medium text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Verified Northern Harrier Protocol
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 space-y-6">
        {/* Date & Guest Selectors */}
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Stay Window</label>
            <Popover>
                <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-12 rounded-none justify-start font-bold border-input hover:bg-muted/50 transition-colors text-sm">
                    <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
                    {dates?.from ? (
                    dates.to ? `${format(dates.from, 'MMM dd')} - ${format(dates.to, 'MMM dd')}` : format(dates.from, 'MMM dd')
                    ) : "Select Travel Dates"}
                </Button>
                </PopoverTrigger>
                <PopoverContent 
                    className="w-[340px] p-0 rounded-none border-0 shadow-2xl bg-white overflow-hidden" 
                    align="center"
                    sideOffset={8}
                >
                    <div className="flex items-center justify-center w-full">
                        <Calendar 
                            mode="range" 
                            selected={dates} 
                            onSelect={setDates} 
                            disabled={{ before: new Date() }}
                            numberOfMonths={1}
                        />
                    </div>
                </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Travelers</label>
            <div className="flex items-center gap-2 h-12 w-full rounded-none border border-input px-4 bg-background">
                <Users className="h-4 w-4 text-primary" />
                <input 
                    type="number" 
                    min="1" 
                    value={guests} 
                    onChange={e => setGuests(e.target.value)}
                    className="flex-1 bg-transparent font-black text-sm focus:outline-none"
                />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">PAX</span>
            </div>
          </div>
        </div>

        <Separator className="opacity-10" />

        {/* Room Selection Area */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Room Inventory</h4>
          {isLoadingRooms ? (
            <div className="space-y-2">
                <Skeleton className="h-14 w-full rounded-none" />
                <Skeleton className="h-14 w-full rounded-none" />
            </div>
          ) : rooms.length === 0 ? (
            <Alert className="rounded-none bg-amber-50 border-amber-100 p-3"><AlertDescription className="text-xs font-bold text-amber-800 uppercase">No active inventory found.</AlertDescription></Alert>
          ) : !isDateRangeValid ? (
            <div className="p-8 bg-muted/20 border-2 border-dashed border-border/10 text-center">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-relaxed">Define dates above <br/> to sync pricing</p>
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
                            'p-4 border-2 transition-all cursor-pointer flex items-center justify-between group rounded-sm',
                            isSelected ? 'border-primary bg-primary/5' : 'border-border/10 hover:border-primary/30 bg-white',
                            isSoldOut && 'opacity-40 grayscale cursor-not-allowed'
                        )}
                    >
                        <div className="space-y-1">
                            <p className="font-black text-xs text-primary uppercase tracking-tight">{room.type}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Sleeps {room.capacity} Pax</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-primary text-sm">₹{price.toLocaleString()}</p>
                            {isSelected && <Badge className="text-[7px] h-4 rounded-full mt-1 bg-primary text-white font-black tracking-widest px-2">SELECTED</Badge>}
                        </div>
                    </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Final Action */}
        {selectedRoom && isDateRangeValid && (
          <div className='pt-2 space-y-3 animate-in fade-in slide-in-from-top-2'>
            <Button
              onClick={handleBookNow}
              size="lg"
              className="w-full h-14 rounded-none text-xs font-black uppercase tracking-[0.2em] bg-accent text-accent-foreground hover:bg-accent/90 shadow-xl transition-all active:scale-95 saffron-glow"
            >
              Secure Reservation <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-[8px] font-black text-green-700 uppercase tracking-[0.2em]">
                <Info className="h-3 w-3" /> Satellite Sync Confirmed
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
