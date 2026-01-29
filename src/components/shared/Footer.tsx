
'use client';

import { Facebook, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './Logo';

const footerLinks = {
  'Explore': [
    { label: 'Find a Hotel', href: '/search' },
    { label: 'Tour Packages', href: '/tour-packages' },
    { label: 'Destinations', href: '/#cities' },
    { label: 'Vibe Match™', href: '/vibe-match' },
  ],
  'For You': [
    { label: 'My Bookings', href: '/my-bookings' },
    { label: 'Create Account', href: '/signup' },
    { label: 'About Us', href: '/about' },
  ],
  'Support': [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Refund Policy', href: '/refund-policy' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Contact Us', href: '/contact' },
  ],
};


export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            {/* Branding Section */}
            <div className="col-span-2 flex flex-col items-start gap-4">
                <Link href="/" className="flex items-center gap-3">
                    <Logo />
                    <span className="font-heading text-xl font-bold text-foreground">
                        Uttarakhand Getaways
                    </span>
                </Link>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Your gateway to serene stays in the heart of the Himalayas.
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <a href="#" aria-label="Facebook" className="text-muted-foreground transition-colors hover:text-primary">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" aria-label="Twitter" className="text-muted-foreground transition-colors hover:text-primary">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" aria-label="Instagram" className="text-muted-foreground transition-colors hover:text-primary">
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
            </div>

            {/* Link Sections */}
            {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title} className="col-span-1">
                    <h3 className="text-base font-semibold mb-4">{title}</h3>
                    <ul className="space-y-3">
                        {links.map(link => (
                            <li key={link.label}>
                                <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
        
        <div className="mt-12 border-t pt-8">
            <p className="text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Uttarakhand Getaways. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
}
