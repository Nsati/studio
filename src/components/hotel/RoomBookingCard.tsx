'use client';

import { useState, useMemo, useEffect } from 'react';
import { BedDouble, Calendar as CalendarIcon, AlertCircle, Info, Loader2 } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';

import type { Hotel, Room } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import { createRazorpayOrder, revalidateAdminOnBooking } from '@/app/booking/actions';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';

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
import { revalidatePublicContent } from '@/app/admin/actions';
import { dummyRooms } from '@/lib/dummy-data';

// Add this interface to handle the Razorpay window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RoomBookingCard({ hotel }: { hotel: Hotel }) {
  const [dates, setDates] = useState<DateRange | undefined>();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { user, userProfile } = useUser();
  const [customerDetails, setCustomerDetails] = useState({ name: '', email: '' });
  const router = useRouter();
  const { toast } = useToast();
  const [isBooking, setIsBooking] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    if (userProfile) {
      setCustomerDetails({ name: userProfile.displayName, email: userProfile.email });
    }
  }, [userProfile]);

  const nights =
    dates?.from && dates?.to ? differenceInDays(dates.to, dates.from) : 0;

  const isDateRangeValid = dates?.from && dates?.to && nights > 0;

  const rooms = useMemo(() => {
    return dummyRooms.filter(room => room.hotelId === hotel.id);
  }, [hotel.id]);


  const handleRoomSelect = (room: Room) => {
    // In dummy data mode, we assume rooms are always available.
    if (isDateRangeValid) {
        setSelectedRoom(room);
    }
  };

  const handlePayment = async () => {
    if (!selectedRoom || !isDateRangeValid) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please select dates and a room.',
        });
        return;
    }
     if (!customerDetails.name || !customerDetails.email) {
        toast({
            variant: 'destructive',
            title: 'Missing Details',
            description: 'Please provide your name and email.',
        });
        return;
    }

    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not Logged In',
            description: 'Please log in to make a booking.',
        });
        router.push('/login');
        return;
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      toast({
        variant: 'destructive',
        title: 'Payment Gateway Not Configured',
        description: "The site owner hasn't set up Razorpay.",
      });
      return;
    }

    setIsBooking(true);

    const amount = selectedRoom.price * nights;
    const receipt = `booking_${new Date().getTime()}`;

    const result = await createRazorpayOrder(amount, receipt);

    if (!result.success || !result.order) {
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: result.error || 'Could not initiate payment.',
      });
      setIsBooking(false);
      return;
    }
    
    const newBookingId = result.order.receipt;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: result.order.amount,
      currency: result.order.currency,
      name: 'Uttarakhand Getaways',
      description: `Booking for ${hotel.name}`,
      image: 'https://cdn.worldvectorlogo.com/logos/uttarakhand-tourism.svg',
      order_id: result.order.id,
      handler: async function (response: any) {
        if (!firestore || !user || !selectedRoom || !dates?.from || !dates?.to) return;
        
        const bookingRef = doc(firestore, 'users', user.uid, 'bookings', newBookingId);

        try {
            const bookingData = {
                id: newBookingId,
                hotelId: hotel.id,
                userId: user.uid,
                roomId: selectedRoom.id,
                roomType: selectedRoom.type,
                checkIn: dates.from!,
                checkOut: dates.to!,
                guests: 2, // Example, you might want a guest selector
                totalPrice: amount,
                customerName: customerDetails.name,
                customerEmail: customerDetails.email,
                status: 'CONFIRMED' as const,
                createdAt: new Date(),
                razorpayPaymentId: response.razorpay_payment_id,
            };

            await setDoc(bookingRef, bookingData);

            // Revalidation can still be useful if admin panel checks bookings.
            await revalidateAdminOnBooking();
            
            toast({
              title: 'Payment Successful!',
              description: 'Redirecting to your confirmation...',
            });
            router.push(`/booking/success/${newBookingId}`);

        } catch (error: any) {
            console.error("Booking failed to save:", error);
            toast({
                variant: 'destructive',
                title: 'Booking Failed',
                description: 'We could not save your booking after payment. Please contact support.',
            });
            setIsBooking(false);
        }
      },
      prefill: {
        name: customerDetails.name,
        email: customerDetails.email,
      },
      notes: {
        hotelId: hotel.id,
        roomId: selectedRoom.id,
        checkIn: format(dates!.from!, 'yyyy-MM-dd'),
        checkOut: format(dates!.to!, 'yyyy-MM-dd'),
        userId: user.uid,
      },
      theme: {
        color: '#418259',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: response.error.description,
      });
      setIsBooking(false);
    });
    
    rzp.open();
  };

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

        <div className="space-y-4">
          <h4 className="font-semibold mb-2">2. Guest Details</h4>
          <div>
            <Label htmlFor='customerName'>Full Name</Label>
            <Input
              id="customerName"
              placeholder="Your Name"
              value={customerDetails.name}
              onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor='customerEmail'>Email Address</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="your.email@example.com"
              value={customerDetails.email}
              onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
            />
          </div>
        </div>

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
            <AlertTitle className="text-blue-800">3. Select a Room</AlertTitle>
            <AlertDescription className="text-blue-700">
              Click on a room to select it for booking.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {rooms?.map((room) => {
             const isAvailable = true; // Always available with dummy data
            return (
                <Card
                key={room.id}
                onClick={() => handleRoomSelect(room)}
                className={cn(
                    'p-4 transition-all',
                    isDateRangeValid && isAvailable ? 'cursor-pointer hover:bg-muted/50' : 'cursor-not-allowed bg-muted/30 opacity-60',
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
                        ₹{room.price.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground">
                        /night
                        </span>
                    </p>
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
              <span>₹{(selectedRoom.price * nights).toLocaleString()}</span>
            </div>
            <Button
              onClick={handlePayment}
              size="lg"
              className="w-full"
              disabled={isBooking}
            >
              {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Proceed to Payment
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              You will be redirected to Razorpay for secure payment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
