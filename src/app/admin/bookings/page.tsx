'use client';
import { useMemo, useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collectionGroup, doc, runTransaction, increment } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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
import { Loader2, Trash2 } from 'lucide-react';

function BookingRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-9 w-9" /></TableCell>
        </TableRow>
    )
}

function DeleteBookingAction({ booking }: { booking: Booking }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!firestore || !booking.id) return;

        setIsDeleting(true);
        const bookingRef = doc(firestore, 'users', booking.userId, 'bookings', booking.id);
        const roomRef = doc(firestore, 'hotels', booking.hotelId, 'rooms', booking.roomId);

        try {
            await runTransaction(firestore, async (transaction) => {
                const bookingDoc = await transaction.get(bookingRef);
                if (!bookingDoc.exists()) {
                    // Already deleted, do nothing.
                    return;
                }
                
                const bookingData = bookingDoc.data() as Booking;

                // Increment room count only if booking was confirmed and not cancelled
                if (bookingData.status === 'CONFIRMED') {
                    const roomDoc = await transaction.get(roomRef);
                    if (roomDoc.exists()) {
                        transaction.update(roomRef, { availableRooms: increment(1) });
                    }
                }
                
                // Finally, delete the booking
                transaction.delete(bookingRef);
            });

            toast({
                title: 'Booking Deleted',
                description: `Booking ID ${booking.id} has been successfully deleted.`,
            });

        } catch (error: any) {
            console.error("Deletion failed:", error);
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: error.message || "Could not delete the booking. Please check Firestore rules and transaction logic.",
            });
        } finally {
            setIsDeleting(false);
        }
    };


    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isDeleting} aria-label="Delete booking">
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the booking record for {booking.customerName}.
                        If the booking was confirmed, the room will be added back to the inventory.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Yes, delete booking'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
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
                                <TableCell>
                                    {booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DeleteBookingAction booking={booking} />
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
