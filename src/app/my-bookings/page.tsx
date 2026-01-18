'use client';

import React, { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import type { Booking, Hotel } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar, Hotel as HotelIcon, Home, Users, Loader2, CreditCard, Hash, Download, FileText, Ban } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function BookingItemSkeleton() {
    return (
        <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-7 w-24" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative h-48 md:h-full">
                         <Skeleton className="h-full w-full rounded-md"/>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-2 gap-6">
                         <div className="space-y-4">
                             <Skeleton className="h-5 w-24"/>
                             <div className="space-y-3">
                                <Skeleton className="h-10 w-full"/>
                                <Skeleton className="h-10 w-full"/>
                                <Skeleton className="h-10 w-full"/>
                             </div>
                         </div>
                         <div className="space-y-4">
                            <Skeleton className="h-5 w-24"/>
                             <div className="space-y-3">
                                <Skeleton className="h-10 w-full"/>
                                <Skeleton className="h-10 w-full"/>
                             </div>
                         </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-wrap justify-end gap-2">
                <Skeleton className="h-9 w-32"/>
                <Skeleton className="h-9 w-36"/>
            </CardFooter>
        </Card>
    );
}


function BookingItem({ booking }: { booking: Booking }) {
    const firestore = useFirestore();

    const hotelRef = useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'hotels', booking.hotelId);
    }, [firestore, booking.hotelId]);

    const { data: hotel, isLoading } = useDoc<Hotel>(hotelRef);


    if (isLoading) {
        return <BookingItemSkeleton />;
    }

    if (!hotel) {
        return (
            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle>Booking for an unknown hotel</CardTitle>
                    <CardDescription>
                        Booking ID: <span className="font-mono">{booking.id}</span>
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }
    
    const hotelImage = PlaceHolderImages.find(
        (img) => img.id === hotel.images[0]
    );

    const checkInDate = (booking.checkIn as any).toDate ? (booking.checkIn as any).toDate() : new Date(booking.checkIn);
    const checkOutDate = (booking.checkOut as any).toDate ? (booking.checkOut as any).toDate() : new Date(booking.checkOut);

    return (
        <Card key={booking.id} className="shadow-md transition-shadow hover:shadow-lg">
             <CardHeader className="flex flex-row items-start justify-between p-4 md:p-6">
                <div>
                    <CardTitle className="font-headline text-2xl hover:text-primary">
                        <Link href={`/hotels/${hotel.id}`}>{hotel.name}</Link>
                    </CardTitle>
                    <CardDescription className="pt-1">{hotel.city}</CardDescription>
                </div>
                <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'destructive'} className="capitalize">
                    {booking.status?.toLowerCase()}
                </Badge>
            </CardHeader>

            <CardContent className="p-4 md:p-6 pt-0">
                <Separator className="mb-6"/>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative h-48 md:h-full rounded-md overflow-hidden">
                         {hotelImage && (
                            <Image
                                src={hotelImage.imageUrl}
                                alt={hotel.name}
                                data-ai-hint={hotelImage.imageHint}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                        {/* Booking Summary */}
                        <div>
                             <h4 className="font-semibold text-base mb-3">Booking Summary</h4>
                             <div className="space-y-3 text-muted-foreground">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-px" />
                                    <div>
                                        <p className="text-foreground font-medium">{format(checkInDate, 'EEE, LLL dd, yyyy')}</p>
                                        <p>to {format(checkOutDate, 'EEE, LLL dd, yyyy')}</p>
                                    </div>
                                </div>
                                 <div className="flex items-center gap-3">
                                    <HotelIcon className="h-5 w-5 text-primary flex-shrink-0" />
                                    <span>{booking.roomType} Room</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-primary flex-shrink-0" />
                                    <span>{booking.guests} Guests</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Hash className="h-5 w-5 text-primary flex-shrink-0" />
                                    <span className="font-mono text-xs">{booking.id}</span>
                                </div>
                             </div>
                        </div>

                         {/* Payment Details */}
                        <div>
                            <h4 className="font-semibold text-base mb-3">Payment Details</h4>
                             <div className="space-y-3 text-muted-foreground">
                                <div className="flex items-start gap-3">
                                    <CreditCard className="h-5 w-5 text-primary flex-shrink-0 mt-px" />
                                    <div>
                                        <p className="text-foreground font-bold text-lg">{booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</p>
                                        <p>Paid via Razorpay</p>
                                    </div>
                                </div>
                                {booking.razorpayPaymentId && (
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                                        <p>Txn ID: <span className="font-mono text-xs">{booking.razorpayPaymentId}</span></p>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                </div>

            </CardContent>

             <CardFooter className="bg-muted/50 p-4 flex-wrap justify-end gap-2">
                <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Download Invoice</Button>
                {booking.status === 'CONFIRMED' && (
                     <Button variant="destructive"><Ban className="mr-2 h-4 w-4" /> Cancel Booking</Button>
                )}
            </CardFooter>
        </Card>
    )
}


export default function MyBookingsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);
  
  const bookingsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'bookings');
  }, [firestore, user]);

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

  const isLoading = isUserLoading || areBookingsLoading;

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
            <h1 className="font-headline text-4xl font-bold">My Bookings</h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Here are all the amazing trips you've planned with us.
            </p>
        </div>

        {bookings?.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed bg-transparent">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">No Bookings Yet</CardTitle>
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
            <div className="space-y-8">
            {bookings?.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
            ))}
            </div>
        )}
        </div>
    </div>
  );
}
