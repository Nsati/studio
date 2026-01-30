'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { Booking, Hotel, UserProfile } from '@/lib/types';

/**
 * Proper Admin Statistics fetching using Admin SDK.
 * This bypasses security rules and is restricted by the Server Action itself.
 */
export async function getAdminDashboardStats() {
  const { adminDb, error } = getFirebaseAdmin();
  if (error || !adminDb) throw new Error(error || 'Admin SDK not initialized');

  try {
    // Fetch all bookings across all users using collectionGroup
    const bookingsSnap = await adminDb.collectionGroup('bookings').orderBy('createdAt', 'desc').limit(50).get();
    const hotelsSnap = await adminDb.collection('hotels').get();
    const usersSnap = await adminDb.collection('users').get();

    const bookings = bookingsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Ensure dates are serializable
      checkIn: doc.data().checkIn?.toDate?.()?.toISOString() || doc.data().checkIn,
      checkOut: doc.data().checkOut?.toDate?.()?.toISOString() || doc.data().checkOut,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    })) as any[];

    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
    const totalRevenue = confirmedBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);

    return {
      stats: {
        totalRevenue,
        confirmedCount: confirmedBookings.length,
        hotelCount: hotelsSnap.size,
        userCount: usersSnap.size,
      },
      recentBookings: bookings.slice(0, 10),
    };
  } catch (e: any) {
    console.error('Error fetching admin stats:', e);
    throw new Error('Failed to load dashboard data.');
  }
}

/**
 * Fetches all bookings for the management table.
 */
export async function getAllBookingsForAdmin() {
  const { adminDb, error } = getFirebaseAdmin();
  if (error || !adminDb) throw new Error(error || 'Admin SDK not initialized');

  try {
    const snap = await adminDb.collectionGroup('bookings').orderBy('createdAt', 'desc').get();
    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      checkIn: doc.data().checkIn?.toDate?.()?.toISOString() || doc.data().checkIn,
      checkOut: doc.data().checkOut?.toDate?.()?.toISOString() || doc.data().checkOut,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));
  } catch (e: any) {
    console.error('Error fetching all bookings:', e);
    throw new Error('Failed to load reservations.');
  }
}
