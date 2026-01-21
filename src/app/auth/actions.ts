'use server';

import { initializeFirebase } from '@/firebase';
import {
  doc,
  writeBatch,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
} from 'firebase/firestore';
import crypto from 'crypto';

interface ActionResponse {
  success: boolean;
  error?: string;
}

interface SendOtpPayload {
  userId: string;
  email: string;
  name: string;
}

export async function sendOtpAction(
  payload: SendOtpPayload
): Promise<ActionResponse> {
  const { firestore } = initializeFirebase();
  const { userId, email, name } = payload;

  try {
    const batch = writeBatch(firestore);

    // 1. Create User Profile with pending status
    const userRef = doc(firestore, 'users', userId);
    batch.set(userRef, {
      uid: userId,
      displayName: name,
      email: email,
      role: 'user',
      status: 'pending',
    });

    // 2. Generate and store OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Timestamp.fromMillis(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
    const otpRef = doc(firestore, 'otp_verification', userId);
    // In a real app, hash the OTP before storing. For this demo, we'll store it in plaintext.
    batch.set(otpRef, {
      otp: otp, // HASH THIS in production: await bcrypt.hash(otp, 10)
      expires: otpExpires,
    });

    await batch.commit();

    // 3. Send OTP email (logging to console for demonstration)
    console.log('--- SENDING OTP EMAIL ---');
    console.log(`To: ${email}`);
    console.log(`Subject: Your Verification Code`);
    console.log(
      `Your verification code for Uttarakhand Getaways is: ${otp}. It is valid for 5 minutes.`
    );
    console.log('--- In production, this would be sent via an email service ---');

    return { success: true };
  } catch (error: any) {
    console.error('Error in sendOtpAction: ', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred.',
    };
  }
}

interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export async function verifyOtpAction(
  payload: VerifyOtpPayload
): Promise<ActionResponse> {
  const { firestore } = initializeFirebase();
  const { email, otp } = payload;

  try {
    // Find user by email to get their UID
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'User not found.' };
    }
    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    // Use a transaction to verify and activate atomically
    await runTransaction(firestore, async (transaction) => {
      const otpRef = doc(firestore, 'otp_verification', userId);
      const userRef = doc(firestore, 'users', userId);

      const otpDoc = await transaction.get(otpRef);

      if (!otpDoc.exists()) {
        throw new Error('OTP not found or already used. Please request a new one.');
      }

      const { otp: storedOtp, expires } = otpDoc.data();

      if ((expires as Timestamp).toMillis() < Date.now()) {
        throw new Error('OTP has expired. Please request a new one.');
      }
      
      // In production, you'd use bcrypt.compare(otp, storedOtp)
      if (storedOtp !== otp) {
        throw new Error('Invalid OTP. Please try again.');
      }

      // If all checks pass, activate user and delete OTP
      transaction.update(userRef, { status: 'active' });
      transaction.delete(otpRef);
    });

    return { success: true };

  } catch (error: any) {
    console.error('Error in verifyOtpAction: ', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during verification.',
    };
  }
}
