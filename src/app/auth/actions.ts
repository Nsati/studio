
'use server';

import { getAdminAuth, getAdminDb } from '@/firebase/admin';
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
    
    const auth = getAdminAuth();
    const db = getAdminDb();

    if (!auth || !db) {
        const errorMessage = 'Firebase Admin SDK is not initialized. User creation cannot proceed.';
        console.error(errorMessage);
        return { success: false, error: 'Server configuration error. Please contact support.' };
    }

    try {
        // Check if this is the first user to make them an admin
        const usersCollection = db.collection('users');
        const snapshot = await usersCollection.limit(1).get();
        const isFirstUser = snapshot.empty;

        // 1. Create user in Firebase Auth using Admin SDK
        const userRecord = await auth.createUser({
            email: email,
            password: pass,
            displayName: name,
            phoneNumber: `+91${mobile}` // E.164 format
        });

        // 2. Create user profile in Firestore.
        const userRef = db.collection('users').doc(userRecord.uid);
        const newUserProfile: UserProfile = {
            uid: userRecord.uid,
            displayName: name,
            email: email,
            mobile: mobile,
            role: isFirstUser ? 'admin' : 'user', // Set role based on whether they are the first user
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
