
import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import type { UserProfile } from '@/lib/types';

/**
 * @fileOverview Auth Verification API (The "Backend")
 * Matches the requirement: "Backend should verify token and create user if not exists"
 */

export async function POST(req: Request) {
  const { adminDb, adminAuth, error: adminError } = getFirebaseAdmin();

  if (adminError || !adminAuth || !adminDb) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Token missing' }, { status: 400 });
    }

    // 1. Verify the ID Token (Passport.js equivalent in Firebase)
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return NextResponse.json({ error: 'Email not provided by Google' }, { status: 400 });
    }

    // 2. Check if user exists in Firestore (MongoDB equivalent)
    const userRef = adminDb.doc(`users/${uid}`);
    const userDoc = await userRef.get();

    let userProfile: UserProfile;

    if (!userDoc.exists) {
      // 3. Create user if not exists (Auto-registration)
      userProfile = {
        uid,
        displayName: name || 'Guest User',
        email: email,
        mobile: '', 
        role: 'user',
        status: 'active',
      };
      await userRef.set(userProfile);
      console.log(`New user created via Google: ${email}`);
    } else {
      userProfile = userDoc.data() as UserProfile;
    }

    // 4. Return success (Firebase handles the secure session/JWT rotation)
    return NextResponse.json({ 
      success: true, 
      user: userProfile 
    });

  } catch (error: any) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ error: 'Unauthorized or invalid token' }, { status: 401 });
  }
}
