'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';

type ActionResponse = {
    success: boolean;
    message: string;
}

export async function updateUserRole(uid: string, role: 'user' | 'admin'): Promise<ActionResponse> {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) {
        console.error("Server action error:", error);
        return { success: false, message: error || "Admin SDK not initialized" };
    }
    
    try {
        const userRef = adminDb.doc(`users/${uid}`);
        await userRef.update({ role });

        revalidatePath('/admin/users'); // Revalidate the user page to show updated data

        return { success: true, message: 'User role updated successfully.' };
    } catch (e: any) {
        console.error("Failed to update user role:", e);
        return { success: false, message: e.message || 'An unexpected error occurred.' };
    }
}
