'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { withCache } from '@/lib/redis';

/**
 * @fileOverview High-performance Admin Analytics with Redis Caching & Strict Serialization.
 */

/**
 * Robust serialization helper to convert Firestore-specific types (Timestamps, etc.)
 * into plain JSON-compatible objects before passing to client components.
 */
const serialize = (val: any): any => {
    if (val === null || val === undefined) return null;
    
    // Handle Firestore Timestamp
    if (val && typeof val === 'object' && 'toDate' in val && typeof val.toDate === 'function') {
        return val.toDate().toISOString();
    }
    
    // Handle JS Date
    if (val instanceof Date) return val.toISOString();
    
    // Handle Arrays
    if (Array.isArray(val)) {
        return val.map(serialize);
    }
    
    // Handle Objects recursively
    if (typeof val === 'object' && val !== null) {
        const plain: any = {};
        for (const key in val) {
            if (Object.prototype.hasOwnProperty.call(val, key)) {
                plain[key] = serialize(val[key]);
            }
        }
        return plain;
    }
    
    return val;
};

export async function getAdminDashboardStats() {
  return withCache('admin_dashboard_stats_v5', 300, async () => {
    const { adminDb, error: sdkError } = getFirebaseAdmin();
    
    if (sdkError || !adminDb) {
        return { success: false, error: sdkError || 'Firebase Admin not connected.' };
    }

    try {
      // Fetching core data nodes
      const [bookingsSnap, hotelsSnap, usersSnap] = await Promise.all([
        adminDb.collectionGroup('bookings').limit(100).get(),
        adminDb.collection('hotels').get(),
        adminDb.collection('users').get()
      ]);

      const bookings = bookingsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || '',
          customerName: data.customerName || 'Explorer',
          customerEmail: data.customerEmail || '',
          hotelName: data.hotelName || 'Property',
          roomType: data.roomType || '',
          totalPrice: Number(data.totalPrice) || 0,
          status: data.status || 'PENDING',
          checkIn: serialize(data.checkIn),
          checkOut: serialize(data.checkOut),
          createdAt: serialize(data.createdAt),
        };
      });

      // Sort by recent first
      bookings.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      const confirmedBookings = bookings.filter((b: any) => b.status === 'CONFIRMED');
      const totalRevenue = confirmedBookings.reduce((acc: number, b: any) => acc + (Number(b.totalPrice) || 0), 0);

      return {
        success: true,
        data: {
          stats: {
            totalRevenue,
            confirmedCount: confirmedBookings.length,
            hotelCount: hotelsSnap.size,
            userCount: usersSnap.size,
          },
          recentBookings: bookings.slice(0, 10),
        }
      };
    } catch (e: any) {
      console.error('[ADMIN ANALYTICS] Production Fetch Failure:', e.message);
      return { success: false, error: e.message };
    }
  });
}

export async function getAllBookingsForAdmin() {
  return withCache('admin_all_bookings_v5', 60, async () => {
    const { adminDb, error: sdkError } = getFirebaseAdmin();
    if (sdkError || !adminDb) return { success: false, error: sdkError };

    try {
      const snap = await adminDb.collectionGroup('bookings').get();
      const bookings = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || '',
          customerName: data.customerName || 'Explorer',
          customerEmail: data.customerEmail || '',
          hotelName: data.hotelName || 'Property',
          roomType: data.roomType || '',
          totalPrice: Number(data.totalPrice) || 0,
          status: data.status || 'PENDING',
          checkIn: serialize(data.checkIn),
          checkOut: serialize(data.checkOut),
          createdAt: serialize(data.createdAt),
          guests: data.guests || 1
        };
      });

      bookings.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      return { success: true, data: bookings };
    } catch (e: any) {
      console.error('[ADMIN INVENTORY] Production Retrieval Failure:', e.message);
      return { success: false, error: e.message };
    }
  });
}
