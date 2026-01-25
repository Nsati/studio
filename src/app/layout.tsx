import { Playfair_Display, PT_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import dynamic from 'next/dynamic';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// Dynamically import the provider to ensure it's client-side only
const FirebaseClientProvider = dynamic(
  () => import('@/firebase/client-provider').then((mod) => mod.FirebaseClientProvider),
  {
    // You can add a loading component here if you wish
    loading: () => <div className="h-screen w-full flex items-center justify-center bg-background">Loading App...</div>,
  }
);

const fontBody = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

const fontHeadline = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
});

export const metadata = {
  title: 'Uttarakhand Getaways',
  description: 'Your gateway to the serene beauty of the Himalayas. Book your unforgettable stay with us.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          fontBody.variable,
          fontHeadline.variable
        )}
      >
        <FirebaseClientProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <FirebaseErrorListener />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
