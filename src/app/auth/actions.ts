
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


interface ActionResponse {
    success: boolean;
    error?: string;
}


// This is the main user creation logic. It should only be called after OTP verification.
async function createUser(userData: {
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

interface SendOtpResponse {
    success: boolean;
    error?: string;
    otp_id?: string;
    // For dev mode
    _otp?: string; 
}

export async function sendOtp(mobile: string): Promise<SendOtpResponse> {
    const apiKey = process.env.OTP_DEV_API_KEY;

    // In development or if key is missing, we don't send a real SMS
    if (!apiKey) {
        console.log('--- OTP (DEV MODE) ---');
        console.log(`otp.dev API Key not set. Using DEV MODE.`);
        const devOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const devOtpId = `dev_otp_${Date.now()}`;
        console.log(`Mobile: ${mobile}`);
        console.log(`OTP: ${devOtp}`);
        console.log(`OTP ID: ${devOtpId}`);
        console.log('----------------------');
        return { success: true, otp_id: devOtpId, _otp: devOtp };
    }
    
    const url = new URL('https://otp.dev/api/send');
    url.searchParams.append('key', apiKey);
    url.searchParams.append('recipient', mobile);
    
    try {
        const response = await fetch(url.toString(), { method: 'GET' });

        // Check if the response was successful (status code 200-299)
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`otp.dev API error: Status ${response.status}`, errorBody);
            if (response.status === 401 || response.status === 403) {
                 return { success: false, error: 'The provided API credentials for the OTP service are invalid. Please check your API key.' };
            }
            return { success: false, error: `The OTP service returned an error (Status: ${response.status}). Please try again later.` };
        }
        
        const data = await response.json();

        if (data.status === 'ok') {
            return { success: true, otp_id: data.otp_id };
        } else {
            console.error('otp.dev Error:', data.message);
            return { success: false, error: data.message || 'Failed to send OTP.' };
        }
    } catch (error: any) {
        console.error('Error sending OTP via otp.dev:', error);
         if (error instanceof SyntaxError) {
            // This specifically catches JSON parsing errors, which is the core of the "Unexpected token '<'" issue.
            return { success: false, error: 'An invalid response was received from the OTP service. This might be due to incorrect API credentials.' };
        }
        return { success: false, error: error.message || 'An unexpected error occurred while sending OTP.' };
    }
}

interface VerifyAndCreateUserArgs {
    otp_id: string;
    token: string;
    signupData: {
        name: string;
        email: string;
        mobile: string;
        pass: string;
    };
    // For dev mode
    _otp?: string;
}

export async function verifyOtpAndCreateUser({ otp_id, token, signupData, _otp }: VerifyAndCreateUserArgs): Promise<ActionResponse> {
    const apiKey = process.env.OTP_DEV_API_KEY;
    
    let isVerified = false;

    if (!apiKey && otp_id.startsWith('dev_otp_')) {
        // Dev mode verification
        console.log(`--- Verifying DEV OTP ---`);
        console.log(`Received token: ${token}, Expected token: ${_otp}`);
        if (token === _otp) {
            isVerified = true;
        }
    } else if (apiKey) {
        // Production verification
        const url = new URL('https://otp.dev/api/verify');
        url.searchParams.append('key', apiKey);
        url.searchParams.append('otp_id', otp_id);
        url.searchParams.append('token', token);

        try {
            const response = await fetch(url.toString(), { method: 'GET' });
            const data = await response.json();

            if (data.status === 'ok') {
                isVerified = true;
            } else {
                 return { success: false, error: data.message || 'Invalid OTP.' };
            }
        } catch (error: any) {
             console.error('Error verifying OTP with otp.dev:', error);
             return { success: false, error: 'Could not verify OTP.' };
        }
    } else {
        return { success: false, error: 'OTP verification is not configured correctly.' };
    }


    if (isVerified) {
        // If OTP is correct, proceed to create the user.
        return await createUser(signupData);
    } else {
        return { success: false, error: 'Invalid OTP. Please try again.' };
    }
}
