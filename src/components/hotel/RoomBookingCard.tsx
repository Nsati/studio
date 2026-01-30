'use client';

import { useState, useEffect } from 'react';
import { BedDouble, Calendar as CalendarIcon, AlertCircle, ShieldCheck, ChevronRight } from 'lucide-react';
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
        toast({ variant: 'destructive', title: 'Missing Info', description: 'Select dates and a room.' });
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
    <Card className="sticky top-28 rounded-[2.5rem] shadow-2xl border-black/5 overflow-hidden">
      <CardHeader className="bg-primary p-8 text-white space-y-1">
        <div className="flex justify-between items-baseline">
            <CardTitle className="text-3xl font-black tracking-tight">
                {hotel.minPrice?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
            </CardTitle>
            <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Starting / night</span>
        </div>
        <CardDescription className="text-white/70 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4" /> 100% Best Price Guarantee
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-8 space-y-8 bg-white">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Stay Period</label>
            <Popover>
                <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-14 rounded-2xl justify-start font-bold border-black/10 hover:bg-muted/50">
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {dates?.from ? (
                    dates.to ? `${format(dates.from, 'MMM dd')} - ${format(dates.to, 'MMM dd')}` : format(dates.from, 'MMM dd')
                    ) : "Select your dates"}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 rounded-3xl" align="end">
                <Calendar mode="range" selected={dates} onSelect={setDates} disabled={{ before: new Date() }} />
                </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Guests</label>
            <div className="flex items-center gap-2 h-14 w-full rounded-2xl border border-black/10 px-4">
                <input 
                    type="number" 
                    min="1" 
                    value={guests} 
                    onChange={e => setGuests(e.target.value)}
                    className="flex-1 bg-transparent font-bold focus:outline-none"
                />
                <span className="text-xs font-bold text-muted-foreground">ADULTS</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Preferred Room</h4>
          {isLoadingRooms ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : rooms.length === 0 ? (
            <Alert className="rounded-2xl bg-amber-50 border-amber-100"><AlertDescription>No rooms configured.</AlertDescription></Alert>
          ) : !isDateRangeValid ? (
            <div className="p-6 bg-muted/30 rounded-[2rem] border-2 border-dashed border-black/5 text-center space-y-2">
                <p className="text-sm font-bold text-muted-foreground">Enter dates to view availability</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const isSoldOut = room.availableRooms !== undefined && room.availableRooms <= 0;
                const price = hotel.discount ? room.price * (1 - hotel.discount / 100) : room.price;

                return (
                    <div
                        key={room.id}
                        onClick={() => !isSoldOut && setSelectedRoom(room)}
                        className={cn(
                            'p-5 rounded-2xl transition-all border-2 cursor-pointer flex items-center justify-between',
                            isSelected ? 'border-primary bg-primary/5' : 'border-black/5 hover:border-black/10',
                            isSoldOut && 'opacity-50 grayscale cursor-not-allowed'
                        )}
                    >
                        <div className="space-y-1">
                            <p className="font-bold tracking-tight">{room.type}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Max {room.capacity} Guests</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-primary">{price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</p>
                            {isSelected && <Badge className="text-[9px] h-4 rounded-full mt-1 bg-primary text-white">SELECTED</Badge>}
                        </div>
                    </div>
                )
              })}
            </div>
          )}
        </div>

        {selectedRoom && isDateRangeValid && (
          <div className='pt-4 animate-in fade-in slide-in-from-top-4 duration-500'>
            <Button
              onClick={handleBookNow}
              size="lg"
              className="w-full h-16 rounded-full text-lg font-black bg-accent hover:bg-accent/90 shadow-xl shadow-accent/20 tracking-tight"
            >
              Book {selectedRoom.type} <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4">
                No charges will be applied yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}