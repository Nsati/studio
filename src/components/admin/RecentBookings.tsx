
'use client';
import type { Booking } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { WithId } from '@/firebase';

export default function RecentBookings({ bookings }: { bookings: WithId<Booking>[] | null }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    {bookings && bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center">
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{booking.customerName}</p>
                                <p className="text-sm text-muted-foreground">{booking.customerEmail}</p>
                            </div>
                            <div className="ml-auto font-medium">{booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                        </div>
                    ))}
                    {(!bookings || bookings.length === 0) && (
                        <p className="text-sm text-muted-foreground">No recent bookings.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
