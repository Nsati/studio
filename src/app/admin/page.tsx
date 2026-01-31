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
  RefreshCw,
  Activity,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { useUser } from '@/firebase';
import { getAdminDashboardStats } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isValid, parseISO } from 'date-fns';
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 md:px-8 pt-8">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</CardTitle>
                <div className="p-2 bg-muted/50 rounded-xl group-hover:bg-primary/10 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-8">
                {isLoading ? (
                  <Skeleton className="h-10 w-2/3 mt-2" />
                ) : (
                  <div className="space-y-1">
                    <div className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">{value}</div>
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
  const { userProfile } = useUser();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAdminDashboardStats();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to fetch dashboard metrics.");
      }
    } catch (err: any) {
      console.error("[DASHBOARD] Sync Error:", err);
      setError("Network error: Could not connect to the cloud environment.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (userProfile && userProfile.role !== 'admin') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4 text-center">
            <div className="p-6 bg-amber-50 rounded-full">
                <ShieldAlert className="h-12 w-12 text-amber-600" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-black">Restricted Access</h2>
                <p className="text-muted-foreground">Your account does not have authorization for this panel.</p>
            </div>
            <Button asChild className="rounded-full px-8 h-12 w-full max-w-xs">
                <Link href="/">Return to Site</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
            <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-foreground">Intelligence</h1>
            <p className="text-muted-foreground font-medium text-base md:text-lg">Central Operations Control.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" size="sm" onClick={loadData} className="w-full md:w-auto rounded-full h-12 px-6 font-bold uppercase tracking-widest text-[9px] border-black/5 bg-white shadow-sm hover:bg-muted/50 transition-all">
                <RefreshCw className={cn("h-3 w-3 mr-2 text-primary", isLoading && "animate-spin")} />
                {isLoading ? 'Syncing...' : 'Live Metrics'}
            </Button>
        </div>
      </div>

      {error && (
        <Card className="rounded-[2rem] border-amber-200 bg-amber-50 overflow-hidden">
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                <div className="flex-1">
                    <p className="font-bold text-amber-900">Sync Failure</p>
                    <p className="text-sm text-amber-700">{error}</p>
                </div>
                <Button onClick={loadData} variant="outline" size="sm" className="rounded-full w-full md:w-auto">Retry</Button>
            </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Revenue" 
            value={(data?.stats?.totalRevenue || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })} 
            icon={IndianRupee} 
            description="Confirmed earnings" 
            isLoading={isLoading} 
            trend="+12%"
        />
        <StatCard 
            title="Active Stays" 
            value={data?.stats?.confirmedCount || 0} 
            icon={BookOpen} 
            description="Live reservations" 
            isLoading={isLoading}
            trend="+4%"
        />
        <StatCard 
            title="Properties" 
            value={data?.stats?.hotelCount || 0} 
            icon={Hotel} 
            description="Verified listings" 
            isLoading={isLoading}
        />
        <StatCard 
            title="Explorers" 
            value={data?.stats?.userCount || 0} 
            icon={Users2} 
            description="Total accounts" 
            isLoading={isLoading} 
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-[2.5rem] md:rounded-[3rem] shadow-apple border-black/5 overflow-hidden bg-white">
            <CardHeader className="bg-white border-b border-black/5 p-6 md:p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="text-xl md:text-2xl font-black tracking-tight text-foreground">Recent Activity</CardTitle>
                        <CardDescription className="text-sm md:text-base font-medium text-muted-foreground">Latest events from the server.</CardDescription>
                    </div>
                    <Button variant="ghost" asChild size="sm" className="w-full md:w-auto rounded-full font-black uppercase text-[10px] tracking-widest h-12 px-8 hover:bg-muted/50">
                        <Link href="/admin/bookings" className="flex items-center justify-center gap-2">Full Inventory <ArrowUpRight className="h-4 w-4" /></Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <div className="min-w-[600px]">
                    <Table>
                        <TableHeader className="bg-muted/20">
                            <TableRow className="border-0">
                                <TableHead className="px-6 md:px-10 h-14 text-[10px] font-black uppercase tracking-widest">Guest</TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Property</TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Investment</TableHead>
                                <TableHead className="px-6 md:px-10 h-14 text-right text-[10px] font-black uppercase tracking-widest">Status</TableHead>
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
                                data.recentBookings.map((booking: any) => {
                                    const bookingDate = booking.createdAt ? parseISO(booking.createdAt) : null;
                                    return (
                                        <TableRow key={booking.id} className="hover:bg-muted/5 transition-colors border-b border-black/5 last:border-0">
                                            <TableCell className="px-6 md:px-10 py-6">
                                                <div className="font-bold text-sm text-foreground">{booking.customerName || 'Explorer'}</div>
                                                <div className="text-[9px] text-muted-foreground font-black tracking-widest uppercase mt-1">
                                                    {bookingDate && isValid(bookingDate) ? format(bookingDate, 'dd MMM, HH:mm') : 'Recently'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6 font-medium text-muted-foreground text-sm truncate max-w-[150px]">{booking.hotelName || 'Property'}</TableCell>
                                            <TableCell className="py-6 font-black text-primary text-sm tracking-tighter">
                                                {(Number(booking.totalPrice) || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                                            </TableCell>
                                            <TableCell className="px-6 md:px-10 py-6 text-right">
                                                <Badge className={cn(
                                                    "rounded-full font-black uppercase text-[8px] tracking-[0.15em] px-4 py-1 border-0 shadow-sm",
                                                    booking.status === 'CONFIRMED' ? "bg-green-100 text-green-700" : 
                                                    booking.status === 'CANCELLED' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {booking.status || 'PENDING'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="px-10 py-32 text-center text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">No records found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <div className="space-y-8 md:space-y-10">
            <Card className="rounded-[2.5rem] md:rounded-[3rem] shadow-apple border-black/5 bg-primary text-white overflow-hidden relative group">
                <CardHeader className="p-8 md:p-10">
                    <CardTitle className="text-2xl md:text-3xl font-black tracking-tight">Cloud Node</CardTitle>
                    <CardDescription className="text-white/70 font-bold uppercase text-[10px] tracking-widest mt-2">Status: Active</CardDescription>
                </CardHeader>
                <CardContent className="px-8 md:px-10 pb-8 md:pb-10 space-y-6">
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest">Protocol</span>
                        <Badge className="bg-green-400 text-green-900 border-0 font-black text-[8px] px-3 py-0.5 uppercase">Standard</Badge>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest">Runtime</span>
                        <Badge className="bg-blue-400 text-blue-900 border-0 font-black text-[8px] px-3 py-0.5 uppercase">NodeJS</Badge>
                    </div>
                    <div className="flex justify-between items-center py-3">
                        <span className="text-[10px] font-black uppercase tracking-widest">Sync Mode</span>
                        <Badge className="bg-purple-400 text-purple-900 border-0 font-black text-[8px] px-3 py-0.5 uppercase">Safe</Badge>
                    </div>
                </CardContent>
            </Card>

            <div className="p-6 md:p-8 bg-muted/30 rounded-[2.5rem] md:rounded-[3rem] border border-black/5 space-y-4">
                <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary animate-pulse" />
                    <span className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">System Health</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    Production data is fetched via authorized Admin SDK sessions to ensure security and reliability.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
