'use client';

import { useState, useMemo } from 'react';
import { BedDouble, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { addDays, format, differenceInDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';

import type { Hotel, Room } from '@/lib/types';
import { getBookingsForRoom } from '@/lib/data';
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
import { PaymentDialog } from './PaymentDialog';

export function RoomBookingCard({ hotel }: { hotel: Hotel }) {
  const [dates, setDates] = useState<DateRange | undefined>();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const nights =
    dates?.from && dates?.to ? differenceInDays(dates.to, dates.from) : 0;

  const handleBookNowClick = (room: Room) => {
    setSelectedRoom(room);
    setIsPaymentOpen(true);
  };
  
  const isDateRangeValid = dates?.from && dates?.to && nights > 0;

  const availableRooms = useMemo(() => {
    if (!isDateRangeValid || !dates?.from || !dates.to) {
        return hotel.rooms.map(room => ({ ...room, isAvailable: false, bookingsCount: 0 }));
    }

    return hotel.rooms.map(room => {
        const existingBookings = getBookingsForRoom(room.id, dates.from!, dates.to!);
        const isAvailable = existingBookings.length < room.totalRooms;
        return { ...room, isAvailable, bookingsCount: existingBookings.length };
    });
  }, [hotel.rooms, dates, isDateRangeValid]);


  return (
    <>
      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            <BedDouble className="mr-2 inline-block h-6 w-6" />
            Book Your Stay
          </CardTitle>
          <CardDescription>
            Select your dates and choose a room to start.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Select Dates</h4>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dates && 'text-muted-foreground'
                  )}
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
                    <span>Pick check-in & check-out dates</span>
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
                  disabled={{ before: new Date() }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {!isDateRangeValid && (
             <Alert variant="default" className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 !text-amber-600" />
                <AlertTitle className="text-amber-800">Select Dates</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Please select a valid date range to see room prices and book.
                </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {availableRooms.map((room) => (
              <Card key={room.id} className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                  <div>
                    <h4 className="font-semibold">{room.type} Room</h4>
                    <p className="text-sm text-muted-foreground">
                      Fits up to {room.capacity} guests
                    </p>
                    {isDateRangeValid && (
                         <p className="text-sm text-muted-foreground">
                            {room.totalRooms - room.bookingsCount} of {room.totalRooms} rooms available
                        </p>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <p className="text-lg font-bold text-primary">
                      ₹{room.price.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground">
                        /night
                      </span>
                    </p>
                    {isDateRangeValid && room.isAvailable ? (
                        <Button
                            onClick={() => handleBookNowClick(room)}
                            size="sm"
                        >
                            Book Now
                        </Button>
                    ) : (
                        <Button
                            disabled
                            size="sm"
                            variant={isDateRangeValid ? "destructive" : "default"}
                        >
                           {isDateRangeValid ? 'Fully Booked' : 'Select Dates'}
                        </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedRoom && dates?.from && dates?.to && (
        <PaymentDialog
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          hotel={hotel}
          room={selectedRoom}
          dates={dates}
          totalAmount={nights * selectedRoom.price}
          guests={selectedRoom.capacity} // default to room capacity, can be changed
        />
      )}
    </>
  );
}
