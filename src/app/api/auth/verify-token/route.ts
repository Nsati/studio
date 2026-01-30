import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import type { UserProfile } from '@/lib/types';

/**
 * @fileOverview Auth Verification API
 * 
 * Securely verifies Google ID Tokens and synchronizes Firestore user profiles.
 */

export async function POST(req: Request) {
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

    // 1. Verify the JWT from Google
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return NextResponse.json({ error: 'Email not provided by identity provider' }, { status: 400 });
    }

    // 2. Database Sync
    const userRef = adminDb.doc(`users/${uid}`);
    const userDoc = await userRef.get();

    let userProfile: UserProfile;

    if (!userDoc.exists) {
      // Create user profile if it doesn't exist (Auto-registration)
      userProfile = {
        uid,
        displayName: name || 'Himalayan Explorer',
        email: email,
        mobile: '', 
        role: 'user',
        status: 'active',
      };
      
      await userRef.set(userProfile);
      console.log(`[AUTH] New user profile created: ${email}`);
    } else {
      // Return existing profile
      userProfile = userDoc.data() as UserProfile;
      console.log(`[AUTH] Profile synced for existing user: ${email}`);
    }

    return NextResponse.json({ 
      success: true, 
      user: userProfile 
    });

  } catch (error: any) {
    console.error('[AUTH ERROR] Token verification failed:', error.message);
    
    const errorMessage = error.code === 'auth/id-token-expired' 
      ? 'Your session has expired. Please log in again.'
      : 'Unauthorized: Invalid authentication token.';

    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
}
