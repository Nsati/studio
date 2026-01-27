
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { Booking, UserProfile, Hotel } from '@/lib/types';
import type { WithId } from '@/firebase';

export type SerializableBooking = Omit<Booking, 'checkIn' | 'checkOut' | 'createdAt'> & {
    id: string;
    checkIn: string;
    checkOut: string;
    createdAt: string;
};

export type AdminChartData = { date: string; total: number }[];

export type AdminDashboardStats = {
    totalRevenue: number;
    totalBookings: number;
    bookingsLastMonth: number;
    totalUsers: number;
    totalHotels: number;
    chartData: AdminChartData;
    recentBookings: SerializableBooking[];
};

/**
 * Fetches and computes all necessary stats for the admin dashboard on the server.
 * This is more efficient as it reduces the data payload sent to the client.
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) {
        console.error("Admin dashboard error:", error);
        throw new Error(error || "Admin SDK not initialized");
    }
    
    const [bookingsSnapshot, usersSnapshot, hotelsSnapshot] = await Promise.all([
        adminDb.collectionGroup('bookings').orderBy('createdAt', 'desc').get(),
        adminDb.collection('users').get(),
        adminDb.collection('hotels').get()
    ]);

    const totalUsers = usersSnapshot.size;
    const totalHotels = hotelsSnapshot.size;

    let totalRevenue = 0;
    let totalBookings = 0;
    let bookingsLastMonth = 0;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const chartDataMap: Map<string, number> = new Map();
    const serializableBookings: SerializableBooking[] = [];

    bookingsSnapshot.docs.forEach(doc => {
        const booking = doc.data() as Booking;

        if (booking.status === 'CONFIRMED') {
            totalRevenue += booking.totalPrice;
            totalBookings++;
            
            const createdAt = (booking.createdAt as any)?.toDate();
            if (createdAt && createdAt > oneMonthAgo) {
                bookingsLastMonth++;
            }
            
            if (createdAt) {
                const day = createdAt.toISOString().split('T')[0];
                chartDataMap.set(day, (chartDataMap.get(day) || 0) + booking.totalPrice);
            }
        }

        serializableBookings.push({
            ...(booking as any),
            id: doc.id,
            checkIn: (booking.checkIn as any).toDate().toISOString(),
            checkOut: (booking.checkOut as any).toDate().toISOString(),
            createdAt: (booking.createdAt as any)?.toDate()?.toISOString() || new Date(0).toISOString(),
        });
    });

    const chartData = Array.from(chartDataMap.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    const recentBookings = serializableBookings.slice(0, 5);
    
    return { 
        totalRevenue, 
        totalBookings, 
        bookingsLastMonth, 
        totalUsers, 
        totalHotels,
        chartData,
        recentBookings,
    };
}
