
'use client';

import React, { useMemo } from 'react';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Booking, Hotel } from '@/lib/types';
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
import { Skeleton } from '../ui/skeleton';

function BookingRow({ booking }: { booking: Booking }) {
    const firestore = useFirestore();
    const hotelRef = useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'hotels', booking.hotelId);
    }, [firestore, booking.hotelId]);

    const { data: hotel, isLoading } = useDoc<Hotel>(hotelRef);

    const getStatusVariant = (status: 'CONFIRMED' | 'LOCKED' | 'CANCELLED') => {
        switch (status) {
            case 'CONFIRMED': return 'default';
            case 'LOCKED': return 'secondary';
            case 'CANCELLED': return 'destructive';
            default: return 'outline';
        }
    }

    return (
        <TableRow>
            <TableCell className="font-medium">
                {isLoading ? <Skeleton className="h-5 w-24" /> : hotel?.name || 'Unknown Hotel'}
            </TableCell>
            <TableCell>
                <div className="font-medium">{booking.customerName}</div>
                <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
            </TableCell>
            <TableCell>
                {format((booking.checkIn as any).toDate(), 'LLL dd, y')} - {format((booking.checkOut as any).toDate(), 'LLL dd, y')}
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
}


export function BookingList() {
    const firestore = useFirestore();

    const bookingsQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'bookings');
    }, [firestore]);

    const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

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
                        {isLoading && Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            </TableRow>
                        ))}
                        {bookings?.map((booking) => (
                           <BookingRow key={booking.id} booking={booking} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
