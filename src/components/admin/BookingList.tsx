
'use client';

import { getBookings, getHotelById } from '@/lib/data';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card } from '../ui/card';
import { format } from 'date-fns';

export function BookingList() {
    const bookings = getBookings();

    return (
        <Card>
            <div className="p-6">
                <h2 className="text-2xl font-bold tracking-tight">Booking Management</h2>
                <p className="text-muted-foreground">View all bookings made on the platform.</p>
            </div>
            <div className="border-t">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Hotel</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Total Paid</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map((booking) => {
                            const hotel = getHotelById(booking.hotelId);
                            return (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">{hotel?.name || 'Unknown Hotel'}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{booking.customerName}</div>
                                        <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(booking.checkIn), 'LLL dd, y')} - {format(new Date(booking.checkOut), 'LLL dd, y')}
                                    </TableCell>
                                    <TableCell>
                                        ₹{booking.totalPrice.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
