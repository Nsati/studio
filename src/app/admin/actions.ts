'use server';

import { getFirebaseAdmin } from '@/firebase/admin';

/**
 * Proper Admin Statistics fetching using Admin SDK.
 * This bypasses security rules and is restricted by the Server Action itself.
 * Optimized to handle empty collections and avoid index-related crashes.
 */
export async function getAdminDashboardStats() {
  const { adminDb, error } = getFirebaseAdmin();
  if (error || !adminDb) {
    console.error("[ADMIN ACTION] SDK Init Error:", error);
    throw new Error(error || 'Admin SDK not initialized');
  }

  try {
    // 1. Fetch Bookings (Simplified to avoid Index errors if no data exists)
    // Note: collectionGroup with orderBy requires a manual index in Firestore console.
    // Removing orderBy for initial stability and sorting in memory.
    const bookingsSnap = await adminDb.collectionGroup('bookings').limit(50).get();
    
    // 2. Fetch Hotels & Users
    const [hotelsSnap, usersSnap] = await Promise.all([
      adminDb.collection('hotels').get(),
      adminDb.collection('users').get()
    ]);

    const bookings = bookingsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Critical: Normalize timestamps for Server Action serialization
        checkIn: data.checkIn?.toDate?.()?.toISOString() || data.checkIn || null,
        checkOut: data.checkOut?.toDate?.()?.toISOString() || data.checkOut || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
      };
    });

    // In-memory sort to avoid "Missing Index" Firestore crashes
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
    console.error('[ADMIN ACTION] Critical Data Fetch Error:', e.message);
    throw new Error(`Platform Metrics Sync Failed: ${e.message}`);
  }
}

/**
 * Fetches all bookings for the management table.
 */
export async function getAllBookingsForAdmin() {
  const { adminDb, error } = getFirebaseAdmin();
  if (error || !adminDb) throw new Error(error || 'Admin SDK not initialized');

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

    // In-memory sort
    return bookings.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch (e: any) {
    console.error('[ADMIN ACTION] Bookings Retrieval Error:', e.message);
    throw new Error('Failed to load reservations list.');
  }
}
