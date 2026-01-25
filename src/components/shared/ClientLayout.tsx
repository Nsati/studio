'use client';

import dynamic from 'next/dynamic';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// Dynamically import the Firebase provider to ensure it only runs on the client.
const DynamicFirebaseProvider = dynamic(
  () => import('@/firebase/client-provider').then((mod) => mod.FirebaseClientProvider),
  {
    ssr: false, // This is crucial.
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>Connecting to services...</p>
      </div>
    ),
  }
);

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicFirebaseProvider>
      <FirebaseErrorListener />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </DynamicFirebaseProvider>
  );
}
