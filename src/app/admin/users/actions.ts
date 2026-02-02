'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';
import type { UserProfile, Booking } from '@/lib/types';
import { z } from 'zod';

type ActionResponse = {
    success: boolean;
    message: string;
}

export const UpdateUserSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
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
 * Fetches a user's profile and calculates their booking stats.
 * This is a secure server action for admin use only.
 */
export async function getUserDetailsForAdmin(uid: string): Promise<UserDetailsForAdmin> {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) {
        console.error("Server action error:", error);
        throw new Error(error || "Admin SDK not initialized");
    }

    const userRef = adminDb.doc(`users/${uid}`);
    const bookingsRef = adminDb.collectionGroup('bookings').where('userId', '==', uid);

    // Fixed: calling .get() on the reference (bookingsRef), not the result (bookingsSnap)
    const [userDoc, bookingsSnap] = await Promise.all([
        userRef.get(),
        bookingsRef.get(),
    ]);

    if (!userDoc.exists) {
        throw new Error("User not found.");
    }

    const userProfile = userDoc.data() as UserProfile;
    let totalRevenue = 0;
    let totalBookings = 0;

    bookingsSnap.forEach(doc => {
        const booking = doc.data() as any;
        if (booking.status === 'CONFIRMED') {
            totalBookings++;
            totalRevenue += Number(booking.totalPrice) || 0;
        }
    });

    return {
        ...userProfile,
        totalRevenue,
        totalBookings,
    };
}


/**
 * Updates a user's profile details as an admin.
 * This is a secure server action.
 */
export async function updateUserByAdmin(uid: string, data: UpdateUserInput): Promise<ActionResponse> {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) {
        console.error("Server action error:", error);
        return { success: false, message: error || "Admin SDK not initialized" };
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
