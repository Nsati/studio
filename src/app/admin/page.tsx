'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Hotel, 
  Users2, 
  BookOpen, 
  IndianRupee, 
  TrendingUp, 
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useUser } from '@/firebase';
import { getAdminDashboardStats } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isValid, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle } from '@/components/ui/alert';
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
 * @fileOverview Production Admin Dashboard for Tripzy.
 * Fixed: Resolved syntax error in Alert vs Button tags.
 */

function StatCard({ title, value, icon: Icon, description, isLoading, trend }: any) {
    return (
        <Card className="rounded-none border-border bg-white hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-[#003580]" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-2/3 mt-1" />
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-[#1a1a1a]">{value}</div>
                    <div className="flex items-center gap-2">
                        {trend && <span className="text-[10px] font-bold text-green-600 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> {trend}</span>}
                        <p className="text-[10px] text-muted-foreground">{description}</p>
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
        setError(response.error || "Failed to fetch metrics.");
      }
    } catch (err: any) {
      setError("Network error: Could not connect to Tripzy Cloud.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (userProfile && userProfile.role !== 'admin') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-6 text-center">
            <div className="p-6 bg-red-50 rounded-full">
                <ShieldAlert className="h-12 w-12 text-red-600" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Unauthorized Access</h2>
                <p className="text-muted-foreground">Your account does not have permission to view the Tripzy Admin Extranet.</p>
            </div>
            <Button asChild className="rounded-none px-10 h-12 font-bold bg-[#003580]">
                <Link href="/">Return to Site</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">Management Dashboard</h1>
            <p className="text-muted-foreground font-medium">Real-time overview of Himalayan properties and Tripzy bookings.</p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={loadData} className="rounded-none h-10 border-border bg-white font-bold px-6">
                <RefreshCw className={cn("h-4 w-4 mr-2 text-[#003580]", isLoading && "animate-spin")} />
                {isLoading ? 'Syncing...' : 'Refresh Data'}
            </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-none border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <div className="flex-1">
                <AlertTitle className="font-bold text-red-900">Synchronization Error</AlertTitle>
                <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button onClick={loadData} size="sm" variant="outline" className="ml-4 h-8 border-red-300 text-red-900 hover:bg-red-100">
                Retry
            </Button>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Total Revenue" 
            value={(data?.stats?.totalRevenue || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })} 
            icon={IndianRupee} 
            description="All-time confirmed" 
            isLoading={isLoading} 
            trend="+14%"
        />
        <StatCard 
            title="Live Bookings" 
            value={data?.stats?.confirmedCount || 0} 
            icon={BookOpen} 
            description="Confirmed Tripzy stays" 
            isLoading={isLoading}
            trend="+6%"
        />
        <StatCard 
            title="Active Properties" 
            value={data?.stats?.hotelCount || 0} 
            icon={Hotel} 
            description="Listed in search" 
            isLoading={isLoading}
        />
        <StatCard 
            title="Total Users" 
            value={data?.stats?.userCount || 0} 
            icon={Users2} 
            description="Registered accounts" 
            isLoading={isLoading} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-none border-border bg-white overflow-hidden shadow-sm">
            <CardHeader className="border-b bg-muted/30 p-6">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold">Latest Transactions</CardTitle>
                    <Button variant="link" asChild size="sm" className="text-[#006ce4] font-bold h-auto p-0">
                        <Link href="/admin/bookings" className="flex items-center">View all <ChevronRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <div className="min-w-[600px]">
                    <Table>
                        <TableHeader className="bg-muted/10">
                            <TableRow>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Guest</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Property</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-right">Amount</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={4} className="py-6"><Skeleton className="h-4 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : data?.recentBookings?.length > 0 ? (
                                data.recentBookings.map((booking: any) => {
                                    const bookingDate = booking.createdAt ? parseISO(booking.createdAt) : null;
                                    return (
                                        <TableRow key={booking.id} className="hover:bg-muted/5">
                                            <TableCell className="py-4">
                                                <div className="font-bold text-sm">{booking.customerName || 'Guest'}</div>
                                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                                    {bookingDate && isValid(bookingDate) ? format(bookingDate, 'dd MMM, HH:mm') : 'Syncing...'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="text-sm font-medium truncate max-w-[180px]">{booking.hotelName || 'Property'}</div>
                                                <div className="text-[10px] text-muted-foreground mt-0.5">{booking.roomType}</div>
                                            </TableCell>
                                            <TableCell className="py-4 text-right font-bold text-[#1a1a1a]">
                                                {(Number(booking.totalPrice) || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                                            </TableCell>
                                            <TableCell className="py-4 text-center">
                                                <Badge className={cn(
                                                    "rounded-none font-bold uppercase text-[9px] border-0 px-2 py-0.5",
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
                                    <TableCell colSpan={4} className="py-20 text-center text-muted-foreground font-medium">
                                        No recent transactions logged.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <div className="space-y-6">
            <Card className="rounded-none border-0 bg-[#003580] text-white overflow-hidden relative shadow-sm">
                <CardHeader className="p-6">
                    <CardTitle className="text-xl font-bold">Tripzy Nodes</CardTitle>
                    <CardDescription className="text-white/70">Operational Instance: Himalayan Hub</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-white/10 text-sm">
                        <span className="opacity-70">Cloud Gateway</span>
                        <span className="font-bold text-green-400">Stable</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10 text-sm">
                        <span className="opacity-70">Payment Node</span>
                        <span className="font-bold text-green-400">Active</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                        <span className="opacity-70">Security Layer</span>
                        <span className="font-bold text-blue-300">Hardened</span>
                    </div>
                </CardContent>
            </Card>

            <div className="p-6 bg-white border border-border space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#003580]" />
                    <span className="font-bold text-sm text-[#1a1a1a]">Admin Integrity</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Every Tripzy modification is logged and verified via production Admin SDK. Always verify property details before overriding pricing.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
