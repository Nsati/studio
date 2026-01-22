'use server';

import { firebaseConfig } from '@/firebase/config';
import { type UserProfile } from '@/lib/types';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// This is a server-side only file.

// --- Server-side Firebase Admin initialization ---
// We use the client SDK here but initialized on the server.
// In a real production app with a separate backend, you would use the Admin SDK.
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const auth = getAuth(app);
const firestore = getFirestore(app);
// --- End of initialization ---


interface ActionResponse {
    success: boolean;
    error?: string;
    otp?: number; // Only for dev mode
}


export async function sendOtp(mobile: string): Promise<ActionResponse> {
    const authKey = process.env.AUTHKEY_API_KEY;
    const senderId = process.env.AUTHKEY_SENDER_ID;
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
    const smsContent = `Your OTP for Uttarakhand Getaways is ${otp}. Do not share this with anyone.`;

    // In development or if keys are missing, we don't send a real SMS
    if (!authKey || !senderId) {
        console.log('--- OTP (DEV MODE) ---');
        console.log(`Mobile: ${mobile}`);
        console.log(`OTP: ${otp}`);
        console.log('----------------------');
        return { success: true, otp: otp }; // Return OTP for testing
    }
    
    const url = new URL('https://console.authkey.io/request');
    url.searchParams.append('authkey', authKey);
    url.searchParams.append('mobile', mobile);
    url.searchParams.append('country_code', '91');
    url.searchParams.append('sms', smsContent);
    url.searchParams.append('sender', senderId);

    try {
        const response = await fetch(url.toString(), { method: 'GET' });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Authkey.io API request failed with status ${response.status}:`, errorText);
            throw new Error('Failed to communicate with OTP service. Please try again later.');
        }

        const data = await response.json();

        if (data.Status === 'Success') {
            // In a real production scenario, you would NOT return the OTP to the client.
            // It would be stored in a secure, temporary location (e.g., a separate Firestore doc with a TTL, or a server-side session).
            // For the purpose of this demo, we return it to the client to verify on the next step.
            return { success: true, otp: otp };
        } else {
            console.error('Authkey Error:', data.Msg);
            return { success: false, error: data.Msg || 'Failed to send OTP. Please check the credentials and mobile number.' };
        }
    } catch (error: any) {
        console.error('Error sending OTP:', error);
        // This will catch the `response.json()` error if the body is not JSON, or the error thrown from !response.ok
        return { success: false, error: error.message || 'An unexpected error occurred while sending OTP.' };
    }
}


export async function createUser(userData: {
  name: string;
  email: string;
  mobile: string;
  pass: string;
}): Promise<ActionResponse> {
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
