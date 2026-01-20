'use client';

import { useState, useMemo, useEffect } from 'react';
import { BedDouble, Calendar as CalendarIcon, AlertCircle, Info } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, Timestamp, collectionGroup } from 'firebase/firestore';

import type { Hotel, Room, Booking } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection } from '@/firebase';
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
import { Skeleton } from '../ui/skeleton';
import { Loader2 } from 'lucide-react';


export function RoomBookingCard({ hotel }: { hotel: Hotel }) {
  const [dates, setDates] = useState<DateRange | undefined>();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [guests, setGuests] = useState('1');
  const [availability, setAvailability] = useState<Record<string, { available: number; text: string }>>({});
  const [isCheckingAvail, setIsCheckingAvail] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const roomsQuery = useMemo(() => {
      if (!firestore || !hotel.id) return null;
      return collection(firestore, 'hotels', hotel.id, 'rooms');
  }, [firestore, hotel.id]);

  const { data: liveRooms, isLoading: isLoadingRooms } = useCollection<Room>(roomsQuery);
  
  const nights =
    dates?.from && dates?.to ? differenceInDays(dates.to, dates.from) : 0;

  const isDateRangeValid = dates?.from && dates?.to && nights > 0;

  const rooms = useMemo(() => {
    if (liveRooms && liveRooms.length > 0) {
      return liveRooms;
    }
    if (!isLoadingRooms && (!liveRooms || liveRooms.length === 0)) {
        return dummyRooms.filter(r => r.hotelId === hotel.id);
    }
    return [];
  }, [liveRooms, isLoadingRooms, hotel.id]);
  
  useEffect(() => {
    if (!isDateRangeValid || !firestore || rooms.length === 0) {
      setAvailability({});
      return;
    }

    const checkAvailability = async () => {
      setIsCheckingAvail(true);
      try {
        const userCheckIn = dates.from!;
        const userCheckOut = dates.to!;

        // Query for all bookings in this hotel that could potentially overlap
        const bookingsRef = collectionGroup(firestore, 'bookings');
        const q = query(
          bookingsRef,
          where('hotelId', '==', hotel.id),
          where('status', '==', 'CONFIRMED'),
          where('checkIn', '<', userCheckOut)
        );

        const querySnapshot = await getDocs(q);
        const bookings: Booking[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            // Convert Firestore Timestamps to JS Dates
            const bookingData = {
              ...data,
              checkIn: (data.checkIn as Timestamp).toDate(),
              checkOut: (data.checkOut as Timestamp).toDate(),
            } as Booking;

             if (bookingData.checkOut > userCheckIn) {
              bookings.push(bookingData);
            }
        });
        
        const newAvailability: Record<string, { available: number; text: string }> = {};

        for (const room of rooms) {
          const overlappingBookings = bookings.filter(booking => 
              booking.roomId === room.id
          );
          
          const bookedCount = overlappingBookings.length;
          const availableCount = (room.totalRooms || 0) - bookedCount;
          
          newAvailability[room.id] = {
              available: availableCount,
              text: availableCount <= 0 ? 'Sold Out' : `${availableCount} rooms left`
          };
        }
        setAvailability(newAvailability);
      } catch (error) {
          console.error("Error checking availability:", error);
          toast({
              variant: "destructive",
              title: "Could not check availability",
              description: "There was an error checking for room availability. Please try again.",
          });
      } finally {
        setIsCheckingAvail(false);
      }
    };

    checkAvailability();
  }, [dates, firestore, hotel.id, isDateRangeValid, rooms, toast]);


  if (isLoadingRooms) {
      return (
          <Card className="sticky top-24">
             <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
             </CardHeader>
             <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
             </CardContent>
          </Card>
      )
  }

  if (!rooms || rooms.length === 0) {
    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">
                  <BedDouble className="mr-2 inline-block h-6 w-6" />
                  Book Your Stay
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="default" className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 !text-amber-600" />
                    <AlertTitle className="text-amber-800">Booking Not Available</AlertTitle>
                    <AlertDescription className="text-amber-700">
                        Rooms for this hotel are not yet configured for online booking. Please check back later or add them in the admin panel.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
  }


  const handleRoomSelect = (room: Room) => {
    if (isDateRangeValid && availability[room.id]?.available > 0) {
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
    
    if (availability[selectedRoom.id]?.available <= 0) {
        toast({
            variant: 'destructive',
            title: 'Room Not Available',
            description: 'This room is sold out for the selected dates. Please choose another room or date.',
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
          Select your dates to check real-time availability.
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

         <div>
          <h4 className="font-semibold mb-2">2. Select Guests</h4>
           <Label htmlFor="guests" className="sr-only">Guests</Label>
           <Input id="guests" type="number" min="1" placeholder="Number of guests" value={guests} onChange={e => setGuests(e.target.value)} />
         </div>

        {!isDateRangeValid && (
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 !text-blue-600" />
            <AlertTitle className="text-blue-800">Select Dates</AlertTitle>
            <AlertDescription className="text-blue-700">
              Please select a valid date range to see room prices and availability.
            </AlertDescription>
          </Alert>
        )}

        {isDateRangeValid && (
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 !text-blue-600" />
            <AlertTitle className="text-blue-800">3. Select a Room</AlertTitle>
             {isCheckingAvail ? (
                <div className="flex items-center text-blue-700">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Checking availability...
                </div>
            ) : (
                <AlertDescription className="text-blue-700">
                    Click on an available room to select it for booking.
                </AlertDescription>
            )}
          </Alert>
        )}

        <div className="space-y-4">
          {rooms?.map((room) => {
             const isAvailable = isDateRangeValid && availability[room.id]?.available > 0;
             const isDisabled = !isDateRangeValid || isCheckingAvail || !availability[room.id] || availability[room.id]?.available <= 0;
            return (
                <Card
                key={room.id}
                onClick={() => !isDisabled && handleRoomSelect(room)}
                className={cn(
                    'p-4 transition-all',
                    isDisabled ? 'cursor-not-allowed bg-muted/50 opacity-60' : 'cursor-pointer hover:bg-muted/50',
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
                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <p className="text-lg font-bold text-primary">
                          {room.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                          <span className="text-sm font-normal text-muted-foreground">/night</span>
                      </p>
                      {isDateRangeValid && !isCheckingAvail && availability[room.id] && (
                        <p className={cn(
                            "text-sm font-semibold",
                            isAvailable ? "text-green-600" : "text-destructive"
                        )}>{availability[room.id].text}</p>
                      )}
                    </div>
                </div>
                </Card>
            )
          })}
        </div>

        {selectedRoom && isDateRangeValid && (
          <div className='border-t pt-6 space-y-4'>
            <div className="flex justify-between items-center font-bold">
              <span>{selectedRoom.type} Room x {nights} nights</span>
              <span>{(selectedRoom.price * nights).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
            </div>
            <Button
              onClick={handleBookNow}
              size="lg"
              className="w-full h-12 text-lg bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={availability[selectedRoom.id]?.available <= 0}
            >
              Book Now & Proceed to Payment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
