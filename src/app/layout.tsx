import type { Metadata } from 'next';
import { Inter, Poppins, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { MessageCircle } from 'lucide-react';
import React from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Northern Harrier | Devbhoomi Uttarakhand Travel',
  description: 'Experience the sacred Himalayas with Northern Harrier. Curated luxury tours, spiritual pilgrimages, and adventure expeditions in Devbhoomi Uttarakhand.',
  keywords: 'Uttarakhand Travel, Kedarnath Pilgrimage, Badrinath Tour, Char Dham, Himalayan Expeditions',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${playfair.variable} font-sans bg-background text-foreground min-h-screen flex flex-col`}>
        <FirebaseClientProvider>
          <FirebaseErrorListener />
          <Header />
          {/* pt-16 ensures content is not hidden under the fixed header on standard pages */}
          <main className="relative z-10 flex-grow pt-16 lg:pt-20">
            {children}
          </main>
          
          {/* Floating WhatsApp CTA */}
          <a 
            href="https://wa.me/916399902725" 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 flex items-center gap-2 group"
          >
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold text-sm">Chat with Experts</span>
            <MessageCircle className="h-7 w-7" />
          </a>

          <Footer />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
