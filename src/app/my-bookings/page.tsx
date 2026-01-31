'use client';

import React, { useMemo } from 'react';
import { useFirestore, useUser, useCollection, useDoc, useMemoFirebase, type WithId } from '@/firebase';
import type { Booking, Hotel } from '@/lib/types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
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
import { cn } from '@/lib/utils';

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
        <Card className="overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border-black/5 shadow-apple-deep">
            <div className="flex flex-col md:flex-row">
                <div className="relative h-48 md:h-64 w-full md:w-2/5 flex-shrink-0">
                    <Skeleton className="h-full w-full"/>
                </div>
                <div className="flex flex-col flex-grow justify-between p-6 md:p-10">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-3/4 rounded-full" />
                            <Skeleton className="h-4 w-1/4 rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-8">
                        <Skeleton className="h-12 w-24 rounded-full" />
                        <Skeleton className="h-12 w-32 rounded-full" />
                    </div>
                </div>
            </div>
        </Card>
    );
}

function BookingItem({ booking }: { booking: WithId<Booking> }) {
  const firestore = useFirestore();

  const hotelRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'hotels', booking.hotelId);
  }, [firestore, booking.hotelId]);

  const { data: hotel, isLoading } = useDoc<Hotel>(hotelRef);
  
  if (isLoading) {
    return <BookingItemSkeleton />;
  }

  const hotelImage = hotel ? PlaceHolderImages.find((img) => img.id === hotel.images[0])?.imageUrl || hotel.images[0] : null;

  const checkInDate = booking.checkIn instanceof Date ? booking.checkIn : (booking.checkIn as any).toDate?.() || new Date();
  const checkOutDate = booking.checkOut instanceof Date ? booking.checkOut : (booking.checkOut as any).toDate?.() || new Date();
  
  return (
    <Card className="group overflow-hidden rounded-[2.5rem] md:rounded-[3rem] border-black/5 bg-white shadow-apple-deep transition-all duration-700 hover:-translate-y-1">
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
          <div className="absolute top-6 left-6 md:top-8 md:left-8">
             <StatusBadge status={booking.status} />
          </div>
        </div>

        <div className="flex flex-col flex-grow justify-between p-6 md:p-12">
          <div className="space-y-6 md:space-y-8">
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
                        {format(checkInDate, 'dd MMM')} — {format(checkOutDate, 'dd MMM yyyy')}
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reservation</p>
                    <div className="flex items-center gap-3 font-bold text-sm md:text-base">
                        <Users className="h-4 w-4 text-primary" />
                        {booking.guests} Guest(s) • {booking.roomType}
                    </div>
                </div>
                <div className="space-y-1 sm:col-span-2 pt-4 border-t border-black/5 mt-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reference ID</p>
                            <code className="text-[10px] font-mono bg-muted px-2 py-1 rounded-md opacity-70 break-all">{booking.id}</code>
                        </div>
                        <div className="text-left sm:text-right space-y-1 w-full sm:w-auto">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Investment</p>
                            <div className="flex items-center sm:justify-end gap-2 text-xl md:text-2xl font-black text-primary tracking-tighter">
                                <CreditCard className="h-5 w-5 opacity-30" />
                                {booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-8 md:mt-12">
            <Button variant="outline" size="lg" className="flex-1 sm:flex-none rounded-full h-12 md:h-14 px-6 md:px-8 border-black/10 font-bold hover:bg-muted transition-all shadow-apple text-xs md:text-sm" asChild>
              <Link href={`/hotels/${booking.hotelId}`}>Hotel Details</Link>
            </Button>
            <Button variant="ghost" size="lg" className="flex-1 sm:flex-none rounded-full h-12 md:h-14 px-6 md:px-8 font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-primary/5 text-muted-foreground" disabled>
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
        <div className="relative py-12 md:py-24 text-center overflow-hidden">
            <div className="relative z-10 space-y-6 md:space-y-8 max-w-lg mx-auto px-4">
                <div className="mx-auto h-20 w-24 md:h-24 md:w-24 bg-muted/50 rounded-full flex items-center justify-center">
                    <Inbox className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/40" />
                </div>
                <div className="space-y-2 md:space-y-3">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h2>
                    <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed">
                        {description}
                    </p>
                </div>
                {showButton && (
                    <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-10 md:px-12 h-14 md:h-16 bg-primary hover:bg-primary/90 text-base md:text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-95">
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

  React.useEffect(() => {
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
    const data = {
        confirmed: bookings?.filter(b => b.status === 'CONFIRMED') || [],
        pending: bookings?.filter(b => b.status === 'PENDING') || [],
        cancelled: bookings?.filter(b => b.status === 'CANCELLED') || []
    };
    return data;
  }, [bookings]);

  const isLoading = isUserLoading || areBookingsLoading;

  if (isLoading || !user) {
    return (
        <div className="container mx-auto max-w-6xl py-12 md:py-24 px-4 md:px-6 space-y-8 md:space-y-12">
            <div className="space-y-4">
                <Skeleton className="h-12 md:h-16 w-1/2 md:w-1/3 rounded-full" />
                <Skeleton className="h-4 md:h-6 w-3/4 md:w-1/2 rounded-full" />
            </div>
            <div className="space-y-8 md:space-y-12">
                <BookingItemSkeleton />
                <BookingItemSkeleton />
            </div>
        </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
        <div className="container mx-auto max-w-6xl py-12 md:py-24 px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary">
                        <Compass className="h-4 w-4" /> Concierge Dashboard
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">Your Himalayan <br className="hidden md:block"/><span className="italic font-heading font-medium text-primary">Collection</span></h1>
                    <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                        Manage your curated stays and explore the soul of the mountains from your personal travel library.
                    </p>
                </div>
                {bookings && bookings.length > 0 && (
                    <div className="bg-white/50 backdrop-blur-sm px-6 py-4 md:px-8 md:py-6 rounded-[1.5rem] md:rounded-[2rem] border border-black/5 shadow-apple text-center self-start md:self-auto">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Adventures</p>
                        <p className="text-3xl md:text-4xl font-black text-primary tracking-tighter">{bookings.length}</p>
                    </div>
                )}
            </div>

            <Tabs defaultValue="confirmed" className="space-y-8 md:space-y-12">
                <div className="flex justify-center overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                    <TabsList className="h-14 md:h-16 p-1 bg-muted/30 rounded-full border border-black/5 backdrop-blur-sm shrink-0">
                        <TabsTrigger value="confirmed" className="rounded-full px-6 md:px-10 h-full data-[state=active]:bg-white data-[state=active]:shadow-apple font-black text-[10px] md:text-xs uppercase tracking-widest">
                            Confirmed <span className="ml-2 opacity-40">{stats.confirmed.length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-full px-6 md:px-10 h-full data-[state=active]:bg-white data-[state=active]:shadow-apple font-black text-[10px] md:text-xs uppercase tracking-widest">
                            Pending <span className="ml-2 opacity-40">{stats.pending.length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="cancelled" className="rounded-full px-6 md:px-10 h-full data-[state=active]:bg-white data-[state=active]:shadow-apple font-black text-[10px] md:text-xs uppercase tracking-widest">
                            Cancelled <span className="ml-2 opacity-40">{stats.cancelled.length}</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="confirmed" className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {stats.confirmed.length > 0 ? (
                        stats.confirmed.map(booking => <BookingItem key={booking.id} booking={booking} />)
                    ) : (
                        <EmptyState title="No Active Journeys" description="You haven't scheduled any Himalayan retreats yet. Let's find your first one." />
                    )}
                </TabsContent>

                <TabsContent value="pending" className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {stats.pending.length > 0 ? (
                        stats.pending.map(booking => <BookingItem key={booking.id} booking={booking} />)
                    ) : (
                        <EmptyState title="Clear Skies" description="No pending reservations found. Everything is in order." showButton={false} />
                    )}
                </TabsContent>

                <TabsContent value="cancelled" className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {stats.cancelled.length > 0 ? (
                        stats.cancelled.map(booking => <BookingItem key={booking.id} booking={booking} />)
                    ) : (
                        <EmptyState title="No Cancellations" description="None of your bookings have been cancelled. That's great!" showButton={false} />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    </div>
  );
}
