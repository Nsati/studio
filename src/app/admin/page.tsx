'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel, Users2, BookOpen, IndianRupee, TrendingUp, ShieldCheck, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, collectionGroup, query, orderBy } from 'firebase/firestore';
import type { Hotel as HotelType, UserProfile, Booking } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { normalizeTimestamp } from '@/lib/firestore-utils';
import { Badge } from '@/components/ui/badge';
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
        <Card className="rounded-[2rem] shadow-apple border-black/5 overflow-hidden group">
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

  useEffect(() => {
    if (user) {
      console.log("--- ADMIN DEBUG ---");
      console.log("AUTH UID:", user.uid);
      console.log("AUTH EMAIL:", user.email);
      console.log("QUERY TYPE: collectionGroup('bookings')");
    }
  }, [user]);

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
    if (!firestore || !user) return null;
    return query(collectionGroup(firestore, 'bookings'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);
  
  const { data: bookings, isLoading: isLoadingBookings, error: bookingsError } = useCollection<Booking>(bookingsQuery);

  // Stats calculation
  const isLoading = isLoadingHotels || isLoadingUsers || isLoadingBookings;
  const confirmedBookings = bookings?.filter(b => b.status === 'CONFIRMED') || [];
  const totalRevenue = confirmedBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0) || 0;
  const confirmedCount = confirmedBookings.length;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
            <h1 className="font-headline text-4xl font-black tracking-tight">Dashboard Overview</h1>
            <p className="text-muted-foreground font-medium">Command center for Uttarakhand Getaways.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-100 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5" /> Master Access
        </div>
      </div>

      {bookingsError && (
        <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="py-4">
                <CardTitle className="text-sm font-bold text-destructive flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Permission Error
                </CardTitle>
                <CardDescription className="text-destructive/80 text-xs">
                    Accessing global bookings failed. Ensure rules allow collectionGroup queries for {user?.email}. Check console for debug logs.
                </CardDescription>
            </CardHeader>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Total Revenue" 
            value={totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })} 
            icon={IndianRupee} 
            description="Lifetime earnings" 
            isLoading={isLoading} 
            trend="+12%"
        />
        <StatCard 
            title="Confirmed Stays" 
            value={confirmedCount} 
            icon={BookOpen} 
            description="Bookings fulfilled" 
            isLoading={isLoading}
            trend="+5%"
        />
        <StatCard 
            title="Active Properties" 
            value={hotels?.length ?? 0} 
            icon={Hotel} 
            description="Listed hotels" 
            isLoading={isLoading}
        />
        <StatCard 
            title="Total Explorers" 
            value={users?.length ?? 0} 
            icon={Users2} 
            description="Registered users" 
            isLoading={isLoading} 
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-[2.5rem] shadow-apple border-black/5 overflow-hidden">
            <CardHeader className="bg-white border-b border-black/5 px-8 py-6">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight">Recent Reservations</CardTitle>
                        <CardDescription>Live activity across the platform.</CardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-full font-black uppercase text-[9px] tracking-widest">Live Feed</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/30">
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
                                    <TableCell colSpan={4} className="px-8 py-4"><Skeleton className="h-4 w-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : bookings && bookings.length > 0 ? (
                            bookings.slice(0, 10).map(booking => (
                                <TableRow key={booking.id} className="hover:bg-muted/10 transition-colors">
                                    <TableCell className="px-8 py-4">
                                        <div className="font-bold text-sm">{booking.customerName}</div>
                                        <div className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">
                                            {format(normalizeTimestamp(booking.createdAt), 'dd MMM, HH:mm')}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 font-medium text-muted-foreground text-sm">{booking.hotelName}</TableCell>
                                    <TableCell className="py-4 font-black text-primary text-sm">
                                        {booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                                    </TableCell>
                                    <TableCell className="px-8 py-4 text-right">
                                        <Badge className={cn(
                                            "rounded-full font-black uppercase text-[9px] tracking-widest px-3",
                                            booking.status === 'CONFIRMED' ? "bg-green-100 text-green-700 hover:bg-green-100" : 
                                            booking.status === 'CANCELLED' ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                        )}>
                                            {booking.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="px-8 py-12 text-center text-muted-foreground font-medium">No recent activity detected.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <div className="space-y-8">
            <Card className="rounded-[2.5rem] shadow-apple border-black/5 bg-primary text-white overflow-hidden relative group">
                <CardHeader className="p-8">
                    <CardTitle className="text-2xl font-black tracking-tight">Growth Insight</CardTitle>
                    <CardDescription className="text-white/70 font-bold uppercase text-[10px] tracking-widest mt-2">Revenue Pulse</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-4">
                    <p className="text-sm font-medium text-white/80 leading-relaxed">Bookings are showing a steady upward trend this season. Focus on Nainital properties for marketing.</p>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest">Expected Growth</span>
                        <span className="text-lg font-black tracking-tighter">+18%</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] shadow-apple border-black/5">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-lg font-black tracking-tight">System Status</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Firestore Health</span>
                        <Badge className="bg-green-500/10 text-green-600 border-0 font-black text-[9px] uppercase tracking-widest">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Payment Node</span>
                        <Badge className="bg-green-500/10 text-green-600 border-0 font-black text-[9px] uppercase tracking-widest">Live</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}