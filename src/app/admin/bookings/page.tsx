'use client';
import { useMemo, useState, useEffect } from 'react';
import { useFirestore, useUser, type WithId } from '@/firebase';
import { doc, runTransaction } from 'firebase/firestore';
import type { Booking, Room } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { normalizeTimestamp } from '@/lib/firestore-utils';
import { getAdminAllBookings, type SerializableBooking } from './actions';

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
import { Loader2, Ban, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle } from '@/components/ui/alert';


function BookingRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-9 w-24" /></TableCell>
        </TableRow>
    )
}

function CancelBookingAction({ booking, onBookingCancelled }: { booking: WithId<SerializableBooking>, onBookingCancelled: () => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isCancelling, setIsCancelling] = useState(false);

    // This action still runs on the client, but it's a targeted write operation on a single
    // booking, which is allowed by security rules for admins, so it's less prone to race conditions.
    const handleCancel = async () => {
        if (!firestore || !booking.id) return;

        setIsCancelling(true);
        const bookingRef = doc(firestore, 'users', booking.userId, 'bookings', booking.id);

        try {
            await runTransaction(firestore, async (transaction) => {
                const bookingDoc = await transaction.get(bookingRef);
                if (!bookingDoc.exists()) {
                    throw new Error("Booking does not exist.");
                }
                
                const bookingData = bookingDoc.data() as Booking;

                if (bookingData.status === 'CANCELLED') {
                    toast({
                        variant: "destructive",
                        title: "Already Cancelled",
                        description: "This booking has already been cancelled.",
                    });
                    return;
                }
                
                if (bookingData.status === 'CONFIRMED') {
                    const roomRef = doc(firestore, 'hotels', booking.hotelId, 'rooms', booking.roomId);
                    const roomDoc = await transaction.get(roomRef);
                    if (roomDoc.exists()) {
                        const roomData = roomDoc.data() as Room;
                        const newAvailableRooms = (roomData.availableRooms ?? 0) + 1;
                         if (newAvailableRooms <= roomData.totalRooms) {
                            transaction.update(roomRef, { availableRooms: newAvailableRooms });
                        }
                    }
                }
                
                transaction.update(bookingRef, { status: 'CANCELLED' });
            });

            toast({
                title: 'Booking Cancelled',
                description: `Booking ID ${booking.id} has been successfully cancelled.`,
            });
            onBookingCancelled();

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
    const { userProfile, isLoading: isUserLoading } = useUser();
    const isAdmin = userProfile?.role === 'admin';

    const [bookings, setBookings] = useState<WithId<SerializableBooking>[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = () => {
        setIsLoading(true);
        setError(null);
        getAdminAllBookings()
            .then(data => {
                const sortedData = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setBookings(sortedData);
            })
            .catch(err => {
                console.error("Failed to fetch admin bookings:", err);
                setError(err.message || "An unknown error occurred.");
                setBookings([]); // Set to empty array on error
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    useEffect(() => {
        if (isAdmin) {
            fetchBookings();
        } else if (!isUserLoading) {
            // If the user is loaded and not an admin, stop loading.
            setIsLoading(false);
            setBookings([]);
        }
    }, [isAdmin, isUserLoading]);


    if (isUserLoading) {
        return (
             <div className="space-y-6">
                <h1 className="font-headline text-3xl font-bold">Booking Management</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>All Bookings</CardTitle>
                        <CardDescription>A list of all bookings made across the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booking ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Hotel</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total Price</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <BookingRowSkeleton />
                                <BookingRowSkeleton />
                                <BookingRowSkeleton />
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        );
    }


  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Booking Management</h1>
       <Card>
        <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>A list of all bookings made across the platform. Refresh the page for the latest updates.</CardDescription>
        </CardHeader>
        <CardContent>
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Fetching Bookings</AlertTitle>
                    <p>{error}</p>
                </Alert>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Hotel</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Status</TableHead>
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
                    {!isLoading && bookings && bookings.map(booking => {
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
                                    <div className="font-medium">{booking.hotelName}</div>
                                    <div className="text-sm text-muted-foreground">{booking.hotelCity}</div>
                                </TableCell>
                                <TableCell>
                                    {checkIn && checkOut && !isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())
                                      ? `${format(checkIn, 'MMM dd')} - ${format(checkOut, 'MMM dd, yyyy')}`
                                      : 'Invalid Dates'
                                    }
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        variant={
                                            booking.status === 'CONFIRMED' ? 'default' : 
                                            booking.status === 'PENDING' ? 'secondary' : 
                                            'destructive'
                                        } 
                                        className="capitalize"
                                    >
                                        {booking.status.toLowerCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <CancelBookingAction booking={booking} onBookingCancelled={fetchBookings} />
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            {!isLoading && bookings?.length === 0 && !error && (
                <div className="text-center text-muted-foreground p-8">
                    No bookings found yet.
                </div>
            )}
        </CardContent>
       </Card>
    </div>
  );
}
