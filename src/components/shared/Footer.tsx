'use client';

import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ShieldCheck, Compass, Globe2 } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './Logo';

const footerLinks = {
  'Devbhoomi': [
    { label: 'Hotels', href: '/search' },
    { label: 'Expeditions', href: '/tour-packages' },
    { label: 'Cultural Journal', href: '/blogs' },
    { label: 'Vibe Match™', href: '/vibe-match' },
  ],
  'Platform': [
    { label: 'About Our Mission', href: '/about' },
    { label: 'Travel Guides', href: '/blogs' },
    { label: 'Safety Protocols', href: '/terms' },
    { label: 'Contact Helpdesk', href: '/contact' },
  ],
  'Administrative': [
    { label: 'Master Terms', href: '/terms' },
    { label: 'Privacy Protocol', href: '/privacy' },
    { label: 'Refund Policy', href: '/refund-policy' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-24 pb-12 border-t-8 border-accent">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
            {/* Branding */}
            <div className="lg:col-span-2 space-y-8">
                <Link href="/" className="flex items-center gap-3">
                    <Logo />
                    <span className="font-heading text-3xl font-bold text-white tracking-tight">
                        TRIPZY
                    </span>
                </Link>
                <p className="max-w-xs text-white/70 font-medium leading-relaxed text-sm">
                  Dedicated to preserving and promoting the sacred heritage of Uttarakhand while providing modern adventure protocols for the global traveler.
                </p>
                <div className="flex items-center gap-5">
                  {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                    <a key={idx} href="#" className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-white transition-all hover:bg-accent hover:text-accent-foreground">
                        <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title} className="space-y-8">
                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-accent">{title}</h3>
                    <ul className="space-y-4">
                        {links.map(link => (
                            <li key={link.label}>
                                <Link href={link.href} className="text-sm text-white/60 hover:text-accent transition-colors font-medium">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
        
        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <span>© {new Date().getFullYear()} Northern Harrier Intelligence Pvt Ltd.</span>
                <span className="flex items-center gap-2 text-accent"><ShieldCheck className="h-4 w-4" /> SACRED ENCRYPTION ENABLED</span>
            </div>
            <div className="flex items-center gap-8 flex-wrap justify-center">
                <span className="hover:text-white cursor-pointer transition-colors">Himalayan Protocol</span>
                <span className="hover:text-white cursor-pointer transition-colors">Pahadi Hospitality</span>
                <span className="hover:text-white cursor-pointer transition-colors">Char Dham Safety</span>
            </div>
        </div>
      </div>
    </footer>
  );
}