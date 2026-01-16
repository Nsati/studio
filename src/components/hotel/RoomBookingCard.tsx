'use client';

import { useState, useMemo } from 'react';
import { BedDouble, Calendar as CalendarIcon, AlertCircle, User, Info, Loader2 } from 'lucide-react';
import { differenceInDays, format, addMinutes, isBefore } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';

import type { Hotel, Room, Booking } from '@/lib/types';
import { createRazorpayOrder, revalidateAdminOnBooking } from '@/app/booking/actions';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { runTransaction, collection, doc, serverTimestamp, getDocs, query, where, Timestamp, writeBatch } from 'firebase/firestore';


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

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RoomBookingCard({ hotel }: { hotel: Hotel }) {
  const [dates, setDates] = useState<DateRange | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { user, userProfile } = useUser();
  const firestore = useFirestore();
  const [customerDetails, setCustomerDetails] = useState({ name: '', email: '' });

  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    if(userProfile) {
        setCustomerDetails({ name: userProfile.displayName, email: userProfile.email });
    }
  }, [userProfile]);

  const nights =
    dates?.from && dates?.to ? differenceInDays(dates.to, dates.from) : 0;
  
  const isDateRangeValid = dates?.from && dates?.to && nights > 0;

  const roomsCollection = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'hotels', hotel.id, 'rooms');
  }, [firestore, hotel.id]);

  const { data: rooms, isLoading: isLoadingRooms } = useCollection<Room>(roomsCollection);

  const handleProceedToBook = async () => {
    if (!firestore || !selectedRoom || !isDateRangeValid || !dates?.from || !dates.to) {
        toast({
            variant: 'destructive',
            title: 'Invalid Details',
            description: 'Please select a room and valid dates.',
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
    const finalCustomerName = userProfile?.displayName || customerDetails.name;
    const finalCustomerEmail = userProfile?.email || customerDetails.email;

    let lockedBookingId: string | null = null;

    try {
        lockedBookingId = await runTransaction(firestore, async (transaction) => {
            const roomRef = doc(firestore, 'hotels', hotel.id, 'rooms', selectedRoom.id);
            const bookingsRef = collection(firestore, 'bookings');
            
            // 1. Get room details
            const roomDoc = await transaction.get(roomRef);
            if (!roomDoc.exists()) {
                throw new Error("Room does not exist!");
            }
            const roomData = roomDoc.data() as Room;

            // 2. Find overlapping bookings
            const q = query(bookingsRef, 
                where('roomId', '==', selectedRoom.id),
                where('status', 'in', ['CONFIRMED', 'LOCKED']),
                where('checkOut', '>', Timestamp.fromDate(dates.from!))
            );

            const querySnapshot = await getDocs(q);
            const overlappingBookings = querySnapshot.docs.filter(doc => {
                 const booking = doc.data() as Booking;
                 const checkIn = (booking.checkIn as Timestamp).toDate();
                 return isBefore(checkIn, dates.to!);
            }).length;

            // 3. Check availability
            if (overlappingBookings >= roomData.totalRooms) {
                throw new Error("This room is no longer available for the selected dates.");
            }

            // 4. Create locked booking
            const newBookingRef = doc(collection(firestore, 'bookings'));
            const lockExpiry = addMinutes(new Date(), 5);
            const newBooking: Booking = {
                hotelId: hotel.id,
                roomId: selectedRoom.id,
                roomType: selectedRoom.type,
                userId: user ? user.uid : 'guest',
                checkIn: Timestamp.fromDate(dates.from!),
                checkOut: Timestamp.fromDate(dates.to!),
                guests: selectedRoom.capacity,
                totalPrice: totalAmount,
                customerName: finalCustomerName,
                customerEmail: finalCustomerEmail,
                status: 'LOCKED',
                expiresAt: Timestamp.fromDate(lockExpiry),
                createdAt: serverTimestamp() as Timestamp,
            };
            transaction.set(newBookingRef, newBooking);
            return newBookingRef.id;
        });

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Booking Failed',
            description: error.message || 'Could not lock the room for booking.',
        });
        setIsProcessing(false);
        return;
    }

    if (!lockedBookingId) {
        setIsProcessing(false);
        return;
    }
    const finalLockedBookingId = lockedBookingId;

    // 5. Proceed to Payment
    const orderResponse = await createRazorpayOrder(totalAmount, `booking_${finalLockedBookingId}`);

    const cleanupLock = async () => {
        const bookingRef = doc(firestore, 'bookings', finalLockedBookingId);
        const batch = writeBatch(firestore);
        batch.delete(bookingRef);
        await batch.commit();
    };

    if (!orderResponse.success || !orderResponse.order) {
        toast({
            variant: 'destructive',
            title: 'Payment Error',
            description: orderResponse.error || 'Could not initialize payment.',
        });
        await cleanupLock();
        setIsProcessing(false);
        return;
    }
    
    const { order } = orderResponse;
    
    const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Uttarakhand Getaways',
        description: `Booking for ${selectedRoom.type} at ${hotel.name}`,
        image: '/logo-icon.png',
        order_id: order.id,
        handler: async (response: any) => {
            const bookingRef = doc(firestore, 'bookings', finalLockedBookingId);
            const batch = writeBatch(firestore);
            batch.update(bookingRef, { status: 'CONFIRMED', expiresAt: null });
            await batch.commit();

            await revalidateAdminOnBooking();

            toast({
                title: 'Payment Successful!',
                description: `Your booking at ${hotel.name} is confirmed.`,
            });
            
            router.push(`/booking/success/${finalLockedBookingId}`);
        },
        prefill: {
            name: finalCustomerName,
            email: finalCustomerEmail,
        },
        modal: {
            ondismiss: async () => {
                await cleanupLock();
                toast({
                    variant: 'destructive',
                    title: 'Payment Canceled',
                    description: 'Your payment was canceled. The room lock has been released.',
                });
                setIsProcessing(false);
            }
        }
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

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
                onClick={() => handleRoomSelect(room)}
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
