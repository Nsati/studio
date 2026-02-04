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

export function RoomBookingCard({ hotel, rooms, isLoadingRooms }: { hotel: WithId<Hotel>, rooms: WithId<Room>[], isLoadingRooms: boolean }) {
  const [dates, setDates] = useState<DateRange | undefined>();
  const [selectedRoom, setSelectedRoom] = useState<WithId<Room> | null>(null);
  const [guests, setGuests] = useState('1');
  const router = useRouter();
  const { toast } = useToast();
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

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

  return (
    <Card className="sticky top-24 rounded-sm border-border bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-[#003580] p-6 text-white space-y-1">
        <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Prices from</span>
            <CardTitle className="text-2xl font-bold">
                {hotel.minPrice?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
            </CardTitle>
        </div>
        <CardDescription className="text-white/70 flex items-center gap-1.5 font-medium text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-green-400" /> Pre-verified best mountain rates
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 space-y-6">
        {/* Date & Guest Selectors - Compact */}
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Check-in — Check-out</label>
            <Popover>
                <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-10 rounded-none justify-start font-bold border-input hover:bg-muted/50 transition-colors text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#003580]" />
                    {dates?.from ? (
                    dates.to ? `${format(dates.from, 'MMM dd')} - ${format(dates.to, 'MMM dd')}` : format(dates.from, 'MMM dd')
                    ) : "Select dates"}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-sm border-border" align="end">
                    <Calendar mode="range" selected={dates} onSelect={setDates} disabled={{ before: new Date() }} />
                </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Guests</label>
            <div className="flex items-center gap-2 h-10 w-full rounded-none border border-input px-3 bg-background">
                <Users className="h-4 w-4 text-[#003580]" />
                <input 
                    type="number" 
                    min="1" 
                    value={guests} 
                    onChange={e => setGuests(e.target.value)}
                    className="flex-1 bg-transparent font-bold text-sm focus:outline-none"
                />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Adults</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Room Selection Area */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-[#1a1a1a] ml-1">Select Room Type</h4>
          {isLoadingRooms ? (
            <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
            </div>
          ) : rooms.length === 0 ? (
            <Alert className="rounded-none bg-amber-50 border-amber-100 p-3"><AlertDescription className="text-xs">No rooms found for this property.</AlertDescription></Alert>
          ) : !isDateRangeValid ? (
            <div className="p-6 bg-muted/20 border border-dashed border-border text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Enter your travel dates <br/> to see dynamic pricing</p>
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
                            'p-3 border transition-all cursor-pointer flex items-center justify-between group rounded-sm',
                            isSelected ? 'border-[#003580] bg-[#ebf3ff]' : 'border-border hover:bg-muted/30 bg-white',
                            isSoldOut && 'opacity-40 grayscale cursor-not-allowed'
                        )}
                    >
                        <div className="space-y-0.5">
                            <p className="font-bold text-sm text-[#1a1a1a]">{room.type}</p>
                            <p className="text-[10px] font-medium text-muted-foreground">Sleeps {room.capacity}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-[#003580] text-base">{price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</p>
                            {isSelected && <Badge className="text-[8px] h-4 rounded-none mt-1 bg-[#003580] text-white font-black tracking-widest px-1">SELECTED</Badge>}
                        </div>
                    </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Final Action - Smaller & Focused */}
        {selectedRoom && isDateRangeValid && (
          <div className='pt-2 space-y-3 animate-in fade-in slide-in-from-top-2'>
            <Button
              onClick={handleBookNow}
              size="lg"
              className="w-full h-12 rounded-none text-base font-bold bg-[#febb02] text-[#003580] hover:bg-[#febb02]/90 shadow-sm transition-all active:scale-95"
            >
              Reserve Room <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-green-700 uppercase tracking-tight">
                <Info className="h-3 w-3" /> Instant Confirmation via SMS
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
