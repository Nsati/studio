
'use client';
import { useMemo, useState, useEffect } from 'react';
import { useUser, type WithId } from '@/firebase';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { normalizeTimestamp } from '@/lib/firestore-utils';
import { getAdminAllBookings, adminCancelBooking, type SerializableBooking } from './actions';

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
    const { toast } = useToast();
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancel = async () => {
        setIsCancelling(true);
        const result = await adminCancelBooking(booking.userId, booking.id);

        if (result.success) {
            toast({
                title: 'Booking Cancelled',
                description: `Booking ID ${booking.id} has been successfully cancelled.`,
            });
            onBookingCancelled();
        } else {
             toast({
                variant: "destructive",
                title: "Cancellation Failed",
                description: result.message,
            });
        }
        setIsCancelling(false);
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
                // The data is already sorted by date from the server action
                setBookings(data);
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
            <CardDescription>A list of the 100 most recent bookings. Refresh the page for the latest updates.</CardDescription>
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
