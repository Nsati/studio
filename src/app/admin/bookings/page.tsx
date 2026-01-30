'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, orderBy, query } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
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
import { format } from 'date-fns';
import { normalizeTimestamp } from '@/lib/firestore-utils';
import { Loader2, RefreshCw } from "lucide-react";
import { updateBookingStatusByAdmin } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

function BookingStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'CONFIRMED':
      return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Confirmed</Badge>;
    case 'CANCELLED':
      return <Badge variant="destructive">Cancelled</Badge>;
    case 'PENDING':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function BookingsAdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collectionGroup(firestore, 'bookings'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: bookings, isLoading, error } = useCollection<Booking>(bookingsQuery);

  const handleStatusUpdate = async (userId: string, bookingId: string, status: 'CONFIRMED' | 'CANCELLED') => {
    setIsUpdating(bookingId);
    const result = await updateBookingStatusByAdmin(userId, bookingId, status);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsUpdating(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline text-3xl font-bold">Booking Management</h1>
          <p className="text-muted-foreground">Monitor and manage all customer reservations.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
        </Button>
      </div>

      <Card className="rounded-[2rem] shadow-apple border-black/5 overflow-hidden">
        <CardHeader className="bg-white border-b border-black/5 px-8 py-6">
          <CardTitle className="text-xl font-black tracking-tight">Global Reservations</CardTitle>
          <CardDescription>All bookings across all user accounts.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="px-8">Customer</TableHead>
                <TableHead>Hotel & Room</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="h-16 text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))
              ) : bookings && bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="px-8">
                      <div className="font-bold text-sm">{booking.customerName}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{booking.customerEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-sm">{booking.hotelName}</div>
                      <div className="text-xs text-muted-foreground">{booking.roomType}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-bold">
                        {format(normalizeTimestamp(booking.checkIn), 'dd MMM')} - {format(normalizeTimestamp(booking.checkOut), 'dd MMM yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-primary">
                      {booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2">
                        {booking.status === 'PENDING' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-3 rounded-full text-[10px] font-black uppercase"
                            disabled={isUpdating === booking.id}
                            onClick={() => handleStatusUpdate(booking.userId, booking.id, 'CONFIRMED')}
                          >
                            Confirm
                          </Button>
                        )}
                        {booking.status !== 'CANCELLED' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-3 rounded-full text-[10px] font-black uppercase text-destructive hover:bg-destructive/5"
                            disabled={isUpdating === booking.id}
                            onClick={() => handleStatusUpdate(booking.userId, booking.id, 'CANCELLED')}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center text-muted-foreground font-medium">
                    No bookings found in the database.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-xs font-mono">
          Error: {error.message}. Ensure collectionGroup rules are active.
        </div>
      )}
    </div>
  );
}