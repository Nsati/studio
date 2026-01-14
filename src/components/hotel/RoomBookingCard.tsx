'use client';

import { useState, useMemo } from 'react';
import { BedDouble, Calendar as CalendarIcon, AlertCircle, User } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';

import type { Hotel, Room } from '@/lib/types';
import { getBookingsForRoom, addBooking } from '@/lib/data';
import { createRazorpayOrder } from '@/app/booking/actions';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';


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

// Extend the Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RoomBookingCard({ hotel }: { hotel: Hotel }) {
  const [dates, setDates] = useState<DateRange | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();

  const nights =
    dates?.from && dates?.to ? differenceInDays(dates.to, dates.from) : 0;
  
  const isDateRangeValid = dates?.from && dates?.to && nights > 0;

  const handleBookNowClick = async (room: Room) => {
    if (!isDateRangeValid || !dates.from || !dates.to) {
        toast({
            variant: 'destructive',
            title: 'Invalid Dates',
            description: 'Please select a valid check-in and check-out date.',
        });
        return;
    }
     if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not Logged In',
            description: 'Please log in to book a room.',
        });
        router.push('/login');
        return;
    }
    setIsProcessing(true);

    const totalAmount = nights * room.price;

    // 1. Create Razorpay Order
    const orderResponse = await createRazorpayOrder(totalAmount, `booking_${room.id}_${Date.now()}`);

    if (!orderResponse.success || !orderResponse.order) {
        toast({
            variant: 'destructive',
            title: 'Payment Error',
            description: orderResponse.error || 'Could not initialize payment.',
        });
        setIsProcessing(false);
        return;
    }
    
    const { order } = orderResponse;

    // 2. Configure and open Razorpay Checkout
    const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Uttarakhand Getaways',
        description: `Booking for ${room.type} at ${hotel.name}`,
        image: '/logo-icon.png', // Add a logo to your /public folder
        order_id: order.id,
        handler: function (response: any) {
            // 3. Handle successful payment
            
            // In a real-world app, you would verify the payment signature on the server here.
            // For this demo, we'll assume the payment is successful.
            
            const newBooking = addBooking({
                hotelId: hotel.id,
                roomId: room.id,
                roomType: room.type,
                userId: user.uid, // Use logged-in user's ID
                checkIn: dates.from!.toISOString(),
                checkOut: dates.to!.toISOString(),
                guests: room.capacity, // Using room capacity as default
                totalPrice: totalAmount,
                customerName: user.displayName || 'Guest',
                customerEmail: user.email || 'no-email@example.com',
            });

            toast({
                title: 'Payment Successful!',
                description: `Your booking at ${hotel.name} is confirmed.`,
            });
            
            router.push(`/booking/success/${newBooking.id}`);
        },
        prefill: {
            name: user.displayName || 'Guest',
            email: user.email,
        },
        notes: {
            address: 'Razorpay Corporate Office'
        },
        theme: {
            color: '#388E3C'
        },
        modal: {
            ondismiss: function() {
                // This function is called when the user closes the modal
                toast({
                    variant: 'destructive',
                    title: 'Payment Canceled',
                    description: 'Your payment process was canceled.',
                });
                setIsProcessing(false);
            }
        }
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
    // No need to set isProcessing to false here, as modal ondismiss handles it
  };

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

          {!user && (
             <Alert variant="default" className="bg-blue-50 border-blue-200">
                <User className="h-4 w-4 !text-blue-600" />
                <AlertTitle className="text-blue-800">Log In to Book</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Please log in or sign up to see room prices and make a reservation.
                </AlertDescription>
            </Alert>
          )}

          {user && !isDateRangeValid && (
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
                    {isDateRangeValid && user && (
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
                    {isDateRangeValid && user && room.isAvailable ? (
                        <Button
                            onClick={() => handleBookNowClick(room)}
                            size="sm"
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Book Now'}
                        </Button>
                    ) : (
                        <Button
                            disabled
                            size="sm"
                            variant={isDateRangeValid && user ? "destructive" : "default"}
                        >
                           { !user ? 'Login to Book' : isDateRangeValid ? 'Fully Booked' : 'Select Dates'}
                        </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
  );
}
