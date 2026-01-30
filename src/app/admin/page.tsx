'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel, Users2, BookOpen, IndianRupee, ShieldCheck, Loader2, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, collectionGroup, query, orderBy, limit } from 'firebase/firestore';
import type { Hotel as HotelType, UserProfile, Booking } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { normalizeTimestamp } from '@/lib/firestore-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

function StatCard({ title, value, icon: Icon, description, isLoading, trend }: any) {
    return (
        <Card className="rounded-[2rem] shadow-apple border-black/5 overflow-hidden group hover:shadow-apple-deep transition-all duration-500 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</CardTitle>
                <div className="p-2 bg-muted/50 rounded-xl group-hover:bg-primary/10 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                {isLoading ? (
                  <Skeleton className="h-10 w-2/3 mt-2" />
                ) : (
                  <div className="space-y-1">
                    <div className="text-3xl font-black tracking-tighter text-foreground">{value}</div>
                    <div className="flex items-center gap-2">
                        {trend && <span className="flex items-center text-[10px] font-black text-green-600"><TrendingUp className="h-3 w-3 mr-1" /> {trend}</span>}
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{description}</p>
                    </div>
                  </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard() {
  const firestore = useFirestore();
  const { user } = useUser();

  // Queries
  const hotelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'hotels');
  }, [firestore]);
  const { data: hotels, isLoading: isLoadingHotels } = useCollection<HotelType>(hotelsQuery);
  
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);
  
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Synchronous bypass in rules allows this collectionGroup query for master admin
    return query(collectionGroup(firestore, 'bookings'), orderBy('createdAt', 'desc'), limit(10));
  }, [firestore]);
  const { data: bookings, isLoading: isLoadingBookings, error: bookingsError } = useCollection<Booking>(bookingsQuery);

  // Stats calculation
  const isLoading = isLoadingHotels || isLoadingUsers || isLoadingBookings;
  const confirmedBookings = bookings?.filter(b => b.status === 'CONFIRMED') || [];
  const totalRevenue = confirmedBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0) || 0;
  const confirmedCount = confirmedBookings.length;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
            <h1 className="font-headline text-4xl font-black tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground font-medium">Global analytics for Uttarakhand Getaways.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-100 text-[10px] font-black uppercase tracking-widest shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" /> Synchronous God-Mode Active
            </div>
            <Badge variant="outline" className="h-9 px-4 rounded-full border-black/5 bg-white shadow-sm font-bold uppercase tracking-widest text-[9px]">
                <Activity className="h-3 w-3 mr-2 text-primary animate-pulse" /> Live
            </Badge>
        </div>
      </div>

      {bookingsError && (
        <Card className="border-destructive/50 bg-destructive/5 rounded-3xl">
            <CardHeader className="py-6 px-8">
                <CardTitle className="text-lg font-black text-destructive flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" /> Authorization Warning
                </CardTitle>
                <CardDescription className="text-destructive/80 font-medium">
                    The query <code>collectionGroup('bookings')</code> encountered a permission delay. The GOD-MODE rules should automatically bypass this.
                </CardDescription>
            </CardHeader>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Total Revenue" 
            value={totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })} 
            icon={IndianRupee} 
            description="Confirmed earnings" 
            isLoading={isLoading} 
            trend="+12%"
        />
        <StatCard 
            title="Active Bookings" 
            value={confirmedCount} 
            icon={BookOpen} 
            description="Reservations processed" 
            isLoading={isLoading}
            trend="+4%"
        />
        <StatCard 
            title="Properties" 
            value={hotels?.length ?? 0} 
            icon={Hotel} 
            description="Listed in database" 
            isLoading={isLoading}
        />
        <StatCard 
            title="Registered Users" 
            value={users?.length ?? 0} 
            icon={Users2} 
            description="Total community" 
            isLoading={isLoading} 
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-[2.5rem] shadow-apple border-black/5 overflow-hidden bg-white">
            <CardHeader className="bg-white border-b border-black/5 px-8 py-6">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight">Recent Activity</CardTitle>
                        <CardDescription>Latest bookings across the platform.</CardDescription>
                    </div>
                    <Button variant="ghost" asChild size="sm" className="rounded-full font-black uppercase text-[9px] tracking-widest h-10 px-6">
                        <Link href="/admin/bookings">View All <ArrowUpRight className="ml-2 h-3 w-3" /></Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/20">
                        <TableRow className="border-0">
                            <TableHead className="px-8 h-12 text-[10px] font-black uppercase tracking-widest">Guest</TableHead>
                            <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">Hotel</TableHead>
                            <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">Amount</TableHead>
                            <TableHead className="px-8 h-12 text-right text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({length: 5}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={4} className="px-8 py-6"><Skeleton className="h-4 w-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : bookings && bookings.length > 0 ? (
                            bookings.map(booking => (
                                <TableRow key={booking.id} className="hover:bg-muted/10 transition-colors">
                                    <TableCell className="px-8 py-5">
                                        <div className="font-bold text-sm">{booking.customerName}</div>
                                        <div className="text-[9px] text-muted-foreground font-black tracking-widest uppercase mt-0.5">
                                            {format(normalizeTimestamp(booking.createdAt), 'dd MMM, HH:mm')}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5 font-medium text-muted-foreground text-sm">{booking.hotelName}</TableCell>
                                    <TableCell className="py-5 font-black text-primary text-sm">
                                        {booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                                    </TableCell>
                                    <TableCell className="px-8 py-5 text-right">
                                        <Badge className={cn(
                                            "rounded-full font-black uppercase text-[8px] tracking-widest px-3 border-0",
                                            booking.status === 'CONFIRMED' ? "bg-green-100 text-green-700" : 
                                            booking.status === 'CANCELLED' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                        )}>
                                            {booking.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="px-8 py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">No bookings found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <div className="space-y-8">
            <Card className="rounded-[2.5rem] shadow-apple border-black/5 bg-primary text-white overflow-hidden relative group">
                <CardHeader className="p-8">
                    <CardTitle className="text-2xl font-black tracking-tight">System Info</CardTitle>
                    <CardDescription className="text-white/70 font-bold uppercase text-[10px] tracking-widest mt-2">Environment: Production</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest">Firestore Rules</span>
                        <Badge className="bg-green-400 text-green-900 border-0 font-black text-[8px] px-2 py-0">GOD-MODE</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest">Auth Gateway</span>
                        <Badge className="bg-green-400 text-green-900 border-0 font-black text-[8px] px-2 py-0">ACTIVE</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-[10px] font-black uppercase tracking-widest">NextJS Core</span>
                        <Badge className="bg-green-400 text-green-900 border-0 font-black text-[8px] px-2 py-0">LATEST</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] shadow-apple border-black/5 bg-white">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-lg font-black tracking-tight">Active Session</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-4">
                    <div className="p-4 bg-muted/50 rounded-2xl space-y-2 border border-black/5">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Identity</p>
                        <p className="text-xs font-bold truncate text-primary">{user?.email}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-2xl space-y-2 border border-black/5">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">UID</p>
                        <p className="text-[9px] font-mono break-all leading-tight">{user?.uid}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}