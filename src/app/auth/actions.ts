'use server';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';


export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const { auth, firestore } = initializeFirebase();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's profile with their name
    await updateProfile(user, { displayName: name });

    // Create a user profile document in Firestore
    const userProfile: UserProfile = {
      id: user.uid,
      displayName: name,
      email: user.email!,
      role: 'user', // Default role
    };
    const userDocRef = doc(firestore, 'users', user.uid);
    await setDoc(userDocRef, userProfile);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const { auth } = initializeFirebase();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
