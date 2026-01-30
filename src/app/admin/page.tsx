'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Hotel, 
  Users2, 
  BookOpen, 
  IndianRupee, 
  ShieldCheck, 
  Loader2, 
  TrendingUp, 
  Activity, 
  ArrowUpRight 
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, collectionGroup, query, orderBy, limit } from 'firebase/firestore';
import type { Hotel as HotelType, UserProfile, Booking } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { normalizeTimestamp } from '@/lib/firestore-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

/**
 * Superuser Stat Card Component
 */
function StatCard({ title, value, icon: Icon, description, isLoading, trend }: any) {
    return (
        <Card className="rounded-[2.5rem] shadow-apple border-black/5 overflow-hidden group hover:shadow-apple-deep transition-all duration-500 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-8 pt-8">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</CardTitle>
                <div className="p-2 bg-muted/50 rounded-xl group-hover:bg-primary/10 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                {isLoading ? (
                  <Skeleton className="h-10 w-2/3 mt-2" />
                ) : (
                  <div className="space-y-1">
                    <div className="text-4xl font-black tracking-tighter text-foreground">{value}</div>
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

  // Basic collections
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
  
  // Critical Global Query: collectionGroup('bookings')
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Authorized via Synchronous Bypass in firestore.rules
    return query(collectionGroup(firestore, 'bookings'), orderBy('createdAt', 'desc'), limit(10));
  }, [firestore]);
  const { data: bookings, isLoading: isLoadingBookings, error: bookingsError } = useCollection<Booking>(bookingsQuery);

  const isLoading = isLoadingHotels || isLoadingUsers || isLoadingBookings;
  const confirmedBookings = bookings?.filter(b => b.status === 'CONFIRMED') || [];
  const totalRevenue = confirmedBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0) || 0;
  const confirmedCount = confirmedBookings.length;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
            <h1 className="font-headline text-5xl font-black tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground font-medium text-lg">Superuser Analytics Console.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2.5 rounded-full border border-green-100 text-[10px] font-black uppercase tracking-widest shadow-sm">
                <ShieldCheck className="h-4 w-4" /> MASTER BYPASS ACTIVE
            </div>
            <Badge variant="outline" className="h-10 px-5 rounded-full border-black/5 bg-white shadow-sm font-bold uppercase tracking-widest text-[9px]">
                <Activity className="h-3 w-3 mr-2 text-primary animate-pulse" /> Live Data
            </Badge>
        </div>
      </div>

      {bookingsError && (
        <Card className="border-destructive/50 bg-destructive/5 rounded-[2rem] border-dashed">
            <CardHeader className="py-8 px-10">
                <CardTitle className="text-xl font-black text-destructive flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin" /> Data Connection Blocked
                </CardTitle>
                <CardDescription className="text-destructive/80 font-medium text-base leading-relaxed">
                    Firestore rejected the global query. Ensure <strong>{user?.email || 'mistrikumar42@gmail.com'}</strong> is authorized in <code>firestore.rules</code> with synchronous bypass.
                </CardDescription>
            </CardHeader>
        </Card>
      )}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Revenue" 
            value={totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })} 
            icon={IndianRupee} 
            description="Confirmed earnings" 
            isLoading={isLoading} 
            trend="+12%"
        />
        <StatCard 
            title="Bookings" 
            value={confirmedCount} 
            icon={BookOpen} 
            description="Active stays" 
            isLoading={isLoading}
            trend="+4%"
        />
        <StatCard 
            title="Hotels" 
            value={hotels?.length ?? 0} 
            icon={Hotel} 
            description="Verified listings" 
            isLoading={isLoading}
        />
        <StatCard 
            title="Users" 
            value={users?.length ?? 0} 
            icon={Users2} 
            description="Total explorers" 
            isLoading={isLoading} 
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-[3rem] shadow-apple border-black/5 overflow-hidden bg-white">
            <CardHeader className="bg-white border-b border-black/5 px-10 py-8">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl font-black tracking-tight text-foreground">Recent Activity</CardTitle>
                        <CardDescription className="text-base font-medium text-muted-foreground">Live logs from all accounts.</CardDescription>
                    </div>
                    <Button variant="ghost" asChild size="sm" className="rounded-full font-black uppercase text-[10px] tracking-widest h-12 px-8 hover:bg-muted/50">
                        <Link href="/admin/bookings" className="flex items-center gap-2">Manage All <ArrowUpRight className="h-4 w-4" /></Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/20">
                        <TableRow className="border-0">
                            <TableHead className="px-10 h-14 text-[10px] font-black uppercase tracking-widest">Guest</TableHead>
                            <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Property</TableHead>
                            <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Amount</TableHead>
                            <TableHead className="px-10 h-14 text-right text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({length: 5}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={4} className="px-10 py-8"><Skeleton className="h-5 w-full rounded-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : bookings && bookings.length > 0 ? (
                            bookings.map(booking => (
                                <TableRow key={booking.id} className="hover:bg-muted/5 transition-colors border-b border-black/5 last:border-0">
                                    <TableCell className="px-10 py-6">
                                        <div className="font-bold text-sm text-foreground">{booking.customerName}</div>
                                        <div className="text-[9px] text-muted-foreground font-black tracking-widest uppercase mt-1">
                                            {format(normalizeTimestamp(booking.createdAt), 'dd MMM, HH:mm')}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 font-medium text-muted-foreground text-sm">{booking.hotelName}</TableCell>
                                    <TableCell className="py-6 font-black text-primary text-sm tracking-tighter">
                                        {booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                                    </TableCell>
                                    <TableCell className="px-10 py-6 text-right">
                                        <Badge className={cn(
                                            "rounded-full font-black uppercase text-[8px] tracking-[0.15em] px-4 py-1 border-0 shadow-sm",
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
                                <TableCell colSpan={4} className="px-10 py-32 text-center text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">No records found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <div className="space-y-10">
            {/* System Identity Section */}
            <Card className="rounded-[3rem] shadow-apple border-black/5 bg-primary text-white overflow-hidden relative group">
                <CardHeader className="p-10">
                    <CardTitle className="text-3xl font-black tracking-tight">System Info</CardTitle>
                    <CardDescription className="text-white/70 font-bold uppercase text-[10px] tracking-widest mt-2">Env: Superuser Production</CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-10 space-y-6">
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest">Auth Bypass</span>
                        <Badge className="bg-green-400 text-green-900 border-0 font-black text-[8px] px-3 py-0.5">ENABLED</Badge>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest">Rules Mode</span>
                        <Badge className="bg-green-400 text-green-900 border-0 font-black text-[8px] px-3 py-0.5">SYNCHRONOUS</Badge>
                    </div>
                    <div className="flex justify-between items-center py-3">
                        <span className="text-[10px] font-black uppercase tracking-widest">Database Sync</span>
                        <Badge className="bg-green-400 text-green-900 border-0 font-black text-[8px] px-3 py-0.5">REAL-TIME</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-[3rem] shadow-apple border-black/5 bg-white overflow-hidden">
                <CardHeader className="p-10 pb-6">
                    <CardTitle className="text-xl font-black tracking-tight text-foreground">Session Identity</CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-10 space-y-6">
                    <div className="p-6 bg-muted/30 rounded-[2rem] space-y-3 border border-black/5">
                        <div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active Admin</p>
                            <p className="text-sm font-bold truncate text-primary">{user?.email || 'mistrikumar42@gmail.com'}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Internal UID</p>
                            <p className="text-[10px] font-mono break-all leading-relaxed text-muted-foreground/80">{user?.uid || 'kk7Tsg8Ag3g1YMMR79rgrHUxq2W2'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}