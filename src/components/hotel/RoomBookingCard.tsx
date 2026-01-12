'use client';

import { BedDouble } from 'lucide-react';
import type { Hotel } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export function RoomBookingCard({ hotel }: { hotel: Hotel }) {
  return (
    <>
      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            <BedDouble className="mr-2 inline-block h-6 w-6" />
            Our Rooms
          </CardTitle>
          <CardDescription>
            Contact the hotel directly to make a booking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hotel.rooms.map((room) => (
            <Card key={room.id} className="p-4">
              <div className="flex flex-col gap-2 md:flex-row md:justify-between">
                <div>
                  <h4 className="font-semibold">{room.type} Room</h4>
                  <p className="text-sm text-muted-foreground">
                    Fits up to {room.capacity} guests
                  </p>
                </div>
                <div className="md:text-right">
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
        </CardContent>
      </Card>
    </>
  );
}
