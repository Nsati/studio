'use server';

import { getFirebaseAdmin } from '@/firebase/admin';

/**
 * @fileOverview High-performance Admin Analytics & Data Aggregation.
 * Executes on the server using Admin SDK to bypass security rules safely.
 */

export async function getAdminDashboardStats() {
  const { adminDb, error } = getFirebaseAdmin();
  if (error || !adminDb) throw new Error(error || 'Platform link failure.');

  try {
    // Parallel fetching for high performance
    const [bookingsSnap, hotelsSnap, usersSnap] = await Promise.all([
      adminDb.collectionGroup('bookings').limit(100).get(),
      adminDb.collection('hotels').get(),
      adminDb.collection('users').get()
    ]);

    const bookings = bookingsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        checkIn: data.checkIn?.toDate?.()?.toISOString() || data.checkIn || null,
        checkOut: data.checkOut?.toDate?.()?.toISOString() || data.checkOut || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
      };
    });

    // Memory-side sorting to avoid Firestore Index requirements for collectionGroups
    bookings.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    const confirmedBookings = bookings.filter((b: any) => b.status === 'CONFIRMED');
    const totalRevenue = confirmedBookings.reduce((acc: number, b: any) => acc + (Number(b.totalPrice) || 0), 0);

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
    console.error('[ADMIN ANALYTICS] Fetch Failure:', e.message);
    throw new Error('Platform metrics sync failed. Please try again.');
  }
}

export async function getAllBookingsForAdmin() {
  const { adminDb, error } = getFirebaseAdmin();
  if (error || !adminDb) throw new Error(error || 'Platform link failure.');

  try {
    const snap = await adminDb.collectionGroup('bookings').get();
    const bookings = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        checkIn: data.checkIn?.toDate?.()?.toISOString() || data.checkIn || null,
        checkOut: data.checkOut?.toDate?.()?.toISOString() || data.checkOut || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
      };
    });

    return bookings.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch (e: any) {
    console.error('[ADMIN INVENTORY] Retrieval Failure:', e.message);
    throw new Error('Inventory sync failed.');
  }
}
