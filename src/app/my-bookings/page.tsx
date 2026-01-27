
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirestore, useUser, useCollection, useDoc, useMemoFirebase, type WithId } from '@/firebase';
import type { Booking, Hotel, Room } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Hotel as HotelIcon, Home, Loader2, Download, Ban, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { normalizeTimestamp } from '@/lib/firestore-utils';
import { cancelBookingAction } from './actions';


function BookingItemSkeleton() {
    return (
        <Card className="overflow-hidden shadow-md">
            <div className="flex flex-col md:flex-row">
                <div className="relative h-48 w-full md:w-1/3 md:h-auto flex-shrink-0">
                    <Skeleton className="h-full w-full"/>
                </div>
                <div className="flex flex-col flex-grow justify-between p-4 sm:p-6">
                    <div>
                        <Skeleton className="h-8 w-3/4 mb-2" />
                        <Skeleton className="h-5 w-1/4 mb-4" />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-3/5" />
                            <Skeleton className="h-5 w-2/5" />
                            <Skeleton className="h-5 w-full sm:col-span-2" />
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-6 w-1/2" />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-6">
                        <Skeleton className="h-9 w-28" />
                        <Skeleton className="h-9 w-36" />
                        <Skeleton className="h-9 w-36" />
                    </div>
                </div>
            </div>
        </Card>
    );
}


function BookingItem({ booking }: { booking: WithId<Booking> }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const [isCancelling, setIsCancelling] = useState(false);

    // Fetch hotel data primarily for the image, as other details are on the booking.
    const hotelRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'hotels', booking.hotelId);
    }, [firestore, booking.hotelId]);

    const { data: hotel, isLoading } = useDoc<Hotel>(hotelRef);

    const handleCancelBooking = async () => {
        if (!user || !booking.id) return;

        setIsCancelling(true);

        const result = await cancelBookingAction(user.uid, booking.id);
        
        if (result.success) {
            toast({
                title: "Booking Cancelled",
                description: "Your booking has been successfully cancelled. Any applicable refund will be processed.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Cancellation Failed",
                description: result.message,
            });
        }

        setIsCancelling(false);
    };


    if (isLoading) {
        return <BookingItemSkeleton />;
    }
    
    const hotelImage = hotel ? PlaceHolderImages.find((img) => img.id === hotel.images[0]) : null;

    const checkInDate = normalizeTimestamp(booking.checkIn);
    const checkOutDate = normalizeTimestamp(booking.checkOut);
    const isCancellable = booking.status === 'CONFIRMED' || booking.status === 'PENDING';
    
    const getBadge = () => {
        switch (booking.status) {
            case 'CONFIRMED':
                return <Badge variant="default"><CheckCircle className="mr-1.5 h-4 w-4" />Confirmed</Badge>;
            case 'PENDING':
                return <Badge variant="secondary"><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />Pending</Badge>;
            case 'CANCELLED':
                 return <Badge variant="destructive"><XCircle className="mr-1.5 h-4 w-4" />Cancelled</Badge>;
            case 'FAILED':
                return <Badge variant="destructive"><AlertTriangle className="mr-1.5 h-4 w-4" />Failed</Badge>;
            default:
                return <Badge variant="secondary">{booking.status}</Badge>;
        }
    }


    return (
        <Card key={booking.id} className="overflow-hidden shadow-md transition-shadow hover:shadow-lg">
            <div className="flex flex-col md:flex-row">
                {/* Column 1: Image */}
                <div className="relative w-full aspect-video md:w-1/3 md:aspect-auto flex-shrink-0">
                    {hotelImage && hotel ? (
                        <Image
                            src={hotelImage.imageUrl}
                            alt={hotel.name}
                            data-ai-hint={hotelImage.imageHint}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                            <HotelIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* Column 2: Details */}
                <div className="flex flex-col flex-grow justify-between p-4 sm:p-6">
                    <div>
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="font-headline text-xl sm:text-2xl font-bold hover:text-primary">
                                    <Link href={`/hotels/${booking.hotelId}`}>{booking.hotelName}</Link>
                                </h3>
                                <p className="text-muted-foreground mb-4">{booking.hotelCity}</p>
                             </div>
                             {getBadge()}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <p><span className="font-semibold text-foreground">Check-in:</span> {format(checkInDate, 'dd MMM yyyy')}</p>
                            <p><span className="font-semibold text-foreground">Check-out:</span> {format(checkOutDate, 'dd MMM yyyy')}</p>
                            <p><span className="font-semibold text-foreground">Room:</span> {booking.roomType}</p>
                            <p><span className="font-semibold text-foreground">Guests:</span> {booking.guests}</p>
                            <p className="col-span-1 sm:col-span-2"><span className="font-semibold text-foreground">Booking ID:</span> <span className="font-mono text-xs">{booking.id}</span></p>
                            <p><span className="font-semibold text-foreground">Amount Paid:</span> <span className="font-bold text-foreground">{booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span></p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 mt-6">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/hotels/${booking.hotelId}`}>View Hotel</Link>
                        </Button>
                        <Button variant="outline" size="sm" disabled={booking.status !== 'CONFIRMED'} onClick={() => toast({ title: "Feature Coming Soon", description: "Invoice download will be available shortly for confirmed bookings."})}>
                            <Download className="mr-2 h-4 w-4" /> Download Invoice
                        </Button>
                        {isCancellable && (
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" disabled={isCancelling}>
                                        {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
                                        {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently cancel your booking for {booking.hotelName}. 
                                            Any applicable refund will be processed within 5-7 business days.
                                            This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>No, keep booking</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleCancelBooking} className="bg-destructive hover:bg-destructive/90">
                                            Yes, cancel booking
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                         {booking.status === 'FAILED' && (
                            <p className="text-xs text-destructive">This booking failed. A refund should be processed automatically.</p>
                         )}
                    </div>
                </div>
            </div>
        </Card>
    );
}


export default function MyBookingsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/my-bookings');
    }
  }, [user, isUserLoading, router]);
  
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'bookings');
  }, [firestore, user]);

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);
  
  const { confirmed, cancelled, pending, failed } = useMemo(() => {
    if (!bookings) return { confirmed: [], cancelled: [], pending: [], failed: [] };
    
    const sorted = [...bookings].sort((a,b) => {
        const dateA = normalizeTimestamp(a.createdAt);
        const dateB = normalizeTimestamp(b.createdAt);
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateB.getTime() - dateA.getTime();
    });

    return {
        confirmed: sorted.filter(b => b.status === 'CONFIRMED'),
        cancelled: sorted.filter(b => b.status === 'CANCELLED'),
        pending: sorted.filter(b => b.status === 'PENDING'),
        failed: sorted.filter(b => b.status === 'FAILED'),
    };
  }, [bookings]);

  const isLoading = isUserLoading || areBookingsLoading;
  const totalBookings = bookings?.length ?? 0;

  if (isLoading || !user) {
    return (
        <div className="container mx-auto max-w-5xl py-12 px-4 md:px-6">
            <div className="mb-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-5 w-1/2 mt-4" />
            </div>
            <div className="space-y-8">
                <BookingItemSkeleton />
                <BookingItemSkeleton />
            </div>
        </div>
    );
  }

  return (
    <div className="bg-muted/40 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-5xl py-12 px-4 md:px-6">
        <div className="mb-8">
            <h1 className="font-headline text-3xl font-bold md:text-4xl">My Bookings</h1>
            <p className="mt-2 text-base text-muted-foreground md:text-lg">
            Here are all the amazing trips you've planned with us.
            </p>
        </div>

        {totalBookings === 0 ? (
            <Card className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed bg-transparent">
            <CardHeader>
                <CardTitle className="font-headline">No Bookings Yet</CardTitle>
                <CardDescription>
                You haven't booked any stays with us. Let's find your next
                adventure!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                <Link href="/search">
                    <Home className="mr-2 h-4 w-4" />
                    Explore Hotels
                </Link>
                </Button>
            </CardContent>
            </Card>
        ) : (
            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="upcoming">Upcoming ({confirmed.length})</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
                    <TabsTrigger value="failed">Failed ({failed.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming">
                    <div className="space-y-8 mt-8">
                        {confirmed.length > 0 ? (
                            confirmed.map(booking => <BookingItem key={booking.id} booking={booking} />)
                        ) : (
                           <div className="text-center text-muted-foreground py-20">
                             <p>You have no upcoming bookings.</p>
                           </div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="pending">
                     <div className="space-y-8 mt-8">
                        {pending.length > 0 ? (
                            pending.map(booking => <BookingItem key={booking.id} booking={booking} />)
                        ) : (
                           <div className="text-center text-muted-foreground py-20">
                             <p>You have no bookings pending payment.</p>
                           </div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="cancelled">
                     <div className="space-y-8 mt-8">
                        {cancelled.length > 0 ? (
                            cancelled.map(booking => <BookingItem key={booking.id} booking={booking} />)
                        ) : (
                           <div className="text-center text-muted-foreground py-20">
                             <p>You have no cancelled bookings.</p>
                           </div>
                        )}
                    </div>
                </TabsContent>
                 <TabsContent value="failed">
                     <div className="space-y-8 mt-8">
                        {failed.length > 0 ? (
                            failed.map(booking => <BookingItem key={booking.id} booking={booking} />)
                        ) : (
                           <div className="text-center text-muted-foreground py-20">
                             <p>You have no failed bookings.</p>
                           </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        )}
        </div>
    </div>
  );
}
