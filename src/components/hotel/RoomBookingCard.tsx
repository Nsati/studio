
'use client';

import { useState, useMemo } from 'react';
import { BedDouble, Calendar as CalendarIcon, AlertCircle, User, Info, Loader2 } from 'lucide-react';
import { differenceInDays, format, addMinutes } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';

import type { Hotel, Room, Booking } from '@/lib/types';
import { getBookingsForRoom, addBooking, updateBookingStatus, removeBooking } from '@/lib/data';
import { createRazorpayOrder } from '@/app/booking/actions';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';


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

// Extend the Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RoomBookingCard({ hotel }: { hotel: Hotel }) {
  const [dates, setDates] = useState<DateRange | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { user } = useUser();
  const [customerDetails, setCustomerDetails] = useState({ name: user?.displayName || '', email: user?.email || '' });

  const router = useRouter();
  const { toast } = useToast();

  const nights =
    dates?.from && dates?.to ? differenceInDays(dates.to, dates.from) : 0;
  
  const isDateRangeValid = dates?.from && dates?.to && nights > 0;

  const handleProceedToBook = async () => {
    if (!selectedRoom) {
        toast({
            variant: 'destructive',
            title: 'No Room Selected',
            description: 'Please select a room type to continue.',
        });
        return;
    }
    if (!isDateRangeValid || !dates.from || !dates.to) {
        toast({
            variant: 'destructive',
            title: 'Invalid Dates',
            description: 'Please select a valid check-in and check-out date.',
        });
        return;
    }
     if (!user && (!customerDetails.name || !customerDetails.email)) {
        toast({
            variant: 'destructive',
            title: 'Customer Details Required',
            description: 'Please enter your name and email address to proceed.',
        });
        return;
    }
    setIsProcessing(true);

    const totalAmount = nights * selectedRoom.price;

    // Create a temporary locked booking
    const lockExpiry = addMinutes(new Date(), 5);
    const lockedBooking = addBooking({
        hotelId: hotel.id,
        roomId: selectedRoom.id,
        roomType: selectedRoom.type,
        userId: user ? user.uid : 'guest',
        checkIn: dates.from.toISOString(),
        checkOut: dates.to.toISOString(),
        guests: selectedRoom.capacity,
        totalPrice: totalAmount,
        customerName: user?.displayName || customerDetails.name,
        customerEmail: user?.email || customerDetails.email,
        status: 'LOCKED',
        expiresAt: lockExpiry.toISOString(),
    });

    const orderResponse = await createRazorpayOrder(totalAmount, `booking_${selectedRoom.id}_${Date.now()}`);

    if (!orderResponse.success || !orderResponse.order) {
        toast({
            variant: 'destructive',
            title: 'Payment Error',
            description: orderResponse.error || 'Could not initialize payment.',
        });
        removeBooking(lockedBooking.id); // Remove lock on failure
        setIsProcessing(false);
        return;
    }
    
    const { order } = orderResponse;
    const finalCustomerName = user?.displayName || customerDetails.name;
    const finalCustomerEmail = user?.email || customerDetails.email;

    const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Uttarakhand Getaways',
        description: `Booking for ${selectedRoom.type} at ${hotel.name}`,
        image: '/logo-icon.png',
        order_id: order.id,
        handler: function (response: any) {
            updateBookingStatus(lockedBooking.id, 'CONFIRMED');

            toast({
                title: 'Payment Successful!',
                description: `Your booking at ${hotel.name} is confirmed.`,
            });
            
            router.push(`/booking/success/${lockedBooking.id}`);
        },
        prefill: {
            name: finalCustomerName,
            email: finalCustomerEmail,
        },
        notes: {
            address: 'Razorpay Corporate Office'
        },
        theme: {
            color: '#388E3C'
        },
        modal: {
            ondismiss: function() {
                removeBooking(lockedBooking.id); // Remove lock on cancellation
                toast({
                    variant: 'destructive',
                    title: 'Payment Canceled',
                    description: 'Your payment process was canceled. The room lock has been released.',
                });
                setIsProcessing(false);
            }
        }
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const availableRooms = useMemo(() => {
    if (!isDateRangeValid || !dates?.from || !dates.to) {
        setSelectedRoom(null);
        return hotel.rooms.map(room => ({ ...room, isAvailable: false, bookingsCount: 0 }));
    }

    return hotel.rooms.map(room => {
        const existingBookings = getBookingsForRoom(room.id, dates.from!, dates.to!);
        const isAvailable = existingBookings.length < room.totalRooms;
        if (selectedRoom?.id === room.id && !isAvailable) {
            setSelectedRoom(null);
        }
        return { ...room, isAvailable, bookingsCount: existingBookings.length };
    });
  }, [hotel.rooms, dates, isDateRangeValid, selectedRoom?.id]);
  
  const handleRoomSelect = (room: Room) => {
    if (isDateRangeValid && room.isAvailable) {
        setSelectedRoom(room);
    } else {
        toast({ variant: 'destructive', title: 'Room Unavailable', description: 'This room is not available for the selected dates.'})
    }
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
            {availableRooms.map((room) => (
              <Card 
                key={room.id}
                onClick={() => handleRoomSelect(room)}
                className={cn(
                    'p-4 cursor-pointer transition-all',
                    isDateRangeValid && room.isAvailable && 'hover:bg-muted/50',
                    selectedRoom?.id === room.id && 'ring-2 ring-primary bg-primary/5',
                    !room.isAvailable && 'bg-muted/30 opacity-60 cursor-not-allowed'
                )}
              >
                <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                  <div>
                    <h4 className="font-semibold">{room.type} Room</h4>
                    <p className="text-sm text-muted-foreground">
                      Fits up to {room.capacity} guests
                    </p>
                    {isDateRangeValid && (
                         <p className={cn(
                            'text-sm',
                            room.isAvailable ? 'text-green-600' : 'text-destructive'
                         )}>
                            {room.isAvailable 
                                ? `${room.totalRooms - room.bookingsCount} of ${room.totalRooms} available`
                                : 'Fully Booked'}
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
                    onClick={handleProceedToBook}
                    size="lg"
                    className="w-full"
                    disabled={isProcessing}
                >
                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : `Proceed to Book for ₹${(selectedRoom.price * nights).toLocaleString()}`}
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
  );
}

