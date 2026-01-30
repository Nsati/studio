'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ShieldCheck, ChevronRight } from 'lucide-react';
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
        toast({ variant: 'destructive', title: 'Action Required', description: 'Please select your dates and preferred room type.' });
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
    <Card className="sticky top-28 rounded-[3rem] shadow-apple-deep border-black/5 overflow-hidden transition-all duration-700 bg-white">
      <CardHeader className="bg-primary p-10 text-white space-y-2">
        <div className="flex justify-between items-baseline">
            <CardTitle className="text-4xl font-black tracking-tighter">
                {hotel.minPrice?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
            </CardTitle>
            <span className="text-[10px] font-black opacity-80 uppercase tracking-widest">Starting / night</span>
        </div>
        <CardDescription className="text-white/70 flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4" /> Best Price Authenticated
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-10 space-y-10">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Stay Period</label>
            <Popover>
                <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-16 rounded-[1.5rem] justify-start font-bold border-black/10 hover:bg-muted/50 transition-all duration-300 text-lg">
                    <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                    {dates?.from ? (
                    dates.to ? `${format(dates.from, 'MMM dd')} - ${format(dates.to, 'MMM dd')}` : format(dates.from, 'MMM dd')
                    ) : "Check-in — Check-out"}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-6 rounded-[2.5rem] shadow-apple-deep border-black/5" align="end">
                <Calendar mode="range" selected={dates} onSelect={setDates} disabled={{ before: new Date() }} className="rounded-2xl" />
                </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Travelers</label>
            <div className="flex items-center gap-3 h-16 w-full rounded-[1.5rem] border border-black/10 px-6 bg-background/50">
                <input 
                    type="number" 
                    min="1" 
                    value={guests} 
                    onChange={e => setGuests(e.target.value)}
                    className="flex-1 bg-transparent font-black text-lg focus:outline-none"
                />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Adults</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">The Collection</h4>
          {isLoadingRooms ? (
            <Skeleton className="h-48 w-full rounded-[2rem]" />
          ) : rooms.length === 0 ? (
            <Alert className="rounded-[2rem] bg-amber-50 border-amber-100"><AlertDescription>Pricing currently unavailable.</AlertDescription></Alert>
          ) : !isDateRangeValid ? (
            <div className="p-8 bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-black/5 text-center space-y-3">
                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Enter dates to unlock inventory</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const isSoldOut = room.availableRooms !== undefined && room.availableRooms <= 0;
                const price = hotel.discount ? room.price * (1 - hotel.discount / 100) : room.price;

                return (
                    <div
                        key={room.id}
                        onClick={() => !isSoldOut && setSelectedRoom(room)}
                        className={cn(
                            'p-6 rounded-[2rem] transition-all duration-500 border-2 cursor-pointer flex items-center justify-between group',
                            isSelected ? 'border-primary bg-primary/5 shadow-apple' : 'border-black/5 hover:border-black/10 bg-white',
                            isSoldOut && 'opacity-40 grayscale cursor-not-allowed'
                        )}
                    >
                        <div className="space-y-1.5">
                            <p className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{room.type}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cap: {room.capacity} Guests</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-primary text-xl tracking-tighter">{price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</p>
                            {isSelected && <Badge className="text-[9px] h-5 rounded-full mt-2 bg-primary text-white font-black tracking-widest">SELECTED</Badge>}
                        </div>
                    </div>
                )
              })}
            </div>
          )}
        </div>

        {selectedRoom && isDateRangeValid && (
          <div className='pt-6 animate-in fade-in slide-in-from-top-6 duration-700 ease-apple-ease'>
            <Button
              onClick={handleBookNow}
              size="lg"
              className="w-full h-20 rounded-full text-xl font-black bg-accent hover:bg-accent/90 shadow-apple-deep shadow-accent/30 tracking-tight transition-all active:scale-95"
            >
              Confirm Reservation <ChevronRight className="ml-3 h-6 w-6" />
            </Button>
            <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-6">
                Instant confirmation available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
