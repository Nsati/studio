'use client';

import { useState, useMemo, useEffect } from 'react';
import { BedDouble, Calendar as CalendarIcon, AlertCircle, User, Info, Loader2 } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';

import type { Hotel, Room } from '@/lib/types';
import { useUser } from '@/firebase';
import { dummyRooms } from '@/lib/dummy-data';

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

export function RoomBookingCard({ hotel }: { hotel: Hotel }) {
  const [dates, setDates] = useState<DateRange | undefined>();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { user, userProfile } = useUser();
  const [customerDetails, setCustomerDetails] = useState({ name: '', email: '' });

  useEffect(() => {
    if(userProfile) {
        setCustomerDetails({ name: userProfile.displayName, email: userProfile.email });
    }
  }, [userProfile]);

  const nights =
    dates?.from && dates?.to ? differenceInDays(dates.to, dates.from) : 0;
  
  const isDateRangeValid = dates?.from && dates?.to && nights > 0;

  const { rooms, isLoading: isLoadingRooms } = useMemo(() => {
    const filteredRooms = dummyRooms.filter(r => r.hotelId === hotel.id);
    return { data: filteredRooms, isLoading: false };
  }, [hotel.id]);

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
  }

  return (
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
            <h4 className="font-semibold mb-2">1. Select Dates</h4>
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

          {!user && (
            <div className="space-y-4">
                <h4 className="font-semibold mb-2">2. Your Details</h4>
                <div>
                    <Label htmlFor='customerName'>Full Name</Label>
                    <Input 
                        id="customerName" 
                        placeholder="Your Name" 
                        value={customerDetails.name}
                        onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                    />
                </div>
                <div>
                    <Label htmlFor='customerEmail'>Email Address</Label>
                    <Input 
                        id="customerEmail" 
                        type="email"
                        placeholder="your.email@example.com"
                        value={customerDetails.email}
                        onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                    />
                </div>
            </div>
          )}


          {!isDateRangeValid && (
             <Alert variant="default" className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 !text-amber-600" />
                <AlertTitle className="text-amber-800">Select Dates</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Please select a valid date range to see room prices and availability.
                </AlertDescription>
            </Alert>
          )}

          {isDateRangeValid && (
             <Alert variant="default" className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 !text-blue-600" />
                <AlertTitle className="text-blue-800">2. Select a Room</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Click on a room to select it for booking.
                </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {isLoadingRooms && <Loader2 className="animate-spin" />}
            {rooms?.map((room) => (
              <Card 
                key={room.id}
                onClick={() => isDateRangeValid && handleRoomSelect(room)}
                className={cn(
                    'p-4 cursor-pointer transition-all',
                    isDateRangeValid && 'hover:bg-muted/50',
                    selectedRoom?.id === room.id && 'ring-2 ring-primary bg-primary/5',
                    !isDateRangeValid && 'bg-muted/30 opacity-60 cursor-not-allowed'
                )}
              >
                <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                  <div>
                    <h4 className="font-semibold">{room.type} Room</h4>
                    <p className="text-sm text-muted-foreground">
                      Fits up to {room.capacity} guests
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <p className="text-lg font-bold text-primary">
                      ₹{room.price.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground">
                        /night
                      </span>
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {selectedRoom && isDateRangeValid && (
            <div className='border-t pt-6 space-y-4'>
                <div className="flex justify-between items-center font-bold">
                    <span>{selectedRoom.type} Room x {nights} nights</span>
                    <span>₹{(selectedRoom.price * nights).toLocaleString()}</span>
                </div>
                 <Button
                    size="lg"
                    className="w-full"
                    disabled={true}
                >
                    Booking Disabled
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                    Online booking is not available in this demonstration.
                </p>
            </div>
          )}
        </CardContent>
      </Card>
  );
}
