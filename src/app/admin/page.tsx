'use client';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Hotel, Users2, BookOpen, IndianRupee, AlertCircle } from 'lucide-react';
import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, collectionGroup, query } from 'firebase/firestore';
import type { Booking, Hotel as HotelType, UserProfile } from '@/lib/types';
import { normalizeTimestamp } from '@/lib/firestore-utils';


const BookingChart = dynamic(() => import('@/components/admin/BookingChart'), {
  ssr: false,
  loading: () => <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-[200px] w-full" /></CardContent></Card>,
});

const RecentBookings = dynamic(() => import('@/components/admin/RecentBookings'), {
  loading: () => <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>,
});

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

function AdminErrorState({ error }: { error: Error }) {
    return (
        <Card className="col-span-full bg-destructive/10 border-destructive/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                    Admin Panel Error
                </CardTitle>
                <CardDescription className="text-destructive">
                    The admin panel could not load all data. This may be due to a permissions issue.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <pre className="text-xs text-destructive-foreground bg-destructive/20 p-4 rounded-md overflow-x-auto">
                    <code>
                        {error.message}
                    </code>
                </pre>
            </CardContent>
        </Card>
    )
}


export default function AdminDashboard() {
    const { userProfile, isLoading: isUserLoading } = useUser();
    const firestore = useFirestore();

    const bookingsQuery = useMemoFirebase(() => {
        if (!firestore || userProfile?.role !== 'admin') return null;
        return query(collectionGroup(firestore, 'bookings'));
    }, [firestore, userProfile]);
    const { data: bookingsData, isLoading: areBookingsLoading, error: bookingsError } = useCollection<Booking>(bookingsQuery);

    const usersQuery = useMemoFirebase(() => {
        if (!firestore || userProfile?.role !== 'admin') return null;
        return collection(firestore, 'users');
    }, [firestore, userProfile]);
    const { data: usersData, isLoading: areUsersLoading, error: usersError } = useCollection<UserProfile>(usersQuery);

    const hotelsQuery = useMemoFirebase(() => {
        if (!firestore || userProfile?.role !== 'admin') return null;
        return collection(firestore, 'hotels');
    }, [firestore, userProfile]);
    const { data: hotelsData, isLoading: areHotelsLoading, error: hotelsError } = useCollection<HotelType>(hotelsQuery);
    
    const isLoading = isUserLoading || areBookingsLoading || areUsersLoading || areHotelsLoading;
    const error = bookingsError || usersError || hotelsError;

    const { totalRevenue, totalBookings, bookingsLastMonth } = useMemo(() => {
        if (!bookingsData) return { totalRevenue: 0, totalBookings: 0, bookingsLastMonth: 0 };
        
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        let revenue = 0;
        let lastMonthCount = 0;
        bookingsData.forEach(b => {
            if (b.status === 'CONFIRMED') {
                revenue += b.totalPrice;
                const createdAt = normalizeTimestamp(b.createdAt);
                if (!isNaN(createdAt.getTime()) && createdAt > oneMonthAgo) {
                    lastMonthCount++;
                }
            }
        });
        
        return { totalRevenue: revenue, totalBookings: bookingsData.filter(b => b.status === 'CONFIRMED').length, bookingsLastMonth: lastMonthCount };
    }, [bookingsData]);
    
    const sortedBookings = useMemo(() => {
        if (!bookingsData) return null;
        return [...bookingsData]
          .sort((a, b) => {
            const dateA = normalizeTimestamp(a.createdAt);
            const dateB = normalizeTimestamp(b.createdAt);
            if (isNaN(dateA.getTime())) return 1;
            if (isNaN(dateB.getTime())) return -1;
            return dateB.getTime() - dateA.getTime();
        });
    }, [bookingsData]);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>

        {error && (
            <AdminErrorState error={error} />
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Revenue" value={totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} icon={IndianRupee} description="All-time revenue" isLoading={isLoading} />
            <StatCard title="Confirmed Bookings" value={totalBookings} icon={BookOpen} description={`+${bookingsLastMonth} from last month`} isLoading={isLoading} />
            <StatCard title="Hotels" value={hotelsData?.length || 0} icon={Hotel} description="Total active properties" isLoading={isLoading}/>
            <StatCard title="Users" value={usersData?.length || 0} icon={Users2} description="Total registered users" isLoading={isLoading} />
        </div>

       <div className="grid gap-4 md:grid-cols-2">
            <BookingChart bookings={sortedBookings?.filter(b => b.status === 'CONFIRMED') ?? null} />
            <RecentBookings bookings={sortedBookings} />
        </div>
    </div>
  );
}
