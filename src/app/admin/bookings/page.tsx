
'use client';
import { useMemo, useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, runTransaction, increment, updateDoc, collectionGroup } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { normalizeTimestamp } from '@/lib/firestore-utils';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2, Ban } from 'lucide-react';

function BookingRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-9 w-24" /></TableCell>
        </TableRow>
    )
}

function CancelBookingAction({ booking }: { booking: Booking }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancel = async () => {
        if (!firestore || !booking.id) return;

        setIsCancelling(true);
        const bookingRef = doc(firestore, 'users', booking.userId, 'bookings', booking.id);
        const roomRef = doc(firestore, 'hotels', booking.hotelId, 'rooms', booking.roomId);

        try {
            await runTransaction(firestore, async (transaction) => {
                const bookingDoc = await transaction.get(bookingRef);
                if (!bookingDoc.exists()) {
                    throw new Error("Booking does not exist.");
                }
                
                const bookingData = bookingDoc.data() as Booking;

                if (bookingData.status === 'CANCELLED') {
                    // Already cancelled, do nothing.
                    toast({
                        variant: "destructive",
                        title: "Already Cancelled",
                        description: "This booking has already been cancelled.",
                    });
                    return;
                }
                
                // Increment room count only if booking was confirmed
                if (bookingData.status === 'CONFIRMED') {
                    const roomDoc = await transaction.get(roomRef);
                    if (roomDoc.exists()) {
                        transaction.update(roomRef, { availableRooms: increment(1) });
                    }
                }
                
                // Finally, update the booking status
                transaction.update(bookingRef, { status: 'CANCELLED' });
            });

            toast({
                title: 'Booking Cancelled',
                description: `Booking ID ${booking.id} has been successfully cancelled.`,
            });

        } catch (error: any) {
            console.error("Cancellation failed:", error);
            toast({
                variant: "destructive",
                title: "Cancellation Failed",
                description: error.message || "Could not cancel the booking. Please check Firestore rules and transaction logic.",
            });
        } finally {
            setIsCancelling(false);
        }
    };

    const isCancelled = booking.status === 'CANCELLED';

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={isCancelling || isCancelled}>
                    {isCancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ban className="h-4 w-4 mr-2" />}
                    {isCancelled ? 'Cancelled' : 'Cancel'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will cancel the booking for {booking.customerName}.
                        If the booking was confirmed, the room will be added back to the inventory.
                        Generally, refunds are processed within 5-7 business days. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel} className="bg-destructive hover:bg-destructive/90">
                        {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Yes, cancel booking'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function BookingsPage() {
    const firestore = useFirestore();

    const bookingsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collectionGroup(firestore, 'bookings');
    }, [firestore]);

    const { data: bookingsData, isLoading } = useCollection<Booking>(bookingsQuery);
    
    const bookings = useMemoFirebase(() => {
        if (!bookingsData) return null;
        // Sort bookings by creation date on the client-side
        return bookingsData.sort((a, b) => {
             const dateA = normalizeTimestamp(a.createdAt);
             const dateB = normalizeTimestamp(b.createdAt);
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
                        <TableHead>Total Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
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
                        const checkIn = normalizeTimestamp(booking.checkIn);
                        const checkOut = normalizeTimestamp(booking.checkOut);
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
                                <TableCell>
                                    {booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <CancelBookingAction booking={booking} />
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
