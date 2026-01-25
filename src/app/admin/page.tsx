
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
import { Hotel, Users2, BookOpen, IndianRupee } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup } from 'firebase/firestore';
import type { Booking, Hotel as HotelType, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function AdminDashboard() {
    const firestore = useFirestore();

    const bookingsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collectionGroup(firestore, 'bookings');
    }, [firestore]);

    const hotelsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'hotels');
    }, [firestore]);
    
    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);
    
    const { data: bookingsData, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);
    const { data: hotelsData, isLoading: isLoadingHotels } = useCollection<HotelType>(hotelsQuery);
    const { data: usersData, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

    const { totalRevenue, totalBookings, bookingsLastMonth } = useMemoFirebase(() => {
        if (!bookingsData) return { totalRevenue: 0, totalBookings: 0, bookingsLastMonth: 0 };
        
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        let revenue = 0;
        let lastMonthCount = 0;
        bookingsData.forEach(b => {
            if (b.status === 'CONFIRMED') {
                revenue += b.totalPrice;
                const createdAt = (b.createdAt as any).toDate ? (b.createdAt as any).toDate() : new Date(b.createdAt);
                if (createdAt > oneMonthAgo) {
                    lastMonthCount++;
                }
            }
        });
        
        return { totalRevenue: revenue, totalBookings: bookingsData.filter(b => b.status === 'CONFIRMED').length, bookingsLastMonth: lastMonthCount };
    }, [bookingsData]);
    
    const sortedBookings = useMemoFirebase(() => {
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
        <StatCard title="Confirmed Bookings" value={totalBookings} icon={BookOpen} description={`+${bookingsLastMonth} from last month`} isLoading={isLoadingBookings} />
        <StatCard title="Hotels" value={hotelsData?.length || 0} icon={Hotel} description="Total active properties" isLoading={isLoadingHotels}/>
        <StatCard title="Users" value={usersData?.length || 0} icon={Users2} description="Total registered users" isLoading={isLoadingUsers} />
      </div>

       <div className="grid gap-4 md:grid-cols-2">
            <BookingChart bookings={sortedBookings?.filter(b => b.status === 'CONFIRMED') ?? null} />
            <RecentBookings bookings={sortedBookings} />
        </div>
    </div>
  );
}
