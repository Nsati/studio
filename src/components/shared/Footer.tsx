'use client';

import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ShieldCheck, MessageCircle, Mountain } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const footerLinks = {
  'Destinations': [
    { label: 'Kedarnath', href: '/search?city=Kedarnath' },
    { label: 'Rishikesh', href: '/search?city=Rishikesh' },
    { label: 'Auli', href: '/search?city=Auli' },
    { label: 'Nainital', href: '/search?city=Nainital' },
  ],
  'Quick Links': [
    { label: 'Tour Packages', href: '/tour-packages' },
    { label: 'Contact Liaison', href: '/contact' },
    { label: 'Travel Blog', href: '/blogs' },
    { label: 'Vibe Match™', href: '/vibe-match' },
  ],
  'Support': [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Refund Policy', href: '/refund-policy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Cancellation Policy', href: '/refund-policy' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#1E293B] text-white pt-24 pb-12 border-t-8 border-accent">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
            {/* Branding */}
            <div className="lg:col-span-2 space-y-8">
                <Link href="/" className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-accent shadow-lg">
                       <Mountain className="h-6 w-6" />
                    </div>
                    <span className="font-heading text-2xl font-bold text-white tracking-tighter uppercase">
                        NORTHERN <span className="text-accent italic font-spiritual capitalize">HARRIER</span>
                    </span>
                </Link>
                <p className="max-w-xs text-white/70 font-medium leading-relaxed text-sm">
                  Dedicated to preserving and promoting the sacred heritage of Uttarakhand while providing modern adventure protocols for the global traveler.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-5">
                    {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                      <a key={idx} href="#" className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-white transition-all hover:bg-accent hover:text-primary">
                          <Icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
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
        
        {/* Newsletter & Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-12 border-y border-white/5 mb-12">
            <div className="space-y-6">
               <h4 className="text-xl font-bold uppercase tracking-tight">Stay Connected</h4>
               <div className="flex gap-4">
                  <input type="email" placeholder="Your Email Node" className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm focus:outline-none focus:border-accent" />
                  <Button className="rounded-full px-10 h-14 bg-accent hover:bg-white hover:text-primary font-bold">Subscribe</Button>
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="flex items-start gap-4">
                  <Phone className="h-5 w-5 text-accent mt-1" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Call Helpline</p>
                    <p className="font-bold">+91-6399902725</p>
                  </div>
               </div>
               <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-accent mt-1" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Liaison Office</p>
                    <p className="font-bold">Dehradun, UK, India</p>
                  </div>
               </div>
            </div>
        </div>

        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">
            <div className="flex flex-col md:flex-row items-center gap-8">
                <span>© {new Date().getFullYear()} Northern Harrier Expeditions.</span>
                <span className="flex items-center gap-2 text-accent"><ShieldCheck className="h-4 w-4" /> CRAFTED WITH ❤️ IN UTTARAKHAND</span>
            </div>
            <div className="flex items-center gap-10 grayscale opacity-40">
                <span className="font-black text-xl tracking-tighter uppercase">UPI</span>
                <span className="font-black text-xl tracking-tighter uppercase">Razorpay</span>
                <span className="font-black text-xl tracking-tighter uppercase">Visa</span>
            </div>
        </div>
      </div>
    </footer>
  );
}
