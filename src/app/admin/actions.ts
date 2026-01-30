'use server';

import { getFirebaseAdmin } from '@/firebase/admin';

/**
 * @fileOverview High-performance Admin Analytics & Data Aggregation.
 * Executes on the server using Admin SDK to bypass security rules safely.
 */

// Helper to convert any Firestore value into a safe serializable string/number
const serialize = (val: any) => {
    if (!val) return null;
    if (typeof val.toDate === 'function') return val.toDate().toISOString();
    if (val instanceof Date) return val.toISOString();
    return val;
};

export async function getAdminDashboardStats() {
  const { adminDb, error } = getFirebaseAdmin();
  if (error || !adminDb) {
      console.error("[ADMIN ACTION] SDK Error:", error);
      throw new Error(error || 'Failed to connect to Firebase Admin.');
  }

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
    throw new Error('Data retrieval failed. Check if collectionGroup indices are required in Firebase Console.');
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
