
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';
import type { UserProfile } from '@/lib/types';
import { z } from 'zod';

/**
 * @fileOverview Hardened User & Admin Management Actions.
 * Robust serialization logic to prevent production JSON errors.
 */

type ActionResponse = {
    success: boolean;
    message: string;
}

export const UpdateUserSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  mobile: z.string().length(10, { message: 'Mobile number must be 10 digits.' }),
  role: z.enum(['user', 'admin']),
  status: z.enum(['pending', 'active', 'suspended']),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * Robust JSON serialization helper for complex Firestore types.
 */
function toPlainObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    // Handle Firestore Timestamps
    if (typeof obj.toDate === 'function') return obj.toDate().toISOString();
    // Handle ServerTimestamps/FieldValues (approximation for JSON)
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
    if (error || !adminDb) return { success: false, error: error || "Admin SDK Error" };

    try {
        const [hotelsSnap, usersSnap, bookingsSnap] = await Promise.all([
            adminDb.collection('hotels').get(),
            adminDb.collection('users').get(),
            adminDb.collectionGroup('bookings').orderBy('createdAt', 'desc').limit(5).get()
        ]);

        let totalRevenue = 0;
        let confirmedCount = 0;

        // Note: In production, we'd use a more efficient query for revenue
        const allBookings = await adminDb.collectionGroup('bookings').where('status', '==', 'CONFIRMED').get();
        allBookings.forEach(doc => {
            totalRevenue += Number(doc.data().totalPrice) || 0;
            confirmedCount++;
        });

        const recentBookings = bookingsSnap.docs.map(doc => ({
            id: doc.id,
            ...toPlainObject(doc.data())
        }));

        return {
            success: true,
            data: {
                stats: {
                    hotelCount: hotelsSnap.size,
                    userCount: usersSnap.size,
                    totalRevenue,
                    confirmedCount
                },
                recentBookings
            }
        };
    } catch (e: any) {
        console.error("Dashboard Stats Error:", e);
        return { success: false, error: e.message };
    }
}

export async function getAllBookingsForAdmin() {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) return { success: false, error: error || "Admin SDK Error" };

    try {
        const snapshot = await adminDb.collectionGroup('bookings').orderBy('createdAt', 'desc').get();
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...toPlainObject(doc.data())
        }));
        return { success: true, data };
    } catch (e: any) {
        console.error("Fetch All Bookings Error:", e);
        return { success: false, error: e.message };
    }
}

export async function getUserDetailsForAdmin(uid: string) {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) throw new Error(error || "Admin SDK Error");

    try {
        const userRef = adminDb.doc(`users/${uid}`);
        const userDoc = await userRef.get();

        if (!userDoc.exists) throw new Error("User profile not found.");

        const bookingsQuery = adminDb.collectionGroup('bookings').where('userId', '==', uid);
        const bookingsSnapshot = await bookingsQuery.get();

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

export async function updateUserByAdmin(uid: string, data: UpdateUserInput): Promise<ActionResponse> {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) return { success: false, message: error || "Admin SDK Error" };

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
