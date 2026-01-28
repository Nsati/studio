
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { UserProfile, Booking } from '@/lib/types';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export const UpdateUserSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters."),
  mobile: z.string().length(10, "Mobile must be 10 digits."),
  role: z.enum(['user', 'admin']),
  status: z.enum(['pending', 'active']),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

interface UserDetailsForAdmin extends UserProfile {
    totalRevenue: number;
    totalBookings: number;
}

/**
 * Fetches a user's profile and calculates their total booking revenue and count.
 * This is a secure server action for admin use only.
 */
export async function getUserDetailsForAdmin(userId: string): Promise<UserDetailsForAdmin> {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) {
        throw new Error(error || "Admin SDK not initialized");
    }

    // Fetch user profile and bookings in parallel
    const userRef = adminDb.doc(`users/${userId}`);
    const bookingsQuery = adminDb.collection(`users/${userId}/bookings`);

    const [userDoc, bookingsSnapshot] = await Promise.all([
        userRef.get(),
        bookingsQuery.get()
    ]);

    if (!userDoc.exists) {
        throw new Error('User not found');
    }

    let totalRevenue = 0;
    let totalBookings = 0;

    bookingsSnapshot.forEach(doc => {
        const booking = doc.data() as Booking;
        if (booking.status === 'CONFIRMED') {
            totalRevenue += booking.totalPrice;
            totalBookings++;
        }
    });

    const userProfile = userDoc.data() as UserProfile;
    
    return {
        ...userProfile,
        totalRevenue,
        totalBookings
    };
}


/**
 * Updates a user's profile from the admin panel.
 * Uses the Admin SDK to bypass security rules.
 */
export async function updateUserByAdmin(userId: string, data: UpdateUserInput): Promise<{ success: boolean; message: string }> {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) {
        return { success: false, message: error || "Admin SDK not initialized" };
    }

    try {
        const validation = UpdateUserSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
        }

        const userRef = adminDb.doc(`users/${userId}`);
        await userRef.update(validation.data);
        
        // Revalidate paths to show updated data immediately
        revalidatePath(`/admin/users`);
        revalidatePath(`/admin/users/${userId}/edit`);

        return { success: true, message: 'User updated successfully.' };
    } catch (e: any) {
        console.error("Error updating user by admin:", e);
        return { success: false, message: e.message || "An unknown error occurred." };
    }
}
