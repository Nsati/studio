'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  MessageCircle, 
  ShieldCheck, 
  Globe, 
  ArrowRight,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

/**
 * @fileOverview High-End Contact & Liaison Desk for Northern Harrier.
 * Features glassmorphism social grid and professional contact nodes.
 */

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function ContactPage() {
  return (
    <div className="bg-background min-h-screen font-sans selection:bg-accent selection:text-white pb-32">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[60vh] min-h-[450px] w-full flex items-center justify-center overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/40 to-background" />
        
        <div className="container relative z-10 px-6 text-center">
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto space-y-6">
            <Badge className="bg-accent text-accent-foreground border-0 px-8 py-2 rounded-full font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl saffron-glow">
              LIAISON DESK
            </Badge>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9] font-heading">
                Contact <br/> <span className="text-accent italic font-spiritual capitalize">Expedition Support</span>
            </h1>
            <p className="text-white/80 text-sm md:text-xl font-bold uppercase tracking-tight max-w-2xl mx-auto leading-relaxed">
                Connect with our Himalayan Specialists for verified itineraries and real-time mountain protocols.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. CORE CONTACT NODES */}
      <section className="container px-6 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { 
                    label: 'Direct Helpline', 
                    val: '+91-6399902725', 
                    icon: Phone, 
                    desc: 'Available 10 AM to 7 PM IST',
                    href: 'tel:+916399902725'
                },
                { 
                    label: 'Secure Email', 
                    val: 'nsati09@gmail.com', 
                    icon: Mail, 
                    desc: '24-hour response protocol',
                    href: 'mailto:nsati09@gmail.com'
                },
                { 
                    label: 'Liaison Office', 
                    val: 'Dehradun, Uttarakhand', 
                    icon: MapPin, 
                    desc: 'Reg. Head Office, India',
                    href: '#'
                }
            ].map((node, i) => (
                <motion.div 
                    key={i} 
                    {...fadeInUp} 
                    transition={{ delay: i * 0.1 }}
                >
                    <a href={node.href} className="block group">
                        <Card className="rounded-[2.5rem] border-black/5 bg-white shadow-apple-deep p-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col items-center text-center space-y-6">
                            <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                <node.icon className="h-7 w-7" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">{node.label}</p>
                                <h3 className="text-xl font-black text-primary tracking-tight">{node.val}</h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{node.desc}</p>
                            </div>
                            <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                    Initiate Node <ArrowRight className="h-3 w-3" />
                                </span>
                            </div>
                        </Card>
                    </a>
                </motion.div>
            ))}
        </div>
      </section>

      {/* 3. DIGITAL NODES (SOCIALS) */}
      <section className="py-24 md:py-32">
        <div className="container px-6">
            <div className="text-center mb-20 space-y-4">
                <div className="flex items-center justify-center gap-3 text-accent font-black uppercase tracking-[0.4em] text-[10px]">
                    <Globe className="h-4 w-4" /> DIGITAL ECOSYSTEM
                </div>
                <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-primary uppercase font-heading">Connect Socially</h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">Follow our journey through the high passes.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                {[
                    { name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]', label: '@NorthernHarrier' },
                    { name: 'Facebook', icon: Facebook, color: 'bg-[#1877F2]', label: 'Northern Harrier UK' },
                    { name: 'Twitter', icon: Twitter, color: 'bg-[#000000]', label: '@HarrierHimalaya' },
                    { name: 'YouTube', icon: Youtube, color: 'bg-[#FF0000]', label: 'Expedition Archive' }
                ].map((social, i) => (
                    <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                        <Card className="group relative overflow-hidden rounded-[2rem] border-black/5 bg-white shadow-apple hover:shadow-xl transition-all duration-700 cursor-pointer text-center p-8">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity bg-primary" />
                            <div className={`mx-auto w-16 h-16 rounded-full ${social.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                <social.icon className="h-7 w-7" />
                            </div>
                            <div className="mt-6 space-y-1">
                                <h4 className="text-lg font-black text-primary uppercase tracking-tight font-heading">{social.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{social.label}</p>
                            </div>
                            <div className="mt-6">
                                <Button variant="ghost" className="rounded-full h-8 px-4 text-[9px] font-black uppercase tracking-widest text-primary/40 group-hover:text-accent transition-colors">
                                    Sync Node <ExternalLink className="h-3 w-3 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* 4. EMERGENCY PROTOCOL BANNER */}
      <section className="container px-6">
        <div className="relative overflow-hidden rounded-[3rem] bg-primary p-12 md:p-20 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800')] bg-cover opacity-20 hidden md:block" />
            <div className="relative z-10 max-w-2xl space-y-8">
                <div className="space-y-4">
                    <Badge className="bg-red-500 text-white border-0 px-5 py-1 rounded-full font-black uppercase tracking-widest text-[9px]">
                        24/7 EMERGENCY PROTOCOL
                    </Badge>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                        Critical Support <br/> During Travel?
                    </h2>
                    <p className="text-white/70 font-bold text-sm md:text-base uppercase tracking-tight leading-relaxed">
                        If you are currently on a Northern Harrier expedition and require immediate liaison assistance due to weather or logistics, call our priority node.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-xs bg-accent hover:bg-white hover:text-primary transition-all shadow-2xl saffron-glow">
                        <a href="tel:+916399902725" className="flex items-center gap-3 tracking-[0.2em] uppercase">
                            <Phone className="h-5 w-5" /> Emergency Liaison
                        </a>
                    </Button>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-60">
                        <Clock className="h-5 w-5" /> Real-time Mountain Ops
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-10 right-10 opacity-10 hidden md:block">
                <ShieldCheck className="h-48 w-48 text-white" />
            </div>
        </div>
      </section>

      {/* 5. WHATSAPP FLOATING NODE (Reminder context) */}
      <div className="mt-20 text-center space-y-8">
        <div className="max-w-lg mx-auto space-y-4 px-6">
            <div className="flex items-center justify-center gap-2 text-green-600 font-black uppercase tracking-[0.4em] text-[10px]">
                <MessageCircle className="h-4 w-4" /> LIVE WHATSAPP SYNC
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase leading-relaxed tracking-tight">
                Prefer a quick chat? Our experts are available for instant itinerary consultation via WhatsApp.
            </p>
            <Button asChild variant="outline" size="lg" className="rounded-full px-10 h-14 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 font-black uppercase tracking-widest text-[10px]">
                <a href="https://wa.me/916399902725" target="_blank" rel="noopener noreferrer">
                    Open WhatsApp Terminal
                </a>
            </Button>
        </div>
      </div>
    </div>
  );
}
