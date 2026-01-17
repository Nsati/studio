
'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, collectionGroup } from 'firebase/firestore';
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

function BookingRow({ booking, hotel }: { booking: Booking, hotel: Hotel | undefined }) {
    const getStatusVariant = (status: 'CONFIRMED' | 'CANCELLED') => {
        switch (status) {
            case 'CONFIRMED': return 'default';
            case 'CANCELLED': return 'destructive';
            default: return 'outline';
        }
    }
    
    const checkInDate = (booking.checkIn as any).toDate ? (booking.checkIn as any).toDate() : booking.checkIn;
    const checkOutDate = (booking.checkOut as any).toDate ? (booking.checkOut as any).toDate() : booking.checkOut;

    return (
        <TableRow>
            <TableCell className="font-medium">
                {hotel?.name || booking.hotelId}
            </TableCell>
            <TableCell>
                <div className="font-medium">{booking.customerName}</div>
                <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
            </TableCell>
            <TableCell>
                {format(checkInDate, 'LLL dd, y')} - {format(checkOutDate, 'LLL dd, y')}
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
        return collectionGroup(firestore, 'bookings');
    }, [firestore]);

    const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);

    const hotelsQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'hotels');
    }, [firestore]);
    const { data: hotels, isLoading: isLoadingHotels } = useCollection<Hotel>(hotelsQuery);
    const isLoading = isLoadingBookings || isLoadingHotels;

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
                        {!isLoading && bookings?.map((booking) => {
                           const hotel = hotels?.find(h => h.id === booking.hotelId);
                           return <BookingRow key={booking.id} booking={booking} hotel={hotel} />
                        })}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
