
'use client';

import React from 'react';
import { useFirestore, useUser, useCollection, useDoc, useMemoFirebase, type WithId } from '@/firebase';
import type { Booking, Hotel } from '@/lib/types';
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
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'CONFIRMED':
      return (
        <Badge className="bg-green-100 text-green-700 border-0 hover:bg-green-100 font-black uppercase text-[10px] px-4 py-1 tracking-widest shadow-sm flex items-center gap-1.5 rounded-full">
          <CheckCircle2 className="h-3 w-3" /> Confirmed
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="destructive" className="font-black uppercase text-[10px] px-4 py-1 tracking-widest border-0 shadow-sm flex items-center gap-1.5 rounded-full">
          <XCircle className="h-3 w-3" /> Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-black uppercase text-[10px] px-4 py-1 tracking-widest shadow-sm flex items-center gap-1.5 rounded-full">
          <Clock className="h-3 w-3" /> Pending
        </Badge>
      );
  }
}

function BookingItemSkeleton() {
    return (
        <Card className="overflow-hidden rounded-[2.5rem] border-black/5 shadow-apple-deep">
            <div className="flex flex-col md:flex-row">
                <div className="relative h-64 w-full md:w-2/5 flex-shrink-0">
                    <Skeleton className="h-full w-full"/>
                </div>
                <div className="flex flex-col flex-grow justify-between p-10">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-3/4 rounded-full" />
                            <Skeleton className="h-5 w-1/4 rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <Skeleton className="h-12 w-full rounded-2xl" />
                            <Skeleton className="h-12 w-full rounded-2xl" />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-10">
                        <Skeleton className="h-14 w-32 rounded-full" />
                        <Skeleton className="h-14 w-40 rounded-full" />
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

  // Formatting dates safely
  const checkInDate = booking.checkIn instanceof Date ? booking.checkIn : (booking.checkIn as any).toDate?.() || new Date();
  const checkOutDate = booking.checkOut instanceof Date ? booking.checkOut : (booking.checkOut as any).toDate?.() || new Date();
  
  return (
    <Card className="group overflow-hidden rounded-[3rem] border-black/5 bg-white shadow-apple-deep transition-all duration-700 hover:-translate-y-1">
      <div className="flex flex-col md:flex-row">
        {/* Column 1: Immersive Image */}
        <div className="relative w-full aspect-[4/3] md:w-2/5 md:aspect-auto flex-shrink-0 overflow-hidden">
          {hotelImage ? (
            <Image
              src={hotelImage}
              alt={booking.hotelName}
              fill
              className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <HotelIcon className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />
          <div className="absolute top-8 left-8">
             <StatusBadge status={booking.status} />
          </div>
        </div>

        {/* Column 2: Refined Details */}
        <div className="flex flex-col flex-grow justify-between p-8 lg:p-12">
          <div className="space-y-8">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                    <MapPin className="h-3 w-3" /> {booking.hotelCity}
                </div>
                <h3 className="text-3xl lg:text-4xl font-black tracking-tighter leading-tight hover:text-primary transition-colors cursor-pointer">
                    <Link href={`/hotels/${booking.hotelId}`}>{booking.hotelName}</Link>
                </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stay Dates</p>
                    <div className="flex items-center gap-3 font-bold text-base">
                        <Calendar className="h-4 w-4 text-primary" />
                        {format(checkInDate, 'dd MMM')} — {format(checkOutDate, 'dd MMM yyyy')}
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reservation</p>
                    <div className="flex items-center gap-3 font-bold text-base">
                        <Users className="h-4 w-4 text-primary" />
                        {booking.guests} Guest(s) • {booking.roomType}
                    </div>
                </div>
                <div className="space-y-1 sm:col-span-2 pt-2 border-t border-black/5 mt-2">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reference ID</p>
                            <code className="text-xs font-mono bg-muted px-2 py-1 rounded-md opacity-70">{booking.id}</code>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Investment</p>
                            <div className="flex items-center justify-end gap-2 text-2xl font-black text-primary tracking-tighter">
                                <CreditCard className="h-5 w-5 opacity-30" />
                                {booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-12">
            <Button variant="outline" size="lg" className="rounded-full h-14 px-8 border-black/10 font-bold hover:bg-muted transition-all shadow-apple" asChild>
              <Link href={`/hotels/${booking.hotelId}`}>Hotel Details</Link>
            </Button>
            <Button variant="ghost" size="lg" className="rounded-full h-14 px-8 font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 text-muted-foreground" disabled>
              <Download className="mr-2 h-4 w-4" /> E-Voucher
            </Button>
            {booking.status === 'CONFIRMED' && (
                <Button variant="ghost" size="lg" className="rounded-full h-14 px-8 font-black uppercase text-[10px] tracking-widest text-destructive hover:bg-destructive/5 ml-auto" disabled>
                    Modify
                </Button>
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

  const isLoading = isUserLoading || areBookingsLoading;

  if (isLoading || !user) {
    return (
        <div className="container mx-auto max-w-6xl py-24 px-6 space-y-12">
            <div className="space-y-4">
                <Skeleton className="h-16 w-1/3 rounded-full" />
                <Skeleton className="h-6 w-1/2 rounded-full" />
            </div>
            <div className="space-y-12">
                <BookingItemSkeleton />
                <BookingItemSkeleton />
            </div>
        </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
        <div className="container mx-auto max-w-6xl py-24 px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-primary">
                        <Compass className="h-4 w-4" /> Concierge Dashboard
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">Your Himalayan <br/><span className="italic font-heading font-medium text-primary">Collection</span></h1>
                    <p className="text-muted-foreground text-xl font-medium max-w-xl leading-relaxed">
                        Manage your curated stays and explore the soul of the mountains from your personal travel library.
                    </p>
                </div>
                {bookings && bookings.length > 0 && (
                    <div className="bg-white/50 backdrop-blur-sm px-8 py-6 rounded-[2rem] border border-black/5 shadow-apple text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Adventures</p>
                        <p className="text-4xl font-black text-primary tracking-tighter">{bookings.length}</p>
                    </div>
                )}
            </div>

            {bookings && bookings.length > 0 ? (
                <div className="space-y-16">
                    {bookings.map(booking => (
                        <BookingItem key={booking.id} booking={booking} />
                    ))}
                </div>
            ) : (
                <div className="relative py-32 text-center overflow-hidden">
                    <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03]">
                        <Mountain className="h-[500px] w-[500px] text-primary rotate-12" />
                    </div>
                    <div className="relative z-10 space-y-8 max-w-lg mx-auto">
                        <div className="mx-auto h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center">
                            <Compass className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-4xl font-black tracking-tight">The Library is Empty</h2>
                            <p className="text-muted-foreground text-lg font-medium leading-relaxed px-4">
                                Your next great Himalayan story is waiting to be written. Let's find your perfect mountain retreat.
                            </p>
                        </div>
                        <Button asChild size="lg" className="rounded-full px-12 h-16 bg-primary hover:bg-primary/90 text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-95">
                            <Link href="/search">
                                Explore The Collection <ArrowRight className="ml-3 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}

// Simple Helper Icon
function Mountain(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m8 3 4 8 5-5 5 15H2Z" />
        </svg>
    )
}
