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
  ChevronRight
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
      return <Badge className="bg-green-100 text-green-700 border-0 rounded-none font-bold uppercase text-[10px] px-2 py-0.5">Confirmed</Badge>;
    case 'CANCELLED':
      return <Badge className="bg-red-100 text-red-700 border-0 rounded-none font-bold uppercase text-[10px] px-2 py-0.5">Cancelled</Badge>;
    case 'PENDING':
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200 rounded-none font-bold uppercase text-[10px] px-2 py-0.5">Pending</Badge>;
    default:
      return <Badge variant="outline" className="rounded-none font-bold uppercase text-[10px] px-2 py-0.5">{status}</Badge>;
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
          loadBookings();
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
            toast({ title: 'Record Purged', description: result.message });
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
        return 'N/A';
    } catch (e) {
        return 'Invalid';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">Reservations</h1>
          <p className="text-muted-foreground text-sm font-medium">Manage and monitor all hotel stay requests.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadBookings} className="rounded-none h-10 font-bold border-border bg-white px-6">
                <RefreshCw className={cn("mr-2 h-4 w-4 text-[#003580]", isLoading && "animate-spin")} /> {isLoading ? 'Syncing...' : 'Refresh'}
            </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 rounded-none shadow-none">
            <CardHeader className="py-4 px-6 flex flex-row items-center gap-4">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold text-red-900">System Error</CardTitle>
                    <CardDescription className="text-red-700 text-xs font-medium">{error}</CardDescription>
                </div>
            </CardHeader>
        </Card>
      )}

      <Card className="rounded-none border-border bg-white shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/20 border-b p-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold text-[#1a1a1a]">Booking Inventory ({bookings.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
                <TableHeader className="bg-muted/10">
                <TableRow>
                    <TableHead className="font-bold text-[#1a1a1a] text-[11px] uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="font-bold text-[#1a1a1a] text-[11px] uppercase tracking-wider">Property Details</TableHead>
                    <TableHead className="font-bold text-[#1a1a1a] text-[11px] uppercase tracking-wider">Stay Window</TableHead>
                    <TableHead className="font-bold text-[#1a1a1a] text-[11px] uppercase tracking-wider">Amount</TableHead>
                    <TableHead className="font-bold text-[#1a1a1a] text-[11px] uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-right font-bold text-[#1a1a1a] text-[11px] uppercase tracking-wider">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={6} className="h-16 text-center">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground/40" />
                        </TableCell>
                    </TableRow>
                    ))
                ) : bookings.length > 0 ? (
                    bookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-muted/5 transition-colors">
                        <TableCell>
                        <div className="font-bold text-sm text-[#1a1a1a]">{booking.customerName}</div>
                        <div className="text-[11px] text-[#006ce4] truncate max-w-[180px] hover:underline cursor-pointer">{booking.customerEmail}</div>
                        </TableCell>
                        <TableCell>
                        <div className="font-bold text-sm text-[#1a1a1a]">{booking.hotelName}</div>
                        <div className="text-[11px] text-muted-foreground">{booking.roomType}</div>
                        </TableCell>
                        <TableCell>
                        <div className="text-sm font-medium">
                            {formatDateRange(booking.checkIn, booking.checkOut)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{booking.guests} Guests</div>
                        </TableCell>
                        <TableCell className="font-bold text-[#1a1a1a] text-sm">
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
                                className="h-8 rounded-none text-[11px] font-bold text-red-600 hover:bg-red-50"
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
                                        className="h-8 w-8 text-muted-foreground/40 hover:text-red-600 transition-colors"
                                        disabled={isUpdating === booking.id}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-none">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Reservation?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently remove the record for {booking.customerName}.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handlePurge(booking.userId, booking.id)} className="bg-red-600 text-white hover:bg-red-700 rounded-none">Confirm Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <Activity className="h-10 w-10 text-muted-foreground/20" />
                            <p className="text-muted-foreground text-sm font-medium">No reservations found in the system.</p>
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