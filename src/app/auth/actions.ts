'use server';

import { firebaseConfig } from '@/firebase/config';
import { type UserProfile } from '@/lib/types';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// --- Server-side Firebase Admin initialization ---
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const auth = getAuth(app);
const firestore = getFirestore(app);
// --- End of initialization ---


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

    try {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        // 2. Create user profile in Firestore.
        const userRef = doc(firestore, 'users', user.uid);
        const newUserProfile: UserProfile = {
            uid: user.uid,
            displayName: name,
            email: email, // Use email from input directly for safety
            mobile: mobile,
            role: 'user',
            status: 'active',
        };
        await setDoc(userRef, newUserProfile);
        
        return { success: true };

    } catch (error: any) {
        console.error("Error creating user:", error);
        let errorMessage = 'An unexpected error occurred during signup.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered. Please log in.';
        } else if (error.code) {
            errorMessage = error.code.replace('auth/', '').replace(/-/g, ' ');
        }
        return { success: false, error: errorMessage };
    }
}
