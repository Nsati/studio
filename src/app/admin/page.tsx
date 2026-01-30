'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel, Users2, BookOpen, IndianRupee, TrendingUp, ShieldCheck } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, query, orderBy } from 'firebase/firestore';
import type { Hotel as HotelType, UserProfile, Booking } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { normalizeTimestamp } from '@/lib/firestore-utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function StatCard({ title, value, icon: Icon, description, isLoading, trend }: any) {
    return (
        <Card className="rounded-[2rem] shadow-apple border-black/5 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</CardTitle>
                <div className="p-2 bg-muted/50 rounded-xl group-hover:bg-primary/10 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                {isLoading ? (
                  <Skeleton className="h-10 w-2/3 mt-2" />
                ) : (
                  <div className="space-y-1">
                    <div className="text-3xl font-black tracking-tighter text-foreground">{value}</div>
                    <div className="flex items-center gap-2">
                        {trend && <span className="flex items-center text-[10px] font-black text-green-600"><TrendingUp className="h-3 w-3 mr-1" /> {trend}</span>}
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{description}</p>
                    </div>
                  </div>
                )}
            </CardContent>
        </Card>
    )
}


export default function AdminDashboard() {
  const firestore = useFirestore();

  const hotelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'hotels');
  }, [firestore]);
  const { data: hotels, isLoading: isLoadingHotels } = useCollection<HotelType>(hotelsQuery);
  
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);
  
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Using collectionGroup to aggregate all bookings from all users
    return query(collectionGroup(firestore, 'bookings'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  const { data: bookings, isLoading: isLoadingBookings, error: bookingsError } = useCollection<Booking>(bookingsQuery);

  const isLoading = isLoadingHotels || isLoadingUsers || isLoadingBookings;

  const totalRevenue = bookings?.filter(b => b.status === 'CONFIRMED').reduce((acc, b) => acc + b.totalPrice, 0) || 0;
  const confirmedCount = bookings?.filter(b => b.status === 'CONFIRMED').length ?? 0;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
            <h1 className="font-headline text-4xl font-black tracking-tight">Dashboard Overview</h1>
            <p className="text-muted-foreground font-medium">Welcome back to the command center.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-100 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5" /> Master Admin Mode Active
        </div>
      </div>

      {bookingsError && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-2xl text-xs font-mono">
          PERMISSION ERROR: {bookingsError.message}. Ensure collection group indexes are created in Firebase Console.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Total Revenue" 
            value={totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })} 
            icon={IndianRupee} 
            description="Confirmed bookings" 
            isLoading={isLoading} 
            trend="+12%"
        />
        <StatCard 
            title="Bookings" 
            value={confirmedCount} 
            icon={BookOpen} 
            description="Confirmed stays" 
            isLoading={isLoading}
            trend="+5%"
        />
        <StatCard 
            title="Properties" 
            value={hotels?.length ?? 0} 
            icon={Hotel} 
            description="Active listings" 
            isLoading={isLoading}
        />
        <StatCard 
            title="Explorers" 
            value={users?.length ?? 0} 
            icon={Users2} 
            description="Registered users" 
            isLoading={isLoading} 
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity Table */}
        <Card className="lg:col-span-2 rounded-[2rem] shadow-apple border-black/5 overflow-hidden">
            <CardHeader className="bg-white border-b border-black/5 px-8 py-6">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight">Recent Reservations</CardTitle>
                        <CardDescription>Latest activity across the platform.</CardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-full font-black uppercase text-[9px] tracking-widest">Live Feed</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/30 border-b border-black/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <tr>
                                <th className="px-8 py-4 text-left">Guest</th>
                                <th className="px-4 py-4 text-left">Hotel</th>
                                <th className="px-4 py-4 text-left">Amount</th>
                                <th className="px-8 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {isLoading ? (
                                Array.from({length: 5}).map((_, i) => (
                                    <tr key={i}><td colSpan={4} className="px-8 py-4"><Skeleton className="h-4 w-full" /></td></tr>
                                ))
                            ) : bookings && bookings.slice(0, 6).map(booking => (
                                <tr key={booking.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="font-bold">{booking.customerName}</div>
                                        <div className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">{format(normalizeTimestamp(booking.createdAt), 'dd MMM, HH:mm')}</div>
                                    </td>
                                    <td className="px-4 py-4 font-medium text-muted-foreground">{booking.hotelName}</td>
                                    <td className="px-4 py-4 font-black text-primary">{booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</td>
                                    <td className="px-8 py-4 text-right">
                                        <Badge className={cn(
                                            "rounded-full font-black uppercase text-[9px] tracking-widest px-3",
                                            booking.status === 'CONFIRMED' ? "bg-green-100 text-green-700 hover:bg-green-100" : 
                                            booking.status === 'CANCELLED' ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                        )}>
                                            {booking.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && (!bookings || bookings.length === 0) && (
                                <tr><td colSpan={4} className="px-8 py-12 text-center text-muted-foreground font-medium">No recent bookings found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>

        {/* System Health / Quick Info */}
        <div className="space-y-8">
            <Card className="rounded-[2rem] shadow-apple border-black/5 bg-primary text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp className="h-32 w-32" /></div>
                <CardHeader className="p-8">
                    <CardTitle className="text-2xl font-black tracking-tight leading-tight">Growth Insight</CardTitle>
                    <CardDescription className="text-white/70 font-bold uppercase text-[10px] tracking-widest mt-2">Revenue Analytics</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-4 relative z-10">
                    <p className="text-sm font-medium text-white/80 leading-relaxed">Your business has seen a steady increase in confirmed bookings this season.</p>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest">Avg. Order Value</span>
                        <span className="text-lg font-black tracking-tighter">₹14,500</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-[2rem] shadow-apple border-black/5">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-lg font-black tracking-tight">System Status</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">Database Sync</span>
                        <Badge className="bg-green-500/10 text-green-600 border-0">Optimal</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">Payment Gateway</span>
                        <Badge className="bg-green-500/10 text-green-600 border-0">Razorpay Live</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">AI Assistant</span>
                        <Badge className="bg-green-500/10 text-green-600 border-0">Ready</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}