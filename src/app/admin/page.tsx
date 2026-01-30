'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Hotel, 
  Users2, 
  BookOpen, 
  IndianRupee, 
  TrendingUp, 
  ArrowUpRight,
  Fingerprint,
  Loader2,
  AlertCircle,
  Activity
} from 'lucide-react';
import { useUser } from '@/firebase';
import { getAdminDashboardStats } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
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
  const { user, userProfile } = useUser();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getAdminDashboardStats();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="p-6 bg-destructive/10 rounded-full">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black">Connection Error</h2>
          <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
            <h1 className="font-headline text-5xl font-black tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground font-medium text-lg">Central Intelligence Console.</p>
        </div>
        <div className="flex items-center gap-3">
            <Badge variant="outline" className="h-10 px-5 rounded-full border-black/5 bg-white shadow-sm font-bold uppercase tracking-widest text-[9px]">
                <Activity className="h-3 w-3 mr-2 text-primary animate-pulse" /> Live Metrics
            </Badge>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Revenue" 
            value={(data?.stats?.totalRevenue || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })} 
            icon={IndianRupee} 
            description="Confirmed earnings" 
            isLoading={isLoading} 
            trend="+12%"
        />
        <StatCard 
            title="Bookings" 
            value={data?.stats?.confirmedCount || 0} 
            icon={BookOpen} 
            description="Active stays" 
            isLoading={isLoading}
            trend="+4%"
        />
        <StatCard 
            title="Hotels" 
            value={data?.stats?.hotelCount || 0} 
            icon={Hotel} 
            description="Verified listings" 
            isLoading={isLoading}
        />
        <StatCard 
            title="Users" 
            value={data?.stats?.userCount || 0} 
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
                        <CardDescription className="text-base font-medium text-muted-foreground">Latest reservations across the platform.</CardDescription>
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
                        ) : data?.recentBookings?.length > 0 ? (
                            data.recentBookings.map((booking: any) => (
                                <TableRow key={booking.id} className="hover:bg-muted/5 transition-colors border-b border-black/5 last:border-0">
                                    <TableCell className="px-10 py-6">
                                        <div className="font-bold text-sm text-foreground">{booking.customerName}</div>
                                        <div className="text-[9px] text-muted-foreground font-black tracking-widest uppercase mt-1">
                                            {booking.createdAt ? format(new Date(booking.createdAt), 'dd MMM, HH:mm') : 'N/A'}
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
            <Card className="rounded-[3rem] shadow-apple border-black/5 bg-primary text-white overflow-hidden relative group">
                <CardHeader className="p-10">
                    <CardTitle className="text-3xl font-black tracking-tight">System Status</CardTitle>
                    <CardDescription className="text-white/70 font-bold uppercase text-[10px] tracking-widest mt-2">Environment: Production</CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-10 space-y-6">
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest">Auth Mode</span>
                        <Badge className="bg-green-400 text-green-900 border-0 font-black text-[8px] px-3 py-0.5 uppercase">Admin Role</Badge>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest">Data Fetch</span>
                        <Badge className="bg-green-400 text-green-900 border-0 font-black text-[8px] px-3 py-0.5 uppercase">Server Action</Badge>
                    </div>
                    <div className="flex justify-between items-center py-3">
                        <span className="text-[10px] font-black uppercase tracking-widest">Rules Status</span>
                        <Badge className="bg-blue-400 text-blue-900 border-0 font-black text-[8px] px-3 py-0.5 uppercase">Standard</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-[3rem] shadow-apple border-black/5 bg-white overflow-hidden">
                <CardHeader className="p-10 pb-6">
                    <CardTitle className="text-xl font-black tracking-tight text-foreground">Active Identity</CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-10 space-y-6">
                    <div className="p-6 bg-muted/30 rounded-[2rem] space-y-3 border border-black/5">
                        <div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Logged In As</p>
                            <p className="text-sm font-bold truncate text-primary">{userProfile?.displayName || user?.email || 'Explorer'}</p>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest pt-2 border-t border-black/5">
                            <Fingerprint className="h-3 w-3" /> Role: {userProfile?.role || 'user'}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
