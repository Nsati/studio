
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SearchFilters } from './search/SearchFilters';
import { 
  MapPin, 
  Compass, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Mountain, 
  Zap, 
  Users 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dummyCities } from '@/lib/dummy-data';

/**
 * @fileOverview Tripzy Elite Studio Landing Page.
 * High-end cinematic layout with dark luxury aesthetics.
 */

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      
      {/* Hero Section with Global Search */}
      <section className="relative h-[95vh] min-h-[700px] w-full flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1920" 
          alt="Himalayan Majesty" 
          fill 
          priority
          className="object-cover brightness-[0.35] scale-105"
          data-ai-hint="himalayan mountains"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-background" />
        
        <div className="container relative z-10 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="space-y-6"
            >
              <Badge className="bg-primary/20 text-primary border border-primary/30 px-8 py-2.5 rounded-full font-black uppercase tracking-[0.5em] text-[10px] mb-4 backdrop-blur-md">
                Sacred Northern Expeditions
              </Badge>
              <h1 className="text-6xl md:text-[9rem] font-black text-white tracking-tighter leading-[0.8] uppercase">
                Explore The <br/> <span className="text-primary italic font-heading font-light capitalize">Himalayas</span>
              </h1>
              <p className="mt-8 text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight opacity-80">
                Verified safety protocols and platinum-tier stays across <br className="hidden md:block"/> Uttarakhand's most sacred high-altitude nodes.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="pt-10"
            >
              <SearchFilters />
            </motion.div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce opacity-40">
            <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* Featured Destinations Grid */}
      <section className="py-40 bg-background relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
                    <Compass className="h-4 w-4" /> Operational Grid
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">Active Nodes</h2>
            </div>
            <Button variant="link" asChild className="text-primary font-black uppercase tracking-widest text-xs p-0 h-auto group">
                <Link href="/search">
                    Browse Full Atlas <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {dummyCities.map((city, idx) => (
              <motion.div 
                key={city.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
              >
                <Link href={`/search?city=${city.name}`}>
                  <Card className="group relative aspect-[3/4] overflow-hidden rounded-[3rem] border-0 cursor-pointer shadow-2xl luxury-shadow bg-slate-900">
                    <Image 
                      src={`https://images.unsplash.com/photo-1544735749-2e924378a839?auto=format&fit=crop&q=80&w=800`}
                      alt={city.name}
                      fill
                      className="object-cover transition-transform duration-3000 group-hover:scale-110 brightness-75 group-hover:brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-12 left-12 right-12 space-y-4">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-primary text-background border-0 font-black text-[9px] px-4 py-1.5 tracking-widest rounded-full">ELITE ACCESS</Badge>
                        </div>
                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{city.name}</h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 group-hover:text-primary transition-colors">
                            Initialize Protocol <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Architecture Section */}
      <section className="py-40 bg-slate-950 border-y border-white/5 relative">
        <div className="container px-6">
           <div className="max-w-4xl mx-auto text-center mb-24 space-y-6">
                <h4 className="text-primary font-black uppercase tracking-[0.5em] text-[10px]">Security & Integrity</h4>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-tight">The Himalayan <br className="hidden md:block"/> Trust Architecture</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
              {[
                { icon: ShieldCheck, title: "Guardian Feed", desc: "Real-time satellite tracking for landslide and weather anomalies at every stay node." },
                { icon: Star, title: "Curated Nodes", desc: "Every property is audited by our Himalayan liaison officers for comfort and structural safety." },
                { icon: Users, title: "Local Intel", desc: "Direct communication with Pahadi hosts and local emergency networks for 24/7 reliability." }
              ].map((item, i) => (
                <div key={i} className="space-y-8 text-center group">
                  <div className="h-24 w-24 bg-white/5 rounded-3xl flex items-center justify-center text-primary transition-all group-hover:bg-primary group-hover:text-background mx-auto border border-white/10 shadow-2xl">
                    <item.icon className="h-10 w-10" />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight">{item.title}</h4>
                    <p className="text-slate-400 font-medium leading-relaxed text-sm opacity-70">{item.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Bottom CTA / Terminal */}
      <section className="py-60 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="container px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="space-y-10"
                >
                    <h2 className="text-6xl md:text-[10rem] font-black tracking-tighter text-white leading-[0.8] uppercase">
                        Initialize <br className="hidden md:block"/> <span className="text-primary italic font-heading font-light">Journey</span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-400 font-medium tracking-wide max-w-2xl mx-auto">
                        Connect with our global concierge or explore the verified atlas to begin your Northern expedition.
                    </p>
                </motion.div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                    <Button asChild size="lg" className="h-24 px-16 rounded-full font-black text-xl bg-primary hover:bg-white hover:text-background transition-all shadow-[0_20px_50px_rgba(254,187,2,0.3)] group">
                        <Link href="/search" className="flex items-center gap-4">
                            Explore Stays <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-3" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-24 px-16 rounded-full font-black text-xl border-white/10 hover:bg-white/5 transition-all text-white backdrop-blur-xl">
                        <Link href="/vibe-match">Vibe Match™</Link>
                    </Button>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
