'use client';

import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ShieldCheck, Compass, Globe2 } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './Logo';

const footerLinks = {
  'Product': [
    { label: 'Hotels', href: '/search' },
    { label: 'Vacations', href: '/tour-packages' },
    { label: 'Itineraries', href: '/tour-packages' },
    { label: 'Vibe Match™', href: '/vibe-match' },
  ],
  'Company': [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '#' },
    { label: 'Travel Guides', href: '/blogs' },
    { label: 'Contact', href: '/contact' },
  ],
  'Support': [
    { label: 'Help Center', href: '/contact' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cancellation Policy', href: '/refund-policy' },
  ],
};


export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Branding */}
            <div className="lg:col-span-2 space-y-6">
                <Link href="/" className="flex items-center gap-2">
                    <Logo />
                    <span className="font-heading text-2xl font-black text-white tracking-tight">
                        Tripzy
                    </span>
                </Link>
                <p className="max-w-xs text-slate-400 font-medium leading-relaxed">
                  The world's most personalized travel planner. We make sure you spend more time traveling and less time searching.
                </p>
                <div className="flex items-center gap-4">
                  {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                    <a key={idx} href="#" className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center text-white transition-all hover:bg-primary">
                        <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title} className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-100">{title}</h3>
                    <ul className="space-y-3">
                        {links.map(link => (
                            <li key={link.label}>
                                <Link href={link.href} className="text-sm text-slate-400 hover:text-primary transition-colors font-medium">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
        
        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-8">
                <span>© {new Date().getFullYear()} Tripzy Technologies Pvt Ltd.</span>
                <span className="flex items-center gap-2 text-green-500"><ShieldCheck className="h-4 w-4" /> SECURE BOOKING</span>
            </div>
            <div className="flex items-center gap-6">
                <span className="hover:text-white cursor-pointer transition-colors">Affiliates</span>
                <span className="hover:text-white cursor-pointer transition-colors">Safety Protocols</span>
                <span className="hover:text-white cursor-pointer transition-colors">Himalayan Protocol</span>
            </div>
        </div>
      </div>
    </footer>
  );
}
