'use client';

import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ShieldCheck, Compass } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './Logo';

const footerLinks = {
  'The Collection': [
    { label: 'Stays & Retreats', href: '/search' },
    { label: 'Elite Expeditions', href: '/tour-packages' },
    { label: 'Travel Journal', href: '/blogs' },
    { label: 'Vibe Match™ AI', href: '/vibe-match' },
  ],
  'Explorer': [
    { label: 'Concierge Desk', href: '/my-bookings' },
    { label: 'Elite Membership', href: '/signup' },
    { label: 'Our Story', href: '/about' },
    { label: 'Admin Terminal', href: '/admin' },
  ],
  'Legal & Safety': [
    { label: 'Safety Protocols', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Refund Policy', href: '/refund-policy' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Contact Support', href: '/contact' },
  ],
};


export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background text-white pt-24 pb-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
            {/* Branding Section */}
            <div className="lg:col-span-2 space-y-10">
                <Link href="/" className="flex items-center gap-3">
                    <Logo />
                    <span className="font-heading text-4xl font-black text-white tracking-tighter uppercase">
                        Northern <span className="text-primary">Harrier</span>
                    </span>
                </Link>
                <p className="max-w-sm text-lg text-white font-medium leading-relaxed italic opacity-80">
                  "Beyond the horizon lies the sacred truth of the peaks. We engineer the journeys that bring you there."
                </p>
                <div className="flex items-center gap-6">
                  {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                    <a key={idx} href="#" className="h-12 w-12 glass-card rounded-full flex items-center justify-center text-white transition-all hover:text-primary hover:border-primary">
                        <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
            </div>

            {/* Link Sections */}
            {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title} className="space-y-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{title}</h3>
                    <ul className="space-y-4">
                        {links.map(link => (
                            <li key={link.label}>
                                <Link href={link.href} className="text-sm text-white hover:text-primary transition-colors font-medium flex items-center group">
                                    <span className="w-0 group-hover:w-4 h-px bg-primary mr-0 group-hover:mr-3 transition-all duration-300" />
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
        
        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-white/10">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 glass-card rounded-2xl flex items-center justify-center text-primary">
                    <Phone className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase text-white/60 tracking-widest">Global Support</p>
                    <p className="text-sm font-bold text-white">+91 6399902725</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 glass-card rounded-2xl flex items-center justify-center text-primary">
                    <Mail className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase text-white/60 tracking-widest">Email Enquiries</p>
                    <p className="text-sm font-bold text-white">expeditions@northernharrier.com</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 glass-card rounded-2xl flex items-center justify-center text-primary">
                    <MapPin className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase text-white/60 tracking-widest">Headquarters</p>
                    <p className="text-sm font-bold text-white">Mall Road, Nainital, Uttarakhand</p>
                </div>
            </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] text-white font-black uppercase tracking-[0.3em] opacity-40">
                © {new Date().getFullYear()} Northern Harrier Expeditions Pvt Ltd.
            </p>
            <div className="flex items-center gap-8 text-[9px] font-black uppercase tracking-widest text-white/40">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-primary" /> Verified Standards
                </div>
                <div className="flex items-center gap-2">
                    <Compass className="h-3 w-3 text-primary" /> Mountain Network
                </div>
                <div className="hover:text-primary cursor-pointer transition-colors text-white">Harrier Status</div>
            </div>
        </div>
      </div>
    </footer>
  );
}