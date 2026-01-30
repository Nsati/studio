
import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import type { UserProfile } from '@/lib/types';

/**
 * @fileOverview Auth Verification API (The "Backend" / Express equivalent)
 * 
 * This route handles the secure verification of Google ID Tokens.
 * It follows the requirement: "Backend should verify token and create user if not exists"
 */

export async function POST(req: Request) {
  // Initialize Admin SDK services
  const { adminDb, adminAuth, error: adminError } = getFirebaseAdmin();

  if (adminError || !adminAuth || !adminDb) {
    return NextResponse.json(
      { error: 'Server configuration error: Firebase Admin not initialized' },
      { status: 500 }
    );
  }

  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Token missing' }, { status: 400 });
    }

    // 1. VERIFY JWT (Passport.js functionality)
    // The Admin SDK verifies the signature, expiration, and audience of the JWT.
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    if (!email) {
      return NextResponse.json({ error: 'Email not provided by Google' }, { status: 400 });
    }

    // 2. DATABASE SYNC (MongoDB/Mongoose functionality)
    // We check if the user exists in Firestore and create them if not.
    const userRef = adminDb.doc(`users/${uid}`);
    const userDoc = await userRef.get();

    let userProfile: UserProfile;

    if (!userDoc.exists) {
      // Create user profile (Auto-registration / email-based)
      userProfile = {
        uid,
        displayName: name || 'Himalayan Explorer',
        email: email,
        mobile: '', 
        role: 'user',
        status: 'active',
      };
      
      // Atomic write to database
      await userRef.set(userProfile);
      console.log(`[AUTH] New user registered via Google: ${email}`);
    } else {
      userProfile = userDoc.data() as UserProfile;
      console.log(`[AUTH] Existing user logged in: ${email}`);
    }

    // 3. RETURN SUCCESS
    // The client now has a verified session managed by Firebase.
    return NextResponse.json({ 
      success: true, 
      user: userProfile 
    });

  } catch (error: any) {
    console.error('[AUTH ERROR] Token verification failed:', error.message);
    
    // Check for specific JWT errors
    const errorMessage = error.code === 'auth/id-token-expired' 
      ? 'Your session has expired. Please log in again.'
      : 'Unauthorized: Invalid authentication token.';

    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
}
