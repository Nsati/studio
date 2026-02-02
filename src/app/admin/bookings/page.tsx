'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { getAllBookingsForAdmin } from '../actions';
import { updateBookingStatusByAdmin, deleteBookingByAdmin } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isValid, parseISO } from 'date-fns';
import { 
  Loader2, 
  RefreshCw, 
  AlertCircle, 
  Activity, 
  Filter, 
  Download, 
  Trash2,
  ShieldAlert
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

function BookingStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'CONFIRMED':
      return <Badge className="bg-green-100 text-green-700 border-0 hover:bg-green-100 font-black uppercase text-[10px] px-5 py-2 tracking-[0.15em] shadow-sm rounded-full">Confirmed</Badge>;
    case 'CANCELLED':
      return <Badge variant="destructive" className="font-black uppercase text-[10px] px-5 py-2 tracking-[0.15em] border-0 shadow-sm rounded-full">Cancelled</Badge>;
    case 'PENDING':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-black uppercase text-[10px] px-5 py-2 tracking-[0.15em] shadow-sm rounded-full">Pending</Badge>;
    default:
      return <Badge variant="secondary" className="font-black uppercase text-[10px] px-5 py-2 tracking-[0.15em] rounded-full">{status}</Badge>;
  }
}

export default function BookingsAdminPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const loadBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllBookingsForAdmin();
      if (result.success) {
        setBookings(result.data || []);
      } else {
        setError(result.error || "Failed to fetch bookings inventory.");
      }
    } catch (err: any) {
      console.error("[INVENTORY] Sync Error:", err);
      setError("Network failure: Could not reach the administration server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleStatusUpdate = async (userId: string, bookingId: string, status: 'CONFIRMED' | 'CANCELLED') => {
    setIsUpdating(bookingId);
    try {
        const result = await updateBookingStatusByAdmin(userId, bookingId, status);
        if (result.success) {
          toast({ title: 'Success', description: result.message });
          loadBookings(); // Refresh list
        } else {
          toast({ variant: 'destructive', title: 'Action Failed', description: result.message });
        }
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Critical Error', description: e.message });
    } finally {
        setIsUpdating(null);
    }
  };

  const handlePurge = async (userId: string, bookingId: string) => {
    setIsUpdating(bookingId);
    try {
        const result = await deleteBookingByAdmin(userId, bookingId);
        if (result.success) {
            toast({ title: 'System Purge Complete', description: result.message });
            loadBookings();
        } else {
            toast({ variant: 'destructive', title: 'Purge Failed', description: result.message });
        }
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Critical Failure', description: e.message });
    } finally {
        setIsUpdating(null);
    }
  }

  const formatDateRange = (checkIn: string, checkOut: string) => {
    try {
        const start = checkIn ? parseISO(checkIn) : null;
        const end = checkOut ? parseISO(checkOut) : null;
        if (start && end && isValid(start) && isValid(end)) {
            return `${format(start, 'dd MMM')} — ${format(end, 'dd MMM yyyy')}`;
        }
        return 'Dates pending';
    } catch (e) {
        return 'Invalid window';
    }
  };

  return (
    <div className="space-y-12 md:space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div className="space-y-3">
          <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-none">Reservations</h1>
          <p className="text-muted-foreground font-medium text-lg md:text-2xl tracking-tight">Central control for all Himalayan stays.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" size="lg" className="flex-1 md:flex-none rounded-full h-16 px-8 border-black/10 font-black uppercase text-[11px] tracking-widest hover:bg-muted/50 bg-white">
                <Filter className="mr-3 h-5 w-5" /> Filter
            </Button>
            <Button variant="outline" size="lg" onClick={loadBookings} className="flex-1 md:flex-none rounded-full h-16 px-8 shadow-apple border-black/5 font-black uppercase text-[11px] tracking-widest hover:bg-muted/50 transition-all bg-white">
                <RefreshCw className={cn("mr-3 h-5 w-5 text-primary", isLoading && "animate-spin")} /> {isLoading ? 'Syncing...' : 'Refresh'}
            </Button>
        </div>
      </div>

      {error && (
        <Card className="rounded-[3rem] border-destructive/20 bg-destructive/5 overflow-hidden">
            <CardHeader className="py-10 px-10 flex flex-row items-center gap-8">
                <div className="p-5 bg-destructive/10 rounded-2xl">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-black text-destructive tracking-tight">System Sync Error</CardTitle>
                    <CardDescription className="text-destructive/80 font-medium text-lg">
                        {error}
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
      )}

      <Card className="rounded-[3rem] shadow-apple border-black/5 overflow-hidden bg-white">
        <CardHeader className="bg-white border-b border-black/5 p-10 md:p-14">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-2">
                <CardTitle className="text-3xl md:text-4xl font-black tracking-tighter">Stay Inventory</CardTitle>
                <CardDescription className="text-lg font-medium tracking-tight">Aggregated logs from all explorer accounts.</CardDescription>
            </div>
            <div className="text-left md:text-right w-full md:w-auto p-6 bg-muted/30 rounded-[2rem] border border-black/5">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-1">Total Volume</p>
                <p className="text-3xl md:text-4xl font-black tracking-tighter text-primary">{bookings.length} Records</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
                <TableHeader className="bg-muted/10">
                <TableRow className="border-0">
                    <TableHead className="px-14 h-20 text-[11px] font-black uppercase tracking-[0.25em]">Customer</TableHead>
                    <TableHead className="h-20 text-[11px] font-black uppercase tracking-[0.25em]">Accommodation</TableHead>
                    <TableHead className="h-20 text-[11px] font-black uppercase tracking-[0.25em]">Stay Window</TableHead>
                    <TableHead className="h-20 text-[11px] font-black uppercase tracking-[0.25em]">Investment</TableHead>
                    <TableHead className="h-20 text-[11px] font-black uppercase tracking-[0.25em]">Status</TableHead>
                    <TableHead className="text-right px-14 h-20 text-[11px] font-black uppercase tracking-[0.25em]">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-black/5">
                        <TableCell colSpan={6} className="h-32 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground/20" />
                        </TableCell>
                    </TableRow>
                    ))
                ) : bookings.length > 0 ? (
                    bookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-muted/5 transition-all duration-500 border-b border-black/5 last:border-0">
                        <TableCell className="px-14 py-10">
                        <div className="font-bold text-base leading-tight text-foreground tracking-tight">{booking.customerName}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.15em] mt-2 truncate max-w-[220px] opacity-60">{booking.customerEmail}</div>
                        </TableCell>
                        <TableCell className="py-10">
                        <div className="font-bold text-base text-foreground tracking-tight">{booking.hotelName}</div>
                        <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-2 opacity-40">{booking.roomType}</div>
                        </TableCell>
                        <TableCell className="py-10">
                        <div className="text-sm font-black tracking-tight text-foreground">
                            {formatDateRange(booking.checkIn, booking.checkOut)}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-black mt-2 uppercase tracking-widest opacity-50">{booking.guests} Guest Units</div>
                        </TableCell>
                        <TableCell className="py-10 font-black text-primary text-xl tracking-tighter">
                        {booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell className="py-10">
                        <BookingStatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell className="text-right px-14 py-10">
                        <div className="flex justify-end gap-3 items-center">
                            {booking.status === 'PENDING' && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-12 px-8 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-green-50 hover:text-green-700 hover:border-green-200 border-black/10"
                                disabled={isUpdating === booking.id}
                                onClick={() => handleStatusUpdate(booking.userId, booking.id, 'CONFIRMED')}
                            >
                                {isUpdating === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
                            </Button>
                            )}
                            {booking.status !== 'CANCELLED' && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-12 px-8 rounded-full text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5"
                                disabled={isUpdating === booking.id}
                                onClick={() => handleStatusUpdate(booking.userId, booking.id, 'CANCELLED')}
                            >
                                Cancel
                            </Button>
                            )}
                            <div className="h-10 w-px bg-black/5 mx-2" />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-12 w-12 rounded-2xl hover:bg-destructive/10 text-destructive/30 hover:text-destructive transition-all duration-500"
                                        disabled={isUpdating === booking.id}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-[3rem] border-0 shadow-2xl p-12">
                                    <AlertDialogHeader className="items-center text-center space-y-6">
                                        <div className="h-20 w-20 bg-destructive/10 rounded-[2rem] flex items-center justify-center text-destructive animate-bounce">
                                            <ShieldAlert className="h-10 w-10" />
                                        </div>
                                        <div className="space-y-3">
                                            <AlertDialogTitle className="text-3xl font-black tracking-tighter">God-Mode Purge</AlertDialogTitle>
                                            <AlertDialogDescription className="text-lg font-medium leading-relaxed">
                                                This action is irreversible. It will permanently erase this reservation for <span className="text-foreground font-bold">{booking.customerName}</span> from the database cluster.
                                            </AlertDialogDescription>
                                        </div>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="sm:justify-center gap-4 pt-10">
                                        <AlertDialogCancel className="rounded-full h-16 px-10 font-black uppercase text-[11px] tracking-[0.2em] border-black/10">Abort Action</AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={() => handlePurge(booking.userId, booking.id)}
                                            className="bg-destructive hover:bg-destructive/90 rounded-full h-16 px-10 font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-destructive/30"
                                        >
                                            Confirm Purge
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-muted transition-all">
                                <Download className="h-5 w-5 text-muted-foreground opacity-40" />
                            </Button>
                        </div>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={6} className="h-[500px] text-center">
                        <div className="flex flex-col items-center justify-center space-y-8">
                            <div className="p-12 bg-muted/30 rounded-full">
                                <Activity className="h-20 w-20 text-muted-foreground/10" />
                            </div>
                            <div className="space-y-3">
                                <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-sm">Inventory Void</p>
                                <p className="text-muted-foreground/60 text-lg font-medium tracking-tight">No Himalayan bookings recorded in this node.</p>
                            </div>
                        </div>
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
