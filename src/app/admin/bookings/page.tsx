'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
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
import { Loader2, RefreshCw, AlertCircle, Activity } from "lucide-react";
import { updateBookingStatusByAdmin } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

function BookingStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'CONFIRMED':
      return <Badge className="bg-green-100 text-green-700 border-0 hover:bg-green-100 font-black uppercase text-[9px] px-3 tracking-widest">Confirmed</Badge>;
    case 'CANCELLED':
      return <Badge variant="destructive" className="font-black uppercase text-[9px] px-3 tracking-widest border-0">Cancelled</Badge>;
    case 'PENDING':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-black uppercase text-[9px] px-3 tracking-widest">Pending</Badge>;
    default:
      return <Badge variant="secondary" className="font-black uppercase text-[9px] px-3 tracking-widest">{status}</Badge>;
  }
}

export default function BookingsAdminPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collectionGroup(firestore, 'bookings'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: bookings, isLoading, error } = useCollection<Booking>(bookingsQuery);

  const handleStatusUpdate = async (userId: string, bookingId: string, status: 'CONFIRMED' | 'CANCELLED') => {
    setIsUpdating(bookingId);
    try {
        const result = await updateBookingStatusByAdmin(userId, bookingId, status);
        if (result.success) {
          toast({ title: 'Success', description: result.message });
        } else {
          toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Critical Error', description: e.message });
    } finally {
        setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="font-headline text-4xl font-black tracking-tight">Booking Management</h1>
          <p className="text-muted-foreground font-medium">Centralized control for all customer reservations.</p>
        </div>
        <Button variant="outline" size="lg" onClick={() => window.location.reload()} className="rounded-full shadow-apple border-black/5 font-bold hover:bg-muted/50 transition-all">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Global Data
        </Button>
      </div>

      {error && (
        <Card className="rounded-3xl border-destructive/20 bg-destructive/5 overflow-hidden">
            <CardHeader className="py-6 px-8">
                <CardTitle className="text-lg font-black text-destructive flex items-center gap-3">
                    <AlertCircle className="h-5 w-5" /> Access Denied
                </CardTitle>
                <CardDescription className="text-destructive/80 font-medium">
                    The query <code>collectionGroup('bookings')</code> was rejected. 
                    Authenticated as: <strong>{user?.email}</strong>
                </CardDescription>
            </CardHeader>
        </Card>
      )}

      <Card className="rounded-[2.5rem] shadow-apple border-black/5 overflow-hidden bg-white">
        <CardHeader className="bg-white border-b border-black/5 px-8 py-8">
          <div className="flex justify-between items-end">
            <div>
                <CardTitle className="text-2xl font-black tracking-tight">Global Reservations</CardTitle>
                <CardDescription className="font-medium">Total bookings across all explorer accounts.</CardDescription>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inventory Status</p>
                <p className="text-xl font-black tracking-tighter text-primary">{bookings?.length || 0} Total Stays</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow className="border-0">
                <TableHead className="px-8 h-14 text-[10px] font-black uppercase tracking-widest">Customer Profile</TableHead>
                <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Hotel & Accommodation</TableHead>
                <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Itinerary</TableHead>
                <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Transaction</TableHead>
                <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-right px-8 h-14 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-black/5">
                    <TableCell colSpan={6} className="h-20 text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground/50" />
                    </TableCell>
                  </TableRow>
                ))
              ) : bookings && bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-muted/10 transition-colors border-b border-black/5">
                    <TableCell className="px-8 py-6">
                      <div className="font-bold text-sm leading-tight">{booking.customerName}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1 truncate max-w-[150px]">{booking.customerEmail}</div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="font-bold text-sm text-foreground">{booking.hotelName}</div>
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">{booking.roomType}</div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="text-xs font-black tracking-tight">
                        {format(normalizeTimestamp(booking.checkIn), 'dd MMM')} — {format(normalizeTimestamp(booking.checkOut), 'dd MMM yyyy')}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-bold mt-0.5">{booking.guests} Guests</div>
                    </TableCell>
                    <TableCell className="py-6 font-black text-primary text-sm tracking-tighter">
                      {booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="py-6">
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell className="text-right px-8 py-6">
                      <div className="flex justify-end gap-2">
                        {booking.status === 'PENDING' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-green-50 hover:text-green-700 hover:border-green-200"
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
                            className="h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5"
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
                  <TableCell colSpan={6} className="h-96 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-6 bg-muted/30 rounded-full">
                            <Activity className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Quiet Horizon</p>
                            <p className="text-muted-foreground/60 text-sm font-medium">No bookings found in the database yet.</p>
                        </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}