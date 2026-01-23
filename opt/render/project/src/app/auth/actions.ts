'use server';

import { adminAuth, adminDb } from '@/firebase/admin';
import type { UserProfile } from '@/lib/types';

export interface SignupActionResponse {
    success: boolean;
    error?: string;
}

export async function signupUser(userData: {
  name: string;
  email: string;
  mobile: string;
  pass: string;
}): Promise<SignupActionResponse> {
    const { name, email, mobile, pass } = userData;

    if (!adminAuth || !adminDb) {
        const errorMessage = 'Firebase Admin SDK is not initialized. User creation cannot proceed.';
        console.error(errorMessage);
        return { success: false, error: 'Server configuration error. Please contact support.' };
    }

    try {
        // 1. Create user in Firebase Auth using Admin SDK
        const userRecord = await adminAuth.createUser({
            email: email,
            password: pass,
            displayName: name,
            phoneNumber: `+91${mobile}` // E.164 format
        });

        // 2. Create user profile in Firestore.
        const userRef = adminDb.collection('users').doc(userRecord.uid);
        const newUserProfile: UserProfile = {
            uid: userRecord.uid,
            displayName: name,
            email: email,
            mobile: mobile,
            role: 'user',
            status: 'active',
        };
        await userRef.set(newUserProfile);
        
        return { success: true };

    } catch (error: any) {
        console.error("Error creating user:", error);
        let errorMessage = 'An unexpected error occurred during signup.';
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'This email is already registered. Please log in.';
        } else if (error.code) {
            errorMessage = error.code.replace('auth/', '').replace(/-/g, ' ');
        }
        return { success: false, error: errorMessage };
    }
}
