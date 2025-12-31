'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Hotel, Room } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PaymentDialog } from '@/components/booking/PaymentDialog';

export function RoomBookingCard({ hotel }: { hotel: Hotel }) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleBookNowClick = (room: Room) => {
    setSelectedRoom(room);
    setIsDialogOpen(true);
  };

  const handlePaymentSuccess = (bookingId: string) => {
    setIsDialogOpen(false);
    toast({
      title: 'Payment Successful!',
      description: 'Your booking is confirmed. Redirecting...',
    });
    router.push(`/booking/success?bookingId=${bookingId}`);
  };

  return (
    <>
      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Rooms & Availability
          </CardTitle>
          <CardDescription>
            Select a room to proceed with your booking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hotel.rooms.map((room) => (
            <Card key={room.id} className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                <div>
                  <h4 className="font-semibold">{room.type} Room</h4>
                  <p className="text-sm text-muted-foreground">
                    Fits up to {room.capacity} guests
                  </p>
                  <p className="text-sm mt-2 font-bold text-primary">
                    ₹{room.price.toLocaleString()}
                    <span className="font-normal text-muted-foreground">
                      /night
                    </span>
                  </p>
                </div>
                <Button
                  onClick={() => handleBookNowClick(room)}
                  className="w-full sm:w-auto shrink-0"
                >
                  Book Now
                </Button>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
      <PaymentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        room={selectedRoom}
        hotel={hotel}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
