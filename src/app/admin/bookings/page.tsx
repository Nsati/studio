'use client';
import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collectionGroup } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function BookingRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-20" /></TableCell>
        </TableRow>
    )
}

export default function BookingsPage() {
    const firestore = useFirestore();

    const bookingsQuery = useMemo(() => {
        if (!firestore) return null;
        // This is a collection group query. It fetches documents from all 'bookings'
        // subcollections across the entire database.
        return collectionGroup(firestore, 'bookings');
    }, [firestore]);

    const { data: bookingsData, isLoading } = useCollection<Booking>(bookingsQuery);
    
    const bookings = useMemo(() => {
        if (!bookingsData) return null;
        // Sort bookings by creation date on the client-side
        return bookingsData.sort((a, b) => {
             const dateA = (a.createdAt as any).toDate ? (a.createdAt as any).toDate() : new Date(a.createdAt);
             const dateB = (b.createdAt as any).toDate ? (b.createdAt as any).toDate() : new Date(b.createdAt);
             return dateB.getTime() - dateA.getTime();
        });
    }, [bookingsData]);


  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Booking Management</h1>
       <Card>
        <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>This is a live list of all bookings made across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hotel ID</TableHead>
                        <TableHead className="text-right">Total Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <>
                            <BookingRowSkeleton />
                            <BookingRowSkeleton />
                            <BookingRowSkeleton />
                        </>
                    )}
                    {bookings && bookings.map(booking => {
                        const checkIn = (booking.checkIn as any).toDate ? (booking.checkIn as any).toDate() : new Date(booking.checkIn);
                        const checkOut = (booking.checkOut as any).toDate ? (booking.checkOut as any).toDate() : new Date(booking.checkOut);
                        return (
                            <TableRow key={booking.id}>
                                <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{booking.customerName}</div>
                                    <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
                                </TableCell>
                                <TableCell>
                                    {format(checkIn, 'MMM dd')} - {format(checkOut, 'MMM dd, yyyy')}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'destructive'} className="capitalize">
                                        {booking.status.toLowerCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{booking.hotelId}</TableCell>
                                <TableCell className="text-right font-medium">
                                    {booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            {!isLoading && bookings?.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    No bookings found yet.
                </div>
            )}
        </CardContent>
       </Card>
    </div>
  );
}
