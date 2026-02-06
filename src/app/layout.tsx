import type { Metadata } from 'next';
import { PT_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const fontSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});

const fontHeading = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Tripzy - Smart Uttarakhand Stays',
  description: 'Book your dream getaway in the mountains of Uttarakhand with real-time safety scores.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontHeading.variable} font-sans bg-background text-foreground`}>
        <FirebaseClientProvider>
          <FirebaseErrorListener />
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
