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
      return <Badge className="bg-green-100 text-green-700 border-0 hover:bg-green-100 font-bold uppercase text-[10px] px-3 py-1 rounded-sm">Confirmed</Badge>;
    case 'CANCELLED':
      return <Badge variant="destructive" className="font-bold uppercase text-[10px] px-3 py-1 rounded-sm">Cancelled</Badge>;
    case 'PENDING':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold uppercase text-[10px] px-3 py-1 rounded-sm">Pending</Badge>;
    default:
      return <Badge variant="secondary" className="font-bold uppercase text-[10px] px-3 py-1 rounded-sm">{status}</Badge>;
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reservations</h1>
          <p className="text-muted-foreground">Central control for all Himalayan stays.</p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="rounded-none font-bold">
                <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" size="sm" onClick={loadBookings} className="rounded-none font-bold">
                <RefreshCw className={cn("mr-2 h-4 w-4 text-primary", isLoading && "animate-spin")} /> {isLoading ? 'Syncing...' : 'Refresh'}
            </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
            <CardHeader className="py-6 px-6 flex flex-row items-center gap-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-destructive">System Sync Error</CardTitle>
                    <CardDescription className="text-destructive/80 font-medium">
                        {error}
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
      )}

      <Card className="rounded-none border-border shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-[#f5f5f5] border-b p-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold">Stay Inventory ({bookings.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
                <TableHeader className="bg-muted/10">
                <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Accommodation</TableHead>
                    <TableHead>Stay Window</TableHead>
                    <TableHead>Investment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={6} className="h-20 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground/40" />
                        </TableCell>
                    </TableRow>
                    ))
                ) : bookings.length > 0 ? (
                    bookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-muted/5">
                        <TableCell>
                        <div className="font-bold text-sm">{booking.customerName}</div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">{booking.customerEmail}</div>
                        </TableCell>
                        <TableCell>
                        <div className="font-bold text-sm">{booking.hotelName}</div>
                        <div className="text-[11px] text-muted-foreground">{booking.roomType}</div>
                        </TableCell>
                        <TableCell>
                        <div className="text-sm font-medium">
                            {formatDateRange(booking.checkIn, booking.checkOut)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{booking.guests} Guests</div>
                        </TableCell>
                        <TableCell className="font-bold text-[#1a1a1a]">
                        {booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell>
                        <BookingStatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell className="text-right">
                        <div className="flex justify-end gap-2 items-center">
                            {booking.status === 'PENDING' && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 rounded-none text-[11px] font-bold border-[#006ce4] text-[#006ce4] hover:bg-[#006ce4]/10"
                                disabled={isUpdating === booking.id}
                                onClick={() => handleStatusUpdate(booking.userId, booking.id, 'CONFIRMED')}
                            >
                                {isUpdating === booking.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                            </Button>
                            )}
                            {booking.status !== 'CANCELLED' && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 rounded-none text-[11px] font-bold text-destructive hover:bg-destructive/5"
                                disabled={isUpdating === booking.id}
                                onClick={() => handleStatusUpdate(booking.userId, booking.id, 'CANCELLED')}
                            >
                                Cancel
                            </Button>
                            )}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-muted-foreground/40 hover:text-destructive"
                                        disabled={isUpdating === booking.id}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Purge Record?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Permanently erase reservation for {booking.customerName}?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Abort</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handlePurge(booking.userId, booking.id)} className="bg-destructive text-white hover:bg-destructive/90">Confirm Purge</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={6} className="h-[300px] text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <Activity className="h-12 w-12 text-muted-foreground/20" />
                            <p className="text-muted-foreground font-medium">No bookings recorded.</p>
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