import { Logo } from './Logo';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';

const footerLinks = {
  'Explore': [
    { label: 'Hotels', href: '/search' },
    { label: 'Cities', href: '/#cities' },
    { label: 'My Bookings', href: '/my-bookings' },
  ],
  'Company': [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  'Help & Support': [
    { label: 'Contact Us', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};


export function Footer() {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5">
            <div className="md:col-span-2">
                <div className="flex flex-col items-start gap-4">
                    <Logo />
                    <p className="max-w-xs text-sm text-muted-foreground">
                    Your gateway to the serene beauty of the Himalayas. Book your unforgettable stay with us.
                    </p>
                </div>
            </div>

            {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title}>
                    <h3 className="font-headline text-lg font-semibold mb-4">{title}</h3>
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
        
        <div className="mt-12 border-t pt-8 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Uttarakhand Getaways. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
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
    </footer>
  );
}
