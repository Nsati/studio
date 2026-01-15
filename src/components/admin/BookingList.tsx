
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
import { Badge } from '../ui/badge';
import { format } from 'date-fns';

export function BookingList() {
    const bookings = getBookings();

    const getStatusVariant = (status: 'CONFIRMED' | 'LOCKED' | 'CANCELLED') => {
        switch (status) {
            case 'CONFIRMED':
                return 'default';
            case 'LOCKED':
                return 'secondary';
            case 'CANCELLED':
                return 'destructive';
            default:
                return 'outline';
        }
    }

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
                            <TableHead>Status</TableHead>
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
                                        <Badge variant={getStatusVariant(booking.status)}>
                                            {booking.status}
                                        </Badge>
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
