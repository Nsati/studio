
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useFirestore, useUser, useCollection, useDoc, useMemoFirebase, type WithId } from '@/firebase';
import type { Booking, Hotel } from '@/lib/types';
import {
  Card,
} from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { format, isValid } from 'date-fns';
import { 
  Hotel as HotelIcon, 
  Calendar, 
  Users, 
  CreditCard, 
  ArrowRight, 
  Download, 
  MapPin, 
  Compass,
  CheckCircle2,
  Clock,
  XCircle,
  Inbox
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { normalizeTimestamp } from '@/lib/firestore-utils';

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'CONFIRMED':
      return (
        <Badge className="bg-green-100 text-green-700 border-0 hover:bg-green-100 font-black uppercase text-[10px] px-4 py-1.5 tracking-widest shadow-sm flex items-center gap-1.5 rounded-full">
          <CheckCircle2 className="h-3 w-3" /> Confirmed
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="destructive" className="font-black uppercase text-[10px] px-4 py-1.5 tracking-widest border-0 shadow-sm flex items-center gap-1.5 rounded-full">
          <XCircle className="h-3 w-3" /> Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-black uppercase text-[10px] px-4 py-1.5 tracking-widest shadow-sm flex items-center gap-1.5 rounded-full">
          <Clock className="h-3 w-3" /> Pending
        </Badge>
      );
  }
}

function BookingItemSkeleton() {
    return (
        <Card className="overflow-hidden rounded-[2rem] border-black/5 shadow-apple-deep">
            <div className="flex flex-col md:flex-row">
                <div className="relative h-48 md:h-64 w-full md:w-2/5 flex-shrink-0">
                    <Skeleton className="h-full w-full"/>
                </div>
                <div className="flex flex-col flex-grow justify-between p-6 md:p-10">
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-3/4 rounded-full" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function BookingItem({ booking }: { booking: WithId<Booking> }) {
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const hotelRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'hotels', booking.hotelId);
  }, [firestore, booking.hotelId]);

  const { data: hotel, isLoading } = useDoc<Hotel>(hotelRef);
  
  if (isLoading || !mounted) {
    return <BookingItemSkeleton />;
  }

  const hotelImage = hotel ? PlaceHolderImages.find((img) => img.id === hotel.images[0])?.imageUrl || hotel.images[0] : null;

  const checkInDate = normalizeTimestamp(booking.checkIn);
  const checkOutDate = normalizeTimestamp(booking.checkOut);
  
  return (
    <Card className="group overflow-hidden rounded-[2.5rem] border-black/5 bg-white shadow-apple-deep transition-all duration-700 hover:-translate-y-1">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full aspect-[16/10] md:w-2/5 md:aspect-auto flex-shrink-0 overflow-hidden">
          {hotelImage ? (
            <Image
              src={hotelImage}
              alt={booking.hotelName}
              fill
              className="object-cover transition-transform duration-2000 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <HotelIcon className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />
          <div className="absolute top-6 left-6">
             <StatusBadge status={booking.status} />
          </div>
        </div>

        <div className="flex flex-col flex-grow justify-between p-6 md:p-12">
          <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                    <MapPin className="h-3 w-3" /> {booking.hotelCity}
                </div>
                <h3 className="text-2xl md:text-4xl font-black tracking-tighter leading-tight hover:text-primary transition-colors cursor-pointer">
                    <Link href={`/hotels/${booking.hotelId}`}>{booking.hotelName}</Link>
                </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stay Dates</p>
                    <div className="flex items-center gap-3 font-bold text-sm md:text-base">
                        <Calendar className="h-4 w-4 text-primary" />
                        {isValid(checkInDate) ? format(checkInDate, 'dd MMM') : 'N/A'} — {isValid(checkOutDate) ? format(checkOutDate, 'dd MMM yyyy') : 'N/A'}
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reservation</p>
                    <div className="flex items-center gap-3 font-bold text-sm md:text-base">
                        <Users className="h-4 w-4 text-primary" />
                        {booking.guests} Guest(s) • {booking.roomType}
                    </div>
                </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-8">
            <Button variant="outline" size="lg" className="flex-1 sm:flex-none rounded-full h-12 px-8 border-black/10 font-bold hover:bg-muted shadow-apple text-xs" asChild>
              <Link href={`/hotels/${booking.hotelId}`}>Hotel Details</Link>
            </Button>
            <Button variant="ghost" size="lg" className="flex-1 sm:flex-none rounded-full h-12 px-8 font-black uppercase text-[9px] tracking-widest text-muted-foreground" disabled>
              <Download className="mr-2 h-4 w-4" /> E-Voucher
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ title, description, showButton = true }: { title: string, description: string, showButton?: boolean }) {
    return (
        <div className="py-12 md:py-24 text-center">
            <div className="space-y-6 max-w-lg mx-auto px-4">
                <div className="mx-auto h-20 w-24 bg-muted/50 rounded-full flex items-center justify-center">
                    <Inbox className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div className="space-y-3">
                    <h2 className="text-2xl font-black tracking-tight">{title}</h2>
                    <p className="text-muted-foreground text-base font-medium leading-relaxed">{description}</p>
                </div>
                {showButton && (
                    <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-10 h-14 bg-primary text-white font-black shadow-xl">
                        <Link href="/search">
                            Explore The Collection <ArrowRight className="ml-3 h-5 w-5" />
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    )
}


export default function MyBookingsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/my-bookings');
    }
  }, [user, isUserLoading, router]);
  
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'bookings');
  }, [firestore, user]);

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

  const stats = useMemo(() => {
    if (!bookings) return { confirmed: [], pending: [], cancelled: [] };
    return {
        confirmed: bookings.filter(b => b.status === 'CONFIRMED'),
        pending: bookings.filter(b => b.status === 'PENDING'),
        cancelled: bookings.filter(b => b.status === 'CANCELLED')
    };
  }, [bookings]);

  const isLoading = isUserLoading || areBookingsLoading || !mounted;

  if (isLoading || !user) {
    return (
        <div className="container mx-auto max-w-6xl py-12 px-4 md:px-6 space-y-8">
            <Skeleton className="h-12 w-1/3 rounded-full" />
            <BookingItemSkeleton />
        </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
        <div className="container mx-auto max-w-6xl py-12 md:py-24 px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        <Compass className="h-4 w-4" /> Concierge Dashboard
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">Your Himalayan <br className="hidden md:block"/><span className="italic font-heading font-medium text-primary">Collection</span></h1>
                </div>
            </div>

            <Tabs defaultValue="confirmed" className="space-y-8">
                <div className="flex justify-center overflow-x-auto pb-4 scrollbar-hide">
                    <TabsList className="h-14 p-1 bg-muted/30 rounded-full border border-black/5 backdrop-blur-sm">
                        <TabsTrigger value="confirmed" className="rounded-full px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-apple font-black text-xs uppercase tracking-widest">
                            Confirmed <span className="ml-2 opacity-40">{stats.confirmed.length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-full px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-apple font-black text-xs uppercase tracking-widest">
                            Pending <span className="ml-2 opacity-40">{stats.pending.length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="cancelled" className="rounded-full px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-apple font-black text-xs uppercase tracking-widest">
                            Cancelled <span className="ml-2 opacity-40">{stats.cancelled.length}</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="confirmed" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {stats.confirmed.length > 0 ? (
                        stats.confirmed.map(booking => <BookingItem key={booking.id} booking={booking} />)
                    ) : (
                        <EmptyState title="No Active Journeys" description="You haven't scheduled any Himalayan retreats yet." />
                    )}
                </TabsContent>

                <TabsContent value="pending" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {stats.pending.length > 0 ? (
                        stats.pending.map(booking => <BookingItem key={booking.id} booking={booking} />)
                    ) : (
                        <EmptyState title="Clear Skies" description="No pending reservations found." showButton={false} />
                    )}
                </TabsContent>

                <TabsContent value="cancelled" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {stats.cancelled.length > 0 ? (
                        stats.cancelled.map(booking => <BookingItem key={booking.id} booking={booking} />)
                    ) : (
                        <EmptyState title="No Cancellations" description="None of your bookings have been cancelled." showButton={false} />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    </div>
  );
}
