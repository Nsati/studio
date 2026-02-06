'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';
import type { UserProfile } from '@/lib/types';
import { z } from 'zod';

/**
 * @fileOverview Hardened User Management Actions for Tripzy.
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

export async function getUserDetailsForAdmin(uid: string): Promise<UserDetailsForAdmin> {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) {
        throw new Error(error || "Admin SDK not initialized");
    }

    try {
        const userRef = adminDb.doc(`users/${uid}`);
        const statsQuery = adminDb.collectionGroup('bookings').where('userId', '==', uid);

        const [userDoc, statsSnapshot] = await Promise.all([
            userRef.get(),
            statsQuery.get(), 
        ]);

        if (!userDoc.exists) {
            throw new Error("User not found.");
        }

        const userProfileData = userDoc.data() as UserProfile;
        let revenueSum = 0;
        let bookingsCount = 0;

        statsSnapshot.forEach(doc => {
            const booking = doc.data() as any;
            if (booking.status === 'CONFIRMED') {
                bookingsCount++;
                revenueSum += Number(booking.totalPrice) || 0;
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
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) {
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
