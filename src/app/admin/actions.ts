
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';
import { UpdateUserSchema, type UpdateUserInput } from './schemas';

/**
 * Robust JSON serialization helper for complex Firestore types.
 * Converts Timestamps and FieldValues to plain strings/numbers for Next.js stability.
 */
function toPlainObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    
    // Handle Firestore Timestamps from Admin SDK
    if (typeof obj.toDate === 'function') return obj.toDate().toISOString();
    
    // Handle raw seconds/nanoseconds (Admin SDK internal state)
    if (obj._seconds !== undefined) return new Date(obj._seconds * 1000).toISOString();
    
    if (Array.isArray(obj)) return obj.map(toPlainObject);
    
    const plain: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            plain[key] = toPlainObject(obj[key]);
        }
    }
    return plain;
}

export async function getAdminDashboardStats() {
    const { adminDb, error } = getFirebaseAdmin();
    
    if (error || !adminDb) {
        return { 
            success: false, 
            error: "Tripzy Cloud Bridge not configured. Please check FIREBASE_PRIVATE_KEY environment variable.",
            isConfigError: true
        };
    }

    try {
        const [hotelsSnap, usersSnap, packagesSnap] = await Promise.all([
            adminDb.collection('hotels').get(),
            adminDb.collection('users').get(),
            adminDb.collection('tourPackages').get()
        ]);

        let totalRevenue = 0;
        let confirmedCount = 0;
        let recentBookings: any[] = [];

        try {
            const bookingsSnap = await adminDb.collectionGroup('bookings').limit(20).get();
            
            bookingsSnap.forEach(doc => {
                const data = doc.data();
                if (data.status === 'CONFIRMED') {
                    totalRevenue += Number(data.totalPrice) || 0;
                    confirmedCount++;
                }
                recentBookings.push({
                    id: doc.id,
                    ...toPlainObject(data)
                });
            });

            recentBookings.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            });
            
            recentBookings = recentBookings.slice(0, 10);
            
        } catch (bookingErr: any) {
            console.warn("Booking Fetch Warning (Likely missing index):", bookingErr.message);
        }

        return {
            success: true,
            data: {
                stats: {
                    hotelCount: hotelsSnap.size,
                    userCount: usersSnap.size,
                    packageCount: packagesSnap.size,
                    totalRevenue,
                    confirmedCount
                },
                recentBookings
            }
        };
    } catch (e: any) {
        console.error("Dashboard Stats Error:", e);
        return { success: false, error: "Database query failed: " + e.message };
    }
}

export async function getAllBookingsForAdmin() {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) return { success: false, error: "Admin SDK Configuration Missing" };

    try {
        const snapshot = await adminDb.collectionGroup('bookings').get();
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...toPlainObject(doc.data())
        }));

        data.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        return { success: true, data };
    } catch (e: any) {
        console.error("Fetch All Bookings Error:", e);
        return { success: false, error: e.message };
    }
}

export async function getUserDetailsForAdmin(uid: string) {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) throw new Error("Admin SDK Configuration Missing");

    try {
        const userRef = adminDb.doc(`users/${uid}`);
        const userDoc = await userRef.get();

        if (!userDoc.exists) throw new Error("User profile not found.");

        const bookingsSnapshot = await adminDb.collectionGroup('bookings').where('userId', '==', uid).get();

        let revenueSum = 0;
        let bookingsCount = 0;

        bookingsSnapshot.forEach(docSnap => {
            const b = docSnap.data();
            if (b.status === 'CONFIRMED') {
                bookingsCount++;
                revenueSum += Number(b.totalPrice) || 0;
            }
        });

        return {
            ...toPlainObject(userDoc.data()),
            totalRevenue: revenueSum,
            totalBookings: bookingsCount,
        };
    } catch (e: any) {
        console.error("User Details Error:", e);
        throw e;
    }
}

export async function updateUserByAdmin(uid: string, data: UpdateUserInput) {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) return { success: false, message: "Admin SDK Configuration Missing" };

    const validation = UpdateUserSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }

    try {
        const userRef = adminDb.doc(`users/${uid}`);
        await userRef.update(validation.data);

        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${uid}/edit`);

        return { success: true, message: 'User updated successfully.' };
    } catch (e: any) {
        return { success: false, message: e.message || 'Update failed.' };
    }
}
