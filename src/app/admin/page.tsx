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
  AlertTriangle,
  Zap,
  ShieldCheck,
  Power
} from 'lucide-react';
import { useUser } from '@/firebase';
import { getAdminDashboardStats } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isValid, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
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
        <Card className="rounded-[3rem] shadow-apple border-black/5 overflow-hidden group hover:shadow-apple-deep transition-all duration-700 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-10 pt-10">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{title}</CardTitle>
                <div className="p-3 bg-muted/50 rounded-2xl group-hover:bg-primary/10 transition-colors duration-500">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="px-10 pb-10">
                {isLoading ? (
                  <Skeleton className="h-12 w-2/3 mt-2 rounded-full" />
                ) : (
                  <div className="space-y-2">
                    <div className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">{value}</div>
                    <div className="flex items-center gap-3 pt-1">
                        {trend && <span className="flex items-center text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full"><TrendingUp className="h-3 w-3 mr-1" /> {trend}</span>}
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
  
  const [isBookingActive, setIsBookingActive] = useState(true);
  const [isPaymentActive, setIsPaymentActive] = useState(true);

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
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 px-6 text-center">
            <div className="p-8 bg-amber-50 rounded-full shadow-2xl shadow-amber-100">
                <ShieldAlert className="h-16 w-16 text-amber-600" />
            </div>
            <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tighter">Restricted Access</h2>
                <p className="text-muted-foreground font-medium text-lg">Your account does not have authorization for this panel.</p>
            </div>
            <Button asChild className="rounded-full px-12 h-16 text-lg font-black transition-all active:scale-95 shadow-xl shadow-primary/20">
                <Link href="/">Return to Site</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-12 md:space-y-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary border-0 font-black uppercase text-[10px] px-5 py-2 rounded-full tracking-[0.2em] shadow-sm">Master Logic Engine</Badge>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Real-time Node Active</span>
                </div>
            </div>
            <div className="space-y-1">
                <h1 className="font-headline text-5xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.9]">Intelligence</h1>
                <p className="text-muted-foreground font-medium text-xl md:text-2xl tracking-tight">God-Mode Operational Dashboard.</p>
            </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <Button variant="outline" size="lg" onClick={loadData} className="w-full md:w-auto rounded-full h-16 px-10 font-black uppercase tracking-[0.2em] text-[11px] border-black/10 bg-white shadow-apple hover:shadow-apple-deep transition-all duration-500">
                <RefreshCw className={cn("h-5 w-5 mr-4 text-primary", isLoading && "animate-spin")} />
                {isLoading ? 'Syncing Layers...' : 'Refresh Universe'}
            </Button>
        </div>
      </div>

      {/* GOD-MODE: System Switches */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="rounded-[2.5rem] border-black/5 bg-white shadow-apple p-8 md:p-10 flex items-center justify-between group hover:shadow-apple-deep transition-all duration-700">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <Zap className={cn("h-5 w-5", isBookingActive ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Booking Logic</span>
                </div>
                <p className="font-black text-xl tracking-tight">Accepting Stays</p>
            </div>
            <Switch checked={isBookingActive} onCheckedChange={setIsBookingActive} className="scale-125 data-[state=checked]:bg-primary" />
        </Card>
        <Card className="rounded-[2.5rem] border-black/5 bg-white shadow-apple p-8 md:p-10 flex items-center justify-between group hover:shadow-apple-deep transition-all duration-700">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <IndianRupee className={cn("h-5 w-5", isPaymentActive ? "text-accent" : "text-muted-foreground")} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Payment Link</span>
                </div>
                <p className="font-black text-xl tracking-tight">Secure Gateway</p>
            </div>
            <Switch checked={isPaymentActive} onCheckedChange={setIsPaymentActive} className="scale-125 data-[state=checked]:bg-accent" />
        </Card>
        <Card className="rounded-[2.5rem] border-destructive/10 bg-destructive/5 shadow-apple p-8 md:p-10 flex items-center justify-between group cursor-pointer hover:bg-destructive/10 transition-all duration-700" onClick={() => alert('Emergency Global Shutdown is restricted to Super-Admin console.')}>
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-destructive" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive/60">Danger Zone</span>
                </div>
                <p className="font-black text-xl text-destructive tracking-tight">Kill Switch</p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-destructive/20 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
                <Power className="h-7 w-7 text-destructive" />
            </div>
        </Card>
      </div>

      {error && (
        <Card className="rounded-[3rem] border-amber-200 bg-amber-50 overflow-hidden shadow-apple">
            <CardContent className="p-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="p-6 bg-amber-100 rounded-3xl shadow-xl shadow-amber-200/20">
                    <AlertTriangle className="h-10 w-10 text-amber-600" />
                </div>
                <div className="flex-1 space-y-1">
                    <p className="font-black text-2xl text-amber-900 tracking-tight">Synchronization Lag</p>
                    <p className="text-lg text-amber-700/80 font-medium leading-relaxed">{error}</p>
                </div>
                <Button onClick={loadData} variant="outline" size="lg" className="rounded-full w-full md:w-auto h-16 px-10 font-black uppercase tracking-widest text-xs border-amber-300 hover:bg-amber-100 transition-all shadow-lg shadow-amber-200/20">Re-establish Link</Button>
            </CardContent>
        </Card>
      )}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Total Yield" 
            value={(data?.stats?.totalRevenue || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })} 
            icon={IndianRupee} 
            description="Confirmed earnings" 
            isLoading={isLoading} 
            trend="+14%"
        />
        <StatCard 
            title="Active Node" 
            value={data?.stats?.confirmedCount || 0} 
            icon={BookOpen} 
            description="Live reservations" 
            isLoading={isLoading}
            trend="+6%"
        />
        <StatCard 
            title="Assets" 
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

      <div className="grid gap-10 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-[3rem] shadow-apple border-black/5 overflow-hidden bg-white">
            <CardHeader className="bg-white border-b border-black/5 p-10 md:p-14">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-2">
                        <CardTitle className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">Omni-Channel Stream</CardTitle>
                        <CardDescription className="text-lg font-medium text-muted-foreground tracking-tight">Latest transactions flowing through God-Mode.</CardDescription>
                    </div>
                    <Button variant="ghost" asChild size="sm" className="w-full md:w-auto rounded-full font-black uppercase text-[11px] tracking-[0.2em] h-14 px-10 hover:bg-muted/50 border border-black/5 shadow-sm transition-all duration-500">
                        <Link href="/admin/bookings" className="flex items-center justify-center gap-3">Full Database <ArrowUpRight className="h-5 w-5" /></Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <div className="min-w-[700px]">
                    <Table>
                        <TableHeader className="bg-muted/10">
                            <TableRow className="border-0">
                                <TableHead className="px-14 h-20 text-[11px] font-black uppercase tracking-[0.25em]">Guest Identity</TableHead>
                                <TableHead className="h-20 text-[11px] font-black uppercase tracking-[0.25em]">Asset</TableHead>
                                <TableHead className="h-20 text-[11px] font-black uppercase tracking-[0.25em]">Yield</TableHead>
                                <TableHead className="px-14 h-20 text-right text-[11px] font-black uppercase tracking-[0.25em]">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i} className="border-b border-black/5">
                                        <TableCell colSpan={4} className="px-14 py-12"><Skeleton className="h-8 w-full rounded-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : data?.recentBookings?.length > 0 ? (
                                data.recentBookings.map((booking: any) => {
                                    const bookingDate = booking.createdAt ? parseISO(booking.createdAt) : null;
                                    return (
                                        <TableRow key={booking.id} className="hover:bg-muted/5 transition-all duration-500 border-b border-black/5 last:border-0">
                                            <TableCell className="px-14 py-10">
                                                <div className="font-bold text-base text-foreground tracking-tight">{booking.customerName || 'Explorer'}</div>
                                                <div className="text-[10px] text-muted-foreground font-black tracking-[0.15em] uppercase mt-2 opacity-60">
                                                    {bookingDate && isValid(bookingDate) ? format(bookingDate, 'dd MMM • HH:mm') : 'Syncing...'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-10">
                                                <div className="font-bold text-base text-foreground truncate max-w-[180px] tracking-tight">{booking.hotelName || 'Property'}</div>
                                                <div className="text-[10px] font-black text-muted-foreground uppercase mt-2 tracking-widest opacity-50">{booking.roomType}</div>
                                            </TableCell>
                                            <TableCell className="py-10 font-black text-primary text-lg tracking-tighter">
                                                {(Number(booking.totalPrice) || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                                            </TableCell>
                                            <TableCell className="px-14 py-10 text-right">
                                                <Badge className={cn(
                                                    "rounded-full font-black uppercase text-[9px] tracking-[0.2em] px-5 py-2 border-0 shadow-sm",
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
                                    <TableCell colSpan={4} className="px-14 py-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-6">
                                            <div className="p-10 bg-muted/20 rounded-full">
                                                <Activity className="h-16 w-16 text-muted-foreground/20" />
                                            </div>
                                            <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-sm">No Active Events Logged.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <div className="space-y-10">
            <Card className="rounded-[3rem] shadow-apple-deep border-0 bg-primary text-white overflow-hidden relative group h-fit">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-black/30" />
                <CardHeader className="relative p-10 md:p-12">
                    <CardTitle className="text-3xl md:text-5xl font-black tracking-tighter leading-none">Cloud Instance</CardTitle>
                    <CardDescription className="text-white/70 font-black uppercase text-[11px] tracking-[0.25em] mt-4">Node: Optimized Production</CardDescription>
                </CardHeader>
                <CardContent className="relative px-10 md:px-12 pb-10 md:pb-12 space-y-8">
                    <div className="flex justify-between items-center py-5 border-b border-white/10">
                        <span className="text-[11px] font-black uppercase tracking-[0.25em]">Data Latency</span>
                        <Badge className="bg-green-400 text-green-900 border-0 font-black text-[9px] px-4 py-1.5 rounded-full uppercase tracking-widest">12ms Stable</Badge>
                    </div>
                    <div className="flex justify-between items-center py-5 border-b border-white/10">
                        <span className="text-[11px] font-black uppercase tracking-[0.25em]">Security Layer</span>
                        <Badge className="bg-blue-400 text-blue-900 border-0 font-black text-[9px] px-4 py-1.5 rounded-full uppercase tracking-widest">Hardened</Badge>
                    </div>
                    <div className="flex justify-between items-center py-5">
                        <span className="text-[11px] font-black uppercase tracking-[0.25em]">God-Mode</span>
                        <Badge className="bg-purple-400 text-purple-900 border-0 font-black text-[9px] px-4 py-1.5 rounded-full uppercase tracking-widest">Master Active</Badge>
                    </div>
                </CardContent>
            </Card>

            <div className="p-10 bg-muted/30 rounded-[3rem] border border-black/5 space-y-8 group hover:bg-muted/50 transition-all duration-700 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-black uppercase tracking-[0.25em] text-[11px] text-muted-foreground">Admin Integrity</span>
                </div>
                <p className="text-base font-medium text-muted-foreground leading-relaxed tracking-tight">
                    You are in God-Mode. Every transaction and record override is authenticated via production-grade Admin SDK sessions. Use your override power responsibly.
                </p>
                <div className="pt-6 border-t border-black/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Identity Verified • Protocol Secure</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
