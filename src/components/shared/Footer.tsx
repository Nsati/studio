'use client';

import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './Logo';

const footerLinks = {
  'Himalayan Hub': [
    { label: 'Find a Stay', href: '/search' },
    { label: 'Tour Packages', href: '/tour-packages' },
    { label: 'Destinations', href: '/#cities' },
    { label: 'Vibe Match™', href: '/vibe-match' },
  ],
  'Explorer Central': [
    { label: 'My Collection', href: '/my-bookings' },
    { label: 'Create Account', href: '/signup' },
    { label: 'About Harrier', href: '/about' },
  ],
  'Essential Legal': [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Refund Policy', href: '/refund-policy' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Contact Support', href: '/contact' },
  ],
};


export default function Footer() {
  return (
    <footer className="border-t bg-slate-950 text-white selection:bg-accent selection:text-white">
      <div className="container py-20 md:py-32">
        <div className="grid grid-cols-2 gap-16 md:grid-cols-5">
            {/* Branding Section */}
            <div className="col-span-2 flex flex-col items-start gap-8">
                <Link href="/" className="flex items-center gap-3">
                    <Logo />
                    <span className="font-heading text-3xl font-black text-white tracking-tighter uppercase">
                        Northern <span className="text-accent">Harrier</span>
                    </span>
                </Link>
                <p className="max-w-xs text-base text-slate-400 font-medium leading-relaxed">
                  Your premium gateway to beyond the horizon. Northern Harrier curates elite Himalayan stays and secure mountain expeditions for the modern explorer.
                </p>
                <div className="flex items-center gap-6">
                  {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                    <a key={idx} href="#" className="p-3 bg-white/5 rounded-full text-slate-400 transition-all hover:text-accent hover:bg-white/10">
                        <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
            </div>

            {/* Link Sections */}
            {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title} className="col-span-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-8">{title}</h3>
                    <ul className="space-y-4">
                        {links.map(link => (
                            <li key={link.label}>
                                <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white font-medium">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
        
        <div className="mt-24 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                © {new Date().getFullYear()} Northern Harrier Expeditions. All Rights Reserved.
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span className="hover:text-white cursor-pointer transition-colors">Beyond Logic</span>
                <span className="hover:text-white cursor-pointer transition-colors">Harrier Status</span>
                <span className="hover:text-white cursor-pointer transition-colors">Mountain Network</span>
            </div>
        </div>
      </div>
    </footer>
  );
}
