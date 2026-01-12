'use client';

import { useState } from 'react';
import type { Hotel, Room } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PaymentDialog } from './PaymentDialog';
import { addDays, differenceInDays, format } from 'date-fns';

export function RoomBookingCard({ hotel }: { hotel: Hotel }) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Mock dates for now
  const checkInDate = new Date();
  const checkOutDate = addDays(new Date(), 2);
  const numberOfNights = differenceInDays(checkOutDate, checkInDate);

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleBookNow = () => {
    if (selectedRoom) {
      setIsPaymentDialogOpen(true);
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false);
    setSelectedRoom(null);
  };

  return (
    <>
      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Select a Room
          </CardTitle>
          <CardDescription>
            Prices for{' '}
            <span className="font-semibold text-foreground">
              {format(checkInDate, 'LLL dd')} - {format(checkOutDate, 'LLL dd')}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hotel.rooms.map((room) => (
            <Card
              key={room.id}
              className={cn(
                'cursor-pointer p-4 transition-all hover:shadow-md',
                selectedRoom?.id === room.id && 'ring-2 ring-primary'
              )}
              onClick={() => handleRoomSelect(room)}
            >
              <div className="flex flex-col gap-2 md:flex-row md:justify-between">
                <div>
                  <h4 className="font-semibold">{room.type} Room</h4>
                  <p className="text-sm text-muted-foreground">
                    Fits up to {room.capacity} guests
                  </p>
                  <p className="mt-2 text-sm font-bold text-primary">
                    ₹{room.price.toLocaleString()}
                    <span className="font-normal text-muted-foreground">
                      /night
                    </span>
                  </p>
                </div>
                {selectedRoom?.id === room.id && (
                   <div className="mt-4 md:mt-0 md:flex md:items-center">
                    <Button onClick={handleBookNow} className="w-full md:w-auto">
                      Book Now
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
           {selectedRoom && (
            <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                    <p>₹{selectedRoom.price.toLocaleString()} x {numberOfNights} nights</p>
                    <p>₹{(selectedRoom.price * numberOfNights).toLocaleString()}</p>
                </div>
                 <div className="flex justify-between text-sm mt-1">
                    <p>Taxes & Fees</p>
                    <p>₹{((selectedRoom.price * numberOfNights) * 0.18).toLocaleString()}</p>
                </div>
                 <div className="flex justify-between text-lg font-bold mt-2 border-t pt-2">
                    <p>Total</p>
                    <p>₹{(selectedRoom.price * numberOfNights * 1.18).toLocaleString()}</p>
                </div>
            </div>
           )}
        </CardContent>
      </Card>
      {selectedRoom && (
        <PaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => setIsPaymentDialogOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
          hotel={hotel}
          room={selectedRoom}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          totalAmount={selectedRoom.price * numberOfNights * 1.18}
        />
      )}
    </>
  );
}
