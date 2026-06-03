
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
 * @fileOverview Tripzy (Northern Harrier) Elite Landing Page.
 * Reverted to original premium dark luxury theme.
 */

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      
      {/* Hero Section with Global Search */}
      <section className="relative h-[90vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1920" 
          alt="Himalayan Majesty" 
          fill 
          priority
          className="object-cover brightness-[0.4]"
          data-ai-hint="himalayan mountains"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background" />
        
        <div className="container relative z-10 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <Badge className="bg-primary/20 text-primary border border-primary/30 px-6 py-2 rounded-full font-black uppercase tracking-[0.4em] text-[10px] mb-4">
                Sacred Northern Expeditions
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase">
                Explore The <br/> <span className="text-primary italic font-heading font-light capitalize">Himalayas</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
                Verified safety insights and elite stays across Uttarakhand's most sacred destinations.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="pt-8"
            >
              <SearchFilters />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Destinations Grid */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                    <Compass className="h-4 w-4" /> Destination Protocols
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none">Active Nodes</h2>
            </div>
            <Button variant="link" className="text-primary font-black uppercase tracking-widest text-xs p-0 h-auto group">
                Browse Full Map <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {dummyCities.map((city, idx) => (
              <motion.div 
                key={city.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link href={`/search?city=${city.name}`}>
                  <Card className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border-0 cursor-pointer shadow-2xl">
                    <Image 
                      src={`https://images.unsplash.com/photo-1544735749-2e924378a839?auto=format&fit=crop&q=80&w=800`}
                      alt={city.name}
                      fill
                      className="object-cover transition-transform duration-2000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-10 left-10 right-10 space-y-3">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-primary/80 backdrop-blur-md text-background border-0 font-black text-[9px] px-3 py-1">ELITE ACCESS</Badge>
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{city.name}</h3>
                        <p className="text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            Explore Collection <ArrowRight className="h-3.5 w-3.5 text-primary" />
                        </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section / Why Us */}
      <section className="py-32 bg-slate-900 border-y border-white/5">
        <div className="container px-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                { icon: ShieldCheck, title: "Safety First", desc: "Real-time landslide and weather tracking for every node." },
                { icon: Star, title: "Verified Stays", desc: "Every property is hand-picked by our Himalayan experts." },
                { icon: Users, title: "Local Intel", desc: "Insights from verified Pahadi hosts and local commuters." }
              ].map((item, i) => (
                <div key={i} className="space-y-6 text-center md:text-left group">
                  <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-background">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">{item.title}</h4>
                  <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-40 relative">
        <div className="container px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-12">
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none uppercase">
                    Ready For The <br className="hidden md:block"/> <span className="text-primary italic font-heading font-light">Journey?</span>
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Button asChild size="lg" className="h-20 px-12 rounded-full font-black text-lg bg-primary hover:bg-white hover:text-background transition-all shadow-2xl shadow-primary/20 group">
                        <Link href="/search">Find Stays Now <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" /></Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-20 px-12 rounded-full font-black text-lg border-white/10 hover:bg-white/5 transition-all text-white">
                        <Link href="/vibe-match">Try Vibe Match™</Link>
                    </Button>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
