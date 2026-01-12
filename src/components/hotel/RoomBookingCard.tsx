'use client';

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
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Rooms & Availability
        </CardTitle>
        <CardDescription>
          Details about the rooms available in this hotel.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hotel.rooms.map((room) => (
          <Card key={room.id} className="p-4">
            <div className="flex flex-col gap-2">
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
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
