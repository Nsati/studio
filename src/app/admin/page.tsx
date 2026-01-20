'use client';
import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Hotel, Users2, BookOpen, IndianRupee, AlertTriangle, Activity } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, collectionGroup, query, where, Timestamp } from 'firebase/firestore';
import type { Booking, Hotel as HotelType, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';


function StatCard({ title, value, icon: Icon, description, isLoading }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-1/2 mt-1" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{value}</div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </>
                )}
            </CardContent>
        </Card>
    )
}

function RecentBookings({ bookings }: { bookings: Booking[] | null }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    {bookings && bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center">
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{booking.customerName}</p>
                                <p className="text-sm text-muted-foreground">{booking.customerEmail}</p>
                            </div>
                            <div className="ml-auto font-medium">{booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                        </div>
                    ))}
                    {(!bookings || bookings.length === 0) && (
                        <p className="text-sm text-muted-foreground">No recent bookings.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function BookingChart({ bookings }: { bookings: Booking[] | null }) {
    const chartData = useMemo(() => {
        if (!bookings) return [];
        const data: { [key: string]: { date: string; total: number } } = {};
        
        bookings.forEach(booking => {
            const date = (booking.createdAt as any).toDate ? (booking.createdAt as any).toDate() : new Date(booking.createdAt);
            const day = date.toISOString().split('T')[0];
            if (!data[day]) {
                data[day] = { date: day, total: 0 };
            }
            data[day].total += booking.totalPrice;
        });

        return Object.values(data).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [bookings]);

    const chartConfig = {
      total: {
        label: "Revenue",
        color: "hsl(var(--primary))",
      },
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Daily revenue from bookings.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                        <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export default function AdminDashboard() {
    const firestore = useFirestore();

    const bookingsQuery = useMemo(() => {
        if (!firestore) return null;
        return collectionGroup(firestore, 'bookings');
    }, [firestore]);

    const hotelsQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'hotels');
    }, [firestore]);
    
    const usersQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);
    
    const { data: bookingsData, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);
    const { data: hotelsData, isLoading: isLoadingHotels } = useCollection<HotelType>(hotelsQuery);
    const { data: usersData, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

    const { totalRevenue, totalBookings, bookingsLastMonth } = useMemo(() => {
        if (!bookingsData) return { totalRevenue: 0, totalBookings: 0, bookingsLastMonth: 0 };
        
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        let revenue = 0;
        let lastMonthCount = 0;
        bookingsData.forEach(b => {
            revenue += b.totalPrice;
            const createdAt = (b.createdAt as any).toDate ? (b.createdAt as any).toDate() : new Date(b.createdAt);
            if (createdAt > oneMonthAgo) {
                lastMonthCount++;
            }
        });
        
        return { totalRevenue: revenue, totalBookings: bookingsData.length, bookingsLastMonth: lastMonthCount };
    }, [bookingsData]);
    
    const sortedBookings = useMemo(() => {
        if (!bookingsData) return null;
        return bookingsData.sort((a, b) => {
             const dateA = (a.createdAt as any).toDate ? (a.createdAt as any).toDate() : new Date(a.createdAt);
             const dateB = (b.createdAt as any).toDate ? (b.createdAt as any).toDate() : new Date(b.createdAt);
             return dateB.getTime() - dateA.getTime();
        });
    }, [bookingsData]);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} icon={IndianRupee} description="All-time revenue" isLoading={isLoadingBookings} />
        <StatCard title="Bookings" value={totalBookings} icon={BookOpen} description={`+${bookingsLastMonth} from last month`} isLoading={isLoadingBookings} />
        <StatCard title="Hotels" value={hotelsData?.length || 0} icon={Hotel} description="Total active properties" isLoading={isLoadingHotels}/>
        <StatCard title="Users" value={usersData?.length || 0} icon={Users2} description="Total registered users" isLoading={isLoadingUsers} />
      </div>

       <div className="grid gap-4 md:grid-cols-2">
            <BookingChart bookings={sortedBookings} />
            <RecentBookings bookings={sortedBookings} />
        </div>
    </div>
  );
}
