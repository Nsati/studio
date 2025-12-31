import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Booking } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const hotelImage = PlaceHolderImages.find((img) => img.id === booking.hotelImage);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="relative h-48 w-full md:h-full">
            {hotelImage && (
              <Image
                src={hotelImage.imageUrl}
                alt={booking.hotelName}
                data-ai-hint={hotelImage.imageHint}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="md:col-span-2 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="font-headline text-2xl font-bold">{booking.hotelName}</h3>
                    <p className="text-muted-foreground">{booking.hotelCity}</p>
                </div>
                <Badge 
                    className={cn('mt-2 sm:mt-0', {
                        'bg-green-100 text-green-800 border-green-200': booking.status === 'Confirmed',
                        'bg-red-100 text-red-800 border-red-200': booking.status === 'Cancelled',
                        'bg-yellow-100 text-yellow-800 border-yellow-200': booking.status === 'Pending',
                    })}
                    variant="outline"
                >
                    {booking.status}
                </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground"/>
                    <span>{booking.checkIn} to {booking.checkOut}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground"/>
                    <span>{booking.guests} Guests</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground"/>
                    <span>ID: {booking.id}</span>
                </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-xl font-bold">Total: ₹{booking.totalPrice.toLocaleString()}</p>
                {booking.status === 'Confirmed' && (
                    <Button variant="destructive" outline>Cancel Booking</Button>
                )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
