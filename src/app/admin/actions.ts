
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';
import type { UserProfile } from '@/lib/types';
import { z } from 'zod';

/**
 * @fileOverview Hardened User Management Actions.
 * Improved serialization logic to prevent production JSON errors.
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

interface UserDetailsForAdmin extends UserProfile {
    totalRevenue: number;
    totalBookings: number;
}

/**
 * Robust JSON serialization helper for complex Firestore types.
 */
function toPlainObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj.toDate && typeof obj.toDate === 'function') return obj.toDate().toISOString();
    if (Array.isArray(obj)) return obj.map(toPlainObject);
    
    const plain: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            plain[key] = toPlainObject(obj[key]);
        }
    }
    return plain;
}

export async function getUserDetailsForAdmin(uid: string): Promise<UserDetailsForAdmin> {
    const { adminDb, error: adminError } = getFirebaseAdmin();
    if (adminError || !adminDb) {
        throw new Error(adminError || "Admin SDK not initialized");
    }

    try {
        const userRef = adminDb.doc(`users/${uid}`);
        const bookingsQuery = adminDb.collectionGroup('bookings').where('userId', '==', uid);

        const [userDoc, bookingsSnapshot] = await Promise.all([
            userRef.get(),
            bookingsQuery.get(), 
        ]);

        if (!userDoc.exists) {
            throw new Error("User profile not found.");
        }

        const userProfileData = toPlainObject(userDoc.data());
        let revenueSum = 0;
        let bookingsCount = 0;

        bookingsSnapshot.forEach(docSnap => {
            const b = docSnap.data() as any;
            if (b.status === 'CONFIRMED') {
                bookingsCount++;
                revenueSum += Number(b.totalPrice) || 0;
            }
        });

        return {
            ...userProfileData,
            totalRevenue: revenueSum,
            totalBookings: bookingsCount,
        };
    } catch (e: any) {
        console.error("[ADMIN USER ACTION] Fetch Failure:", e.message);
        throw e;
    }
}

export async function updateUserByAdmin(uid: string, data: UpdateUserInput): Promise<ActionResponse> {
    const { adminDb, error: adminError } = getFirebaseAdmin();
    if (adminError || !adminDb) {
        return { success: false, message: adminError || "Admin SDK not initialized" };
    }

    const validation = UpdateUserSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }

    try {
        const userRef = adminDb.doc(`users/${uid}`);
        await userRef.update(validation.data);

        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${uid}/edit`);

        return { success: true, message: 'User profile updated successfully.' };
    } catch (e: any) {
        console.error("Failed to update user profile:", e);
        return { success: false, message: e.message || 'An unexpected error occurred.' };
    }
}
