
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';
import type { UserProfile } from '@/lib/types';
import { UpdateUserSchema, type UpdateUserInput } from '../schemas';

/**
 * @fileOverview Hardened User Management Actions for Tripzy.
 * Resolved COLLECTION_GROUP index error by using direct sub-collection access.
 */

type ActionResponse = {
    success: boolean;
    message: string;
}

interface UserDetailsForAdmin extends UserProfile {
    totalRevenue: number;
    totalBookings: number;
}

/**
 * Fetches user details and their associated bookings.
 * FIXED: Replaced collectionGroup query with direct sub-collection access to avoid index errors.
 */
export async function getUserDetailsForAdmin(uid: string): Promise<UserDetailsForAdmin> {
    const { adminDb, error: adminError } = getFirebaseAdmin();
    if (adminError || !adminDb) {
        throw new Error(adminError || "Admin SDK not initialized");
    }

    try {
        const userRef = adminDb.doc(`users/${uid}`);
        // Instead of searching globally (collectionGroup), we query the specific user's sub-collection
        // This avoids the need for a COLLECTION_GROUP_ASC index on 'userId'.
        const bookingsQuery = adminDb.collection(`users/${uid}/bookings`);

        const [userDoc, bookingsSnapshot] = await Promise.all([
            userRef.get(),
            bookingsQuery.get(), 
        ]);

        if (!userDoc.exists) {
            throw new Error("User profile node missing in Tripzy cloud.");
        }

        const userProfileData = userDoc.data() as UserProfile;
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
        console.error("[ADMIN USER ACTION] Production Fetch Failure:", e.message);
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

        return { success: true, message: 'Tripzy Explorer profile synchronized successfully.' };
    } catch (e: any) {
        console.error("Failed to update user profile:", e);
        return { success: false, message: e.message || 'An unexpected error occurred during record sync.' };
    }
}
