
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel, Users2, BookOpen, IndianRupee } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Hotel as HotelType, UserProfile, Booking } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

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
  
  // Note: collectionGroup queries like this require an index in Firestore.
  // This might fail if the index hasn't been created.
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'bookings');
  }, [firestore]);
  const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);

  const isLoading = isLoadingHotels || isLoadingUsers || isLoadingBookings;

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value="₹--,--,---" icon={IndianRupee} description="Revenue calculation pending" isLoading={isLoading} />
        <StatCard title="Confirmed Bookings" value={bookings?.filter(b => b.status === 'CONFIRMED').length ?? 0} icon={BookOpen} description="Total confirmed bookings" isLoading={isLoading} />
        <StatCard title="Hotels" value={hotels?.length ?? 0} icon={Hotel} description="Total active properties" isLoading={isLoading}/>
        <StatCard title="Users" value={users?.length ?? 0} icon={Users2} description="Total registered users" isLoading={isLoading} />
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>More dashboard widgets coming soon!</CardDescription>
        </CardHeader>
        <CardContent>
            <p>You can manage hotels, users, and more from the sidebar.</p>
        </CardContent>
       </Card>
    </div>
  );
}
