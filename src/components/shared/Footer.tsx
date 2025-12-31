import { Logo } from './Logo';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Logo />
            <p className="max-w-xs text-center text-sm text-muted-foreground md:text-left">
              Your gateway to the serene beauty of the Himalayas. Book your unforgettable stay with us.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 md:items-end">
            <h3 className="font-headline text-lg font-semibold">Quick Links</h3>
            <div className="flex gap-6">
                <Link href="/search" className="text-sm text-muted-foreground transition-colors hover:text-primary">Explore</Link>
                <Link href="/my-bookings" className="text-sm text-muted-foreground transition-colors hover:text-primary">Bookings</Link>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">Contact</Link>
            </div>
             <div className="flex items-center gap-4 mt-4">
              <Link href="#" aria-label="Facebook">
                <Facebook className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
              </Link>
              <Link href="#" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
              </Link>
              <Link href="#" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Uttarakhand Getaways. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
