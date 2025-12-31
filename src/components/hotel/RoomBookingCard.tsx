
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Hotel } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function RoomBookingCard({ hotel }: { hotel: Hotel }) {
    const router = useRouter();
    const { toast } = useToast();
    const [bookingRoomId, setBookingRoomId] = useState<string | null>(null);

    const handleBookNow = (roomId: string) => {
        setBookingRoomId(roomId);

        toast({
            title: 'Processing Booking...',
            description: 'Please wait while we confirm your room. You will be redirected shortly.',
        });

        // Simulate a booking process with payment
        setTimeout(() => {
            // In a real app, this would be the result of a successful payment
            // and booking creation in the backend. We use a sample ID for demonstration.
            const successfulBookingId = 'b1';
            
            router.push(`/booking/success?bookingId=${successfulBookingId}`);
            
            setBookingRoomId(null);
        }, 2000); // Simulate network and payment processing delay
    };

    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Rooms & Availability</CardTitle>
                <CardDescription>Select a room to proceed with your booking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {hotel.rooms.map((room) => (
                    <Card key={room.id} className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                            <div>
                                <h4 className="font-semibold">{room.type} Room</h4>
                                <p className="text-sm text-muted-foreground">Fits up to {room.capacity} guests</p>
                                <p className="text-sm mt-2 font-bold text-primary">₹{room.price.toLocaleString()}<span className="font-normal text-muted-foreground">/night</span></p>
                            </div>
                            <Button 
                                onClick={() => handleBookNow(room.id)} 
                                disabled={!!bookingRoomId}
                                className="w-full sm:w-auto shrink-0"
                            >
                                {bookingRoomId === room.id ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Book Now'
                                )}
                            </Button>
                        </div>
                    </Card>
                ))}
            </CardContent>
        </Card>
    );
}
