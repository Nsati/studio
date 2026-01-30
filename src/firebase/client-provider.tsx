'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    try {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        
        // --- NUCLEAR DEBUG LOGS ---
        console.log("🔥 [FIREBASE INIT] APP NAME:", app.name);
        console.log("🔥 [FIREBASE INIT] PROJECT ID:", app.options.projectId);
        console.log("🔥 [FIREBASE INIT] API KEY:", app.options.apiKey?.substring(0, 10) + "...");
        // ---------------------------

        const auth = getAuth(app);
        const firestore = getFirestore(app);
        setServices({ firebaseApp: app, auth, firestore });
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
  }, []);

  if (!services) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <p className="font-bold animate-pulse">Initializing Himalayan Gateway...</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Verifying Connection</p>
            </div>
        </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}