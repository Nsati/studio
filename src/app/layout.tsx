
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
  title: 'Northern Harrier | Luxury Himalayan Stays & Secure Expeditions',
  description: 'Book handpicked luxury hotels and curated tour packages in Uttarakhand. Experience verified mountain safety, high-speed connectivity, and elite Pahadi hospitality.',
  keywords: 'Uttarakhand Travel, Luxury Hotels Nainital, Rishikesh Retreats, Himalayan Tours, Safe Mountain Stays',
  openGraph: {
    title: 'Northern Harrier | Beyond The Horizon',
    description: 'Elite Himalayan getaways with verified safety standards.',
    url: 'https://northernharrier.com',
    siteName: 'Northern Harrier',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1200',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
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
          <main className="relative z-10 min-h-screen bg-background pt-24 md:pt-28">
            {children}
          </main>
          <Footer />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
