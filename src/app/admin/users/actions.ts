
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';
import type { UserProfile } from '@/lib/types';
import { UpdateUserSchema, type UpdateUserInput } from '../schemas';

/**
 * @fileOverview Hardened User Management Actions for Northern Harrier.
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
 */
export async function getUserDetailsForAdmin(uid: string): Promise<UserDetailsForAdmin> {
    const { adminDb, error: adminError } = getFirebaseAdmin();
    if (adminError || !adminDb) {
        throw new Error(adminError || "Admin SDK not initialized");
    }

    try {
        const userRef = adminDb.doc(`users/${uid}`);
        const bookingsQuery = adminDb.collection(`users/${uid}/bookings`);

        const [userDoc, bookingsSnapshot] = await Promise.all([
            userRef.get(),
            bookingsQuery.get(), 
        ]);

        if (!userDoc.exists) {
            throw new Error("User profile node missing in cloud.");
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
        console.error("[ADMIN USER ACTION] Fetch Failure:", e.message);
        throw e;
    }
}

/**
 * Updates a user's profile details.
 */
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

        return { success: true, message: 'Explorer profile synchronized successfully.' };
    } catch (e: any) {
        console.error("Failed to update user profile:", e);
        return { success: false, message: e.message || 'Update failed.' };
    }
}

/**
 * Permanently purges a user from both Firebase Auth and Firestore.
 */
export async function deleteUserByAdmin(uid: string): Promise<ActionResponse> {
    const { adminDb, adminAuth, error: adminError } = getFirebaseAdmin();
    
    if (adminError || !adminDb || !adminAuth) {
        return { success: false, message: adminError || "Admin SDK not initialized" };
    }

    try {
        // 1. Delete from Firebase Auth
        await adminAuth.deleteUser(uid);
        
        // 2. Delete Firestore Profile Node
        await adminDb.doc(`users/${uid}`).delete();

        // 3. Revalidate List
        revalidatePath('/admin/users');
        
        return { success: true, message: 'Explorer node and authentication records purged from the cloud.' };
    } catch (e: any) {
        console.error("[ADMIN PURGE ERROR]:", e.message);
        return { success: false, message: e.message || 'Cloud synchronization failure during purge.' };
    }
}
