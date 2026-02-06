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
    const { adminDb, error: adminError } = getFirebaseAdmin();
    if (adminError || !adminDb) {
        throw new Error(adminError || "Admin SDK not initialized");
    }

    try {
        const userRef = adminDb.doc(`users/${uid}`);
        // Hardened Query Logic to prevent logic clashing
        const userBookingsQuery = adminDb.collectionGroup('bookings').where('userId', '==', uid);

        const [userDoc, bookingsSnapshot] = await Promise.all([
            userRef.get(),
            userBookingsQuery.get(), 
        ]);

        if (!userDoc.exists) {
            throw new Error("User profile node missing in Tripzy cloud.");
        }

        const userProfileData = userDoc.data() as UserProfile;
        let revenueSum = 0;
        let bookingsCount = 0;

        bookingsSnapshot.forEach(doc => {
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
