'use client';

import dynamic from 'next/dynamic';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Toaster } from '@/components/ui/toaster';

const DynamicFirebaseProvider = dynamic(
  () => import('@/firebase/client-provider').then((mod) => mod.FirebaseClientProvider),
  {
    ssr: false,
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
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </DynamicFirebaseProvider>
  );
}
