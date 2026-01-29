
'use client';

import { useState, useMemo, useEffect } from 'react';
import { BedDouble, Calendar as CalendarIcon, AlertCircle, TrendingDown, HelpCircle } from 'lucide-react';
import { differenceInDays, format, add } from 'date-fns';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';


export function RoomBookingCard({ hotel, rooms, isLoadingRooms }: { hotel: WithId<Hotel>, rooms: WithId<Room>[], isLoadingRooms: boolean }) {
  const [dates, setDates] = useState<DateRange | undefined>();
  const [selectedRoom, setSelectedRoom] = useState<WithId<Room> | null>(null);
  const [guests, setGuests] = useState('1');
  const router = useRouter();
  const { toast } = useToast();
  
  const [clientDateState, setClientDateState] = useState<{
    disabledBeforeDate: Date;
    isPastCutOff: boolean;
  } | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after hydration, to prevent mismatch errors.
    const today = new Date();
    const cutOffHour = 14; // 2 PM
    const isPastCutOff = today.getHours() >= cutOffHour;
    
    const disabledBeforeDate = new Date(today);
    if (isPastCutOff) {
      // If it's past cut-off, disable today, so tomorrow is the first available day.
      disabledBeforeDate.setDate(today.getDate() + 1);
    }
    // Set time to the beginning of the day to avoid timezone issues.
    disabledBeforeDate.setHours(0, 0, 0, 0);

    setClientDateState({ disabledBeforeDate, isPastCutOff });
  }, []); // Empty dependency array ensures it runs once on mount.

  const nights =
    dates?.from && dates?.to ? differenceInDays(dates.to, dates.from) : 0;

  const isDateRangeValid = dates?.from && dates?.to && nights > 0;
  
  const handleRoomSelect = (room: WithId<Room>) => {
    if (isDateRangeValid) {
        setSelectedRoom(room);
    }
  };

  const handleBookNow = () => {
    if (!selectedRoom || !isDateRangeValid || !dates?.from || !dates.to) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please select dates and a room to proceed.',
        });
        return;
    }
    
    const params = new URLSearchParams();
    params.set('hotelId', hotel.id);
    params.set('roomId', selectedRoom.id);
    params.set('checkIn', format(dates.from, 'yyyy-MM-dd'));
    params.set('checkOut', format(dates.to, 'yyyy-MM-dd'));
    params.set('guests', guests);
    
    router.push(`/booking?${params.toString()}`);
  }


  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          <BedDouble className="mr-2 inline-block h-6 w-6" />
          Book Your Stay
        </CardTitle>
        <CardDescription>
          Select your dates and room type to proceed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-2">1. Select Dates</h4>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dates && 'text-muted-foreground'
                )}
                 disabled={!clientDateState}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dates?.from ? (
                  dates.to ? (
                    <>
                      {format(dates.from, 'LLL dd, y')} -{' '}
                      {format(dates.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(dates.from, 'LLL dd, y')
                  )
                ) : (
                   <span>{clientDateState ? 'Pick check-in & check-out dates' : 'Loading...'}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dates?.from}
                selected={dates}
                onSelect={setDates}
                numberOfMonths={2}
                disabled={!clientDateState ? { before: new Date() } : { before: clientDateState.disabledBeforeDate }}
              />
            </PopoverContent>
          </Popover>
           {clientDateState?.isPastCutOff && <p className="text-xs text-muted-foreground mt-2">Note: Same-day bookings are not available after 14:00.</p>}
        </div>

         <div>
          <h4 className="font-semibold mb-2">2. Select Guests</h4>
           <Label htmlFor="guests" className="sr-only">Guests</Label>
           <Input id="guests" type="number" min="1" placeholder="Number of guests" value={guests} onChange={e => setGuests(e.target.value)} />
         </div>

        { /* Section for rooms, which shows loading, no rooms message, or room list */ }
        <div>
          {isLoadingRooms ? (
            <div className="space-y-2 pt-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : !rooms || rooms.length === 0 ? (
            <Alert variant="default" className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 !text-amber-600" />
                <AlertTitle className="text-amber-800">Booking Not Available</AlertTitle>
                <AlertDescription className="text-amber-700">
                    Rooms for this hotel are not yet configured for online booking. Please check back later.
                </AlertDescription>
            </Alert>
          ) : !isDateRangeValid ? (
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 !text-blue-600" />
              <AlertTitle className="text-blue-800">Select Dates</AlertTitle>
              <AlertDescription className="text-blue-700">
                Please select a valid date range to see room prices.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold">3. Select a Room</h4>
              {rooms.map((room) => {
                const isDisabled = !isDateRangeValid;
                const isSoldOut = !isDisabled && room.availableRooms !== undefined && room.availableRooms <= 0;
                const discountedPrice = hotel.discount ? room.price * (1 - hotel.discount / 100) : room.price;

                return (
                    <Card
                    key={room.id}
                    onClick={() => !isDisabled && !isSoldOut && handleRoomSelect(room)}
                    className={cn(
                        'p-4 transition-all relative overflow-hidden',
                        isDisabled && 'cursor-not-allowed bg-muted/50 opacity-60',
                        !isDisabled && !isSoldOut && 'cursor-pointer hover:bg-muted/50',
                        isSoldOut && 'bg-muted/80 opacity-60 cursor-not-allowed',
                        selectedRoom?.id === room.id && 'ring-2 ring-primary bg-primary/5',
                    )}
                    >
                    <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                        <div>
                          <h4 className="font-semibold">{room.type} Room</h4>
                          <p className="text-sm text-muted-foreground">
                              Fits up to {room.capacity} guests
                          </p>
                        </div>
                        <div className="flex flex-col items-start gap-0 md:items-end">
                          <p className="text-lg font-bold text-primary">
                              {discountedPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                              <span className="text-sm font-normal text-muted-foreground">/night</span>
                          </p>
                           {hotel.discount && hotel.discount > 0 && (
                            <p className="text-xs text-muted-foreground line-through">
                              {room.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                            </p>
                          )}
                        </div>
                    </div>
                     {selectedRoom?.id === room.id && room.availableRooms !== undefined && room.availableRooms <= 5 && room.availableRooms > 0 && (
                        <Alert className="mt-3 bg-amber-50 border-amber-200 text-amber-800">
                            <TrendingDown className="h-4 w-4 !text-amber-600" />
                            <AlertDescription>
                               Hurry! Only {room.availableRooms} {room.availableRooms === 1 ? 'room' : 'rooms'} of this type left.
                            </AlertDescription>
                        </Alert>
                    )}
                    {isSoldOut && (
                        <Badge variant="destructive" className="absolute top-2 right-2">Sold Out</Badge>
                    )}
                    </Card>
                )
              })}
            </div>
          )}
        </div>

        {selectedRoom && isDateRangeValid && (
          <div className='border-t pt-6 space-y-4'>
            <div className="flex justify-between items-center font-bold">
              <span>{selectedRoom.type} Room x {nights} nights</span>
              <span>
                {((hotel.discount ? selectedRoom.price * (1 - hotel.discount / 100) : selectedRoom.price) * nights).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
              </span>
            </div>
            <Button
              onClick={handleBookNow}
              size="lg"
              className="w-full h-12 text-lg bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Book Now & Proceed to Payment
            </Button>
          </div>
        )}
         <div className="text-center text-sm text-muted-foreground space-y-2 mt-2">
            <p className="text-xs flex items-center justify-center gap-2"><HelpCircle className="h-4 w-4" />Need help? Email us at <a href="mailto:nsati09@gmail.com" className="font-semibold text-primary hover:underline">nsati09@gmail.com</a></p>
        </div>
      </CardContent>
    </Card>
  );
}
