'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  Heart, 
  Globe2,
  Clock,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      
      {/* Hero Section - PickYourTrail Style */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center pt-10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1533589063533-d39a82c9844b?auto=format&fit=crop&q=80&w=1920" 
            alt="Scenic Travel" 
            fill 
            priority
            className="object-cover" 
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="container relative z-10 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h1 className="text-4xl md:text-7xl font-black text-white leading-tight tracking-tight">
              Unbox Your <br /> <span className="text-white bg-primary/20 px-4 rounded-xl">Dream Vacation</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium">
              Join 50,000+ travelers who crafted their own Himalayan journeys with Tripzy.
            </p>

            {/* Search Hub - Integrated & Modern */}
            <div className="max-w-4xl mx-auto bg-white p-3 rounded-2xl shadow-2xl flex flex-col lg:flex-row gap-2">
                <div className="flex-1 flex items-center px-6 gap-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent cursor-pointer">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div className="flex flex-col items-start flex-1 py-3">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Destination</span>
                        <input className="bg-transparent w-full font-bold text-slate-800 focus:outline-none placeholder:text-slate-300 text-sm" placeholder="Search a city" />
                    </div>
                </div>
                <div className="flex-1 flex items-center px-6 gap-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent cursor-pointer border-l lg:border-l-slate-100">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div className="flex flex-col items-start flex-1 py-3">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Travel Dates</span>
                        <span className="font-bold text-slate-800 text-sm">Pick a window</span>
                    </div>
                </div>
                <Button asChild className="h-auto bg-primary hover:bg-blue-700 text-white rounded-xl px-12 text-lg font-black shadow-lg py-5 lg:py-0">
                    <Link href="/search">Find Deals</Link>
                </Button>
            </div>

            <div className="flex items-center justify-center gap-6 text-white/80 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Best Price Guarantee</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> 100% Customizable</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 bg-white border-b">
        <div className="container px-6 flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:opacity-100 transition-opacity">
            <span className="font-black text-xl text-slate-900">Forbes</span>
            <span className="font-black text-xl text-slate-900">TechCrunch</span>
            <span className="font-black text-xl text-slate-900">CNBC</span>
            <span className="font-black text-xl text-slate-900">CNN Travel</span>
        </div>
      </section>

      {/* Featured Destinations - Rounded Tiles */}
      <section className="py-24 bg-[#F5F7FA]">
        <div className="container px-6">
            <div className="flex justify-between items-end mb-12">
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Bestselling Getaways</h2>
                    <p className="text-slate-500 font-medium">Most loved Himalayan circuits curated by experts.</p>
                </div>
                <Button variant="link" className="text-primary font-black flex items-center gap-2">
                    View all <ArrowRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { name: 'Rishikesh', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500', deals: '42' },
                    { name: 'Nainital', img: 'https://images.unsplash.com/photo-1626014303757-63661163486c?w=500', deals: '28' },
                    { name: 'Auli', img: 'https://images.unsplash.com/photo-1624823183491-66775f0a0d4c?w=500', deals: '15' },
                    { name: 'Mussoorie', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500', deals: '31' }
                ].map((dest, i) => (
                    <Link key={i} href="/search" className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all">
                        <Image src={dest.img} alt={dest.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-6 left-6 text-white space-y-1">
                            <h3 className="text-2xl font-black uppercase">{dest.name}</h3>
                            <p className="text-xs font-bold text-white/70 uppercase tracking-widest">{dest.deals} Verified Deals</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* Why Tripzy - Clean Icon Grid */}
      <section className="py-24 bg-white">
        <div className="container px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
                { icon: Globe2, title: "Self-Serve Customization", desc: "Change anything! Flights, hotels or routes in just a few clicks." },
                { icon: ShieldCheck, title: "Harrier Protocol Safety", desc: "Every tour is audited for Himalayan safety standards and road access." },
                { icon: Clock, title: "24/7 Concierge Support", desc: "Our travel experts are just a WhatsApp message away, day or night." }
            ].map((item, i) => (
                <div key={i} className="space-y-6 text-center md:text-left">
                    <div className="h-16 w-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center shadow-sm">
                        <item.icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xl font-black text-slate-900 leading-tight">{item.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <Compass className="absolute -top-20 -right-20 h-96 w-96 text-white animate-spin-slow" />
        </div>
        <div className="container relative z-10 px-6 text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">Your Himalayan Story <br /> Starts Here.</h2>
            <p className="text-white/80 max-w-lg mx-auto text-lg font-medium">Connect with our experts and build a journey that's uniquely yours.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="h-16 px-12 rounded-full bg-white text-primary hover:bg-slate-100 font-black text-lg shadow-xl active:scale-95 transition-all">
                    <Link href="/contact">Get Custom Quote</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-16 px-12 rounded-full border-white/40 text-white hover:bg-white/10 font-black text-lg">
                    <Link href="/tour-packages">Explore Expeditions</Link>
                </Button>
            </div>
        </div>
      </section>

    </div>
  );
}
