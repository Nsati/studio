'use client';

import React, { useState } from 'react';
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
import { Loader2, RefreshCw, AlertCircle, Activity, Filter, Download } from "lucide-react";
import { updateBookingStatusByAdmin } from './actions';
import { useToast } from '@/hooks/use-toast';

function BookingStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'CONFIRMED':
      return <Badge className="bg-green-100 text-green-700 border-0 hover:bg-green-100 font-black uppercase text-[9px] px-4 tracking-[0.15em] shadow-sm">Confirmed</Badge>;
    case 'CANCELLED':
      return <Badge variant="destructive" className="font-black uppercase text-[9px] px-4 tracking-[0.15em] border-0 shadow-sm">Cancelled</Badge>;
    case 'PENDING':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-black uppercase text-[9px] px-4 tracking-[0.15em] shadow-sm">Pending</Badge>;
    default:
      return <Badge variant="secondary" className="font-black uppercase text-[9px] px-4 tracking-[0.15em]">{status}</Badge>;
  }
}

export default function BookingsAdminPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Authorization is handled by synchronous bypass in firestore.rules for isMasterAdmin()
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collectionGroup(firestore, 'bookings'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: bookings, isLoading, error } = useCollection<Booking>(bookingsQuery);

  const handleStatusUpdate = async (userId: string, bookingId: string, status: 'CONFIRMED' | 'CANCELLED') => {
    setIsUpdating(bookingId);
    try {
        const result = await updateBookingStatusByAdmin(userId, bookingId, status);
        if (result.success) {
          toast({ title: 'Success', description: result.message });
        } else {
          toast({ variant: 'destructive', title: 'Action Failed', description: result.message });
        }
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Critical Error', description: e.message });
    } finally {
        setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="font-headline text-5xl font-black tracking-tight text-foreground">Reservations</h1>
          <p className="text-muted-foreground font-medium text-lg">Central control for all Himalayan stays.</p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" className="rounded-full h-14 px-8 border-black/10 font-bold hover:bg-muted/50 bg-white">
                <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.reload()} className="rounded-full h-14 px-8 shadow-apple border-black/5 font-bold hover:bg-muted/50 transition-all bg-white">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
        </div>
      </div>

      {error && (
        <Card className="rounded-[2.5rem] border-destructive/20 bg-destructive/5 overflow-hidden">
            <CardHeader className="py-8 px-10">
                <CardTitle className="text-xl font-black text-destructive flex items-center gap-3">
                    <AlertCircle className="h-6 w-6" /> Permission Error: collectionGroup('bookings')
                </CardTitle>
                <CardDescription className="text-destructive/80 font-medium text-base leading-relaxed">
                    Firestore rejected the global query. <strong>mistrikumar42@gmail.com</strong> must be added to the synchronous <code>isMasterAdmin()</code> bypass in <code>firestore.rules</code>.
                </CardDescription>
            </CardHeader>
        </Card>
      )}

      <Card className="rounded-[3rem] shadow-apple border-black/5 overflow-hidden bg-white">
        <CardHeader className="bg-white border-b border-black/5 px-10 py-10">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
                <CardTitle className="text-3xl font-black tracking-tight">Stay Inventory</CardTitle>
                <CardDescription className="text-base font-medium">Aggregated logs from all explorer accounts.</CardDescription>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Volume</p>
                <p className="text-3xl font-black tracking-tighter text-primary">{bookings?.length || 0} Records</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow className="border-0">
                <TableHead className="px-10 h-16 text-[10px] font-black uppercase tracking-widest">Customer</TableHead>
                <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest">Accommodation</TableHead>
                <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest">Stay Window</TableHead>
                <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest">Investment</TableHead>
                <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-right px-10 h-16 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-black/5">
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground/30" />
                    </TableCell>
                  </TableRow>
                ))
              ) : bookings && bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-muted/5 transition-colors border-b border-black/5 last:border-0">
                    <TableCell className="px-10 py-8">
                      <div className="font-bold text-sm leading-tight text-foreground">{booking.customerName}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.1em] mt-1.5 truncate max-w-[180px]">{booking.customerEmail}</div>
                    </TableCell>
                    <TableCell className="py-8">
                      <div className="font-bold text-sm text-foreground">{booking.hotelName}</div>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-60">{booking.roomType}</div>
                    </TableCell>
                    <TableCell className="py-8">
                      <div className="text-xs font-black tracking-tight text-foreground">
                        {format(normalizeTimestamp(booking.checkIn), 'dd MMM')} — {format(normalizeTimestamp(booking.checkOut), 'dd MMM yyyy')}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-black mt-1 uppercase tracking-widest">{booking.guests} Guests</div>
                    </TableCell>
                    <TableCell className="py-8 font-black text-primary text-base tracking-tighter">
                      {booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="py-8">
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell className="text-right px-10 py-8">
                      <div className="flex justify-end gap-3">
                        {booking.status === 'PENDING' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-10 px-6 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-green-50 hover:text-green-700 hover:border-green-200 border-black/5"
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
                            className="h-10 px-6 rounded-full text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5"
                            disabled={isUpdating === booking.id}
                            onClick={() => handleStatusUpdate(booking.userId, booking.id, 'CANCELLED')}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted">
                            <Download className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-96 text-center">
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="p-8 bg-muted/30 rounded-full">
                            <Activity className="h-16 w-16 text-muted-foreground/20" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-xs">Inventory Empty</p>
                            <p className="text-muted-foreground/60 text-base font-medium">No Himalayan bookings recorded yet.</p>
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