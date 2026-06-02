'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  ArrowRight, 
  Mountain, 
  Compass, 
  Sparkles, 
  Zap,
  Search,
  ChevronRight,
  Wifi,
  Coffee,
  CloudSun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Northern Harrier Main Portal Landing.
 * Redesigned to match the vibrant, high-end travel discovery portals.
 * Features: High-res Hero, Symmetric Grids, and Protocol Branding.
 */

export default function LandingPage() {
  const getImg = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

  const featuredDestinations = [
    { id: 'nainital', name: 'Nainital', imageId: 'city-nainital', score: '9.2' },
    { id: 'auli', name: 'Auli', imageId: 'city-auli', score: '9.6' },
    { id: 'rishikesh', name: 'Rishikesh', imageId: 'city-rishikesh', score: '9.4' },
    { id: 'mussoorie', name: 'Mussoorie', imageId: 'city-mussoorie', score: '8.9' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-accent selection:text-white">
      
      {/* Immersive Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <Image 
          src={getImg('hero')} 
          alt="Himalayan Majesty" 
          fill 
          priority
          className="object-cover brightness-[0.5]" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />
        
        <div className="container relative z-10 px-6 text-center space-y-10">
          <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-md px-6 py-2.5 rounded-full border border-accent/30 text-accent text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-1000">
            <ShieldCheck className="h-4 w-4" /> Himalayan Operational Grid: STABLE
          </div>
          <h1 className="text-5xl md:text-[8rem] text-white tracking-tighter font-black leading-[0.85] uppercase">
            Beyond the <br /> <span className="text-accent italic font-heading font-light capitalize">Horizon</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/80 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight border-l-4 border-accent/60 pl-8 text-left md:text-center md:border-l-0 md:pl-0">
            Elite Himalayan Stays. Precision Safety Logic. Authentic Hospitality. <br className="hidden md:block"/>
            The new standard for mountain expeditions.
          </p>

          {/* Luxury Search Engine Mockup */}
          <div className="max-w-5xl mx-auto w-full pt-10">
            <div className="bg-[#febb02] p-1 rounded-sm shadow-2xl flex flex-col md:flex-row gap-1">
                <div className="flex-1 bg-white h-16 md:h-20 flex items-center px-6 gap-4 border-2 border-transparent focus-within:border-accent">
                    <Search className="h-6 w-6 text-slate-400" />
                    <div className="flex flex-col items-start flex-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Destination</span>
                        <input className="w-full font-black text-slate-900 focus:outline-none" placeholder="Where are you going?" />
                    </div>
                </div>
                <div className="flex-1 bg-white h-16 md:h-20 flex items-center px-6 gap-4 border-2 border-transparent focus-within:border-accent">
                    <Compass className="h-6 w-6 text-slate-400" />
                    <div className="flex flex-col items-start flex-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expedition Mode</span>
                        <span className="font-black text-slate-900">Standard Stay</span>
                    </div>
                </div>
                <Button className="h-16 md:h-20 bg-[#006ce4] hover:bg-[#005bb8] rounded-none px-12 text-xl font-black shadow-lg">
                    Check Protocol
                </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Symmetric Prime Destinations */}
      <section className="py-32 container px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-0 font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] text-[10px]">Prime Coordinates</Badge>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 uppercase leading-[0.9]">Explore The <br/> Northern Grid</h2>
            </div>
            <p className="text-slate-500 font-bold text-xl max-w-sm border-l-2 border-slate-200 pl-6">
                Handpicked nodes of absolute tranquility across the Himalayan belt.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredDestinations.map((dest) => (
            <Link key={dest.id} href={`/search?city=${dest.name}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[3rem] shadow-apple-deep hover:shadow-2xl transition-all duration-700">
                <Image 
                  src={getImg(dest.imageId)} 
                  alt={dest.name} 
                  fill 
                  className="object-cover transition-transform duration-2000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute top-8 right-8">
                  <Badge className="bg-white/95 backdrop-blur-md text-primary border-0 font-black px-4 py-2 rounded-full text-[10px] shadow-lg">
                    SCORE: {dest.score}
                  </Badge>
                </div>
                <div className="absolute bottom-10 left-10 right-10 space-y-3">
                  <Badge className="bg-accent text-white border-0 font-black uppercase text-[8px] tracking-[0.3em] px-4 py-1.5 rounded-full">HARRIER AUDITED</Badge>
                  <h3 className="text-4xl text-white font-black tracking-tighter uppercase">{dest.name}</h3>
                  <div className="flex items-center gap-2 text-white/60 font-black uppercase text-[10px] tracking-widest">
                    DISCOVER PROTOCOL <ChevronRight className="h-4 w-4 text-accent" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Elite Stay Inventory Preview */}
      <section className="py-32 bg-slate-50">
        <div className="container px-6">
            <div className="text-center mb-24 space-y-6">
                <div className="flex items-center justify-center gap-3 text-accent font-black uppercase tracking-[0.4em] text-[10px]">
                    <Sparkles className="h-4 w-4" /> THE CURATED SERIES
                </div>
                <h2 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase">Elite Collection</h2>
                <p className="text-slate-400 font-bold text-xl max-w-2xl mx-auto italic">Properties strictly audited for safety, connectivity, and authentic Himalayan warmth.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {[
                    { name: "Zenith Mountain Loft", city: "Auli", price: "18,000", score: "9.8" },
                    { name: "Riverside Sanctuary", city: "Rishikesh", price: "12,500", score: "9.4" },
                    { name: "The Pine Heritage", city: "Nainital", price: "15,000", score: "9.2" }
                ].map((hotel, i) => (
                    <Card key={i} className="group overflow-hidden rounded-[3rem] border-0 shadow-apple-deep hover:shadow-2xl transition-all duration-1000 gold-edge bg-white">
                        <CardContent className="p-0">
                            <div className="relative aspect-[16/10] overflow-hidden">
                                <Image src={`https://picsum.photos/seed/hotel${i}/800/600`} alt={hotel.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute top-6 right-6">
                                    <div className="h-14 w-14 bg-white/95 backdrop-blur-md rounded-full flex flex-col items-center justify-center shadow-xl">
                                        <span className="text-[12px] font-black leading-none">{hotel.score}</span>
                                        <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">SAFETY</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-widest">
                                        <MapPin className="h-3.5 w-3.5" /> {hotel.city}, Northern Grid
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors uppercase">
                                        {hotel.name}
                                    </h3>
                                </div>
                                
                                <div className="flex items-center gap-8 py-2 border-y border-slate-50">
                                    <Wifi className="h-5 w-5 text-slate-300" />
                                    <Coffee className="h-5 w-5 text-slate-300" />
                                    <CloudSun className="h-5 w-5 text-slate-300" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">nightly rate</span>
                                        <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{hotel.price}</span>
                                    </div>
                                    <Button className="h-16 px-10 rounded-full bg-slate-900 hover:bg-primary font-black uppercase tracking-widest text-[11px] shadow-xl">
                                        Explore Node
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </section>

      {/* Harrier Protocol Section */}
      <section className="py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
          <Mountain className="w-full h-full text-white" strokeWidth={0.1} />
        </div>
        <div className="container px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-24 space-y-6">
            <Badge className="bg-accent text-white font-black uppercase tracking-[0.4em] px-10 py-3 rounded-full text-[10px] shadow-2xl">The Northern Harrier Protocol</Badge>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">Engineered <br/><span className="italic font-light text-accent">Safety</span> Logic</h2>
            <p className="text-xl text-white/50 font-medium leading-relaxed max-w-2xl mx-auto">We don't just book hotels; we map your entire journey with precision telemetry and a deep respect for the horizon.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: "Precision Safety", desc: "Military-grade landscape risk assessments for every route." },
              { icon: Compass, title: "Satellite Intel", desc: "Live road and weather monitoring from regional nodes." },
              { icon: Sparkles, title: "Curated Stays", desc: "Only properties meeting Harrier gold-standards are listed." },
              { icon: Zap, title: "AI Vibe Sync", desc: "Interactive selection engine matches mood to geography." }
            ].map((item, i) => (
              <div key={i} className="group p-10 bg-white/5 rounded-[3.5rem] border border-white/10 hover:bg-accent transition-all duration-500 hover:border-accent hover:-translate-y-2">
                <div className="p-6 bg-white/10 rounded-3xl w-fit mb-10 group-hover:bg-white/20 transition-colors shadow-2xl">
                  <item.icon className="h-10 w-10 text-accent group-hover:text-white" />
                </div>
                <h4 className="text-2xl font-black uppercase tracking-widest mb-4 group-hover:text-white leading-none">{item.title}</h4>
                <p className="text-sm text-white/40 group-hover:text-white/80 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Protocol */}
      <section className="py-32 bg-white container px-6">
        <div className="bg-[#f0f6ff] rounded-[4rem] p-16 md:p-32 flex flex-col md:flex-row items-center justify-between gap-16 overflow-hidden relative">
            <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 pointer-events-none">
                <Compass className="h-full w-full text-primary" strokeWidth={0.5} />
            </div>
            <div className="space-y-6 max-w-xl relative z-10 text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">Synchronize With <br/> The Northern Grid</h2>
                <p className="text-slate-500 font-bold text-lg">Receive encrypted intelligence on new properties, private treks, and seasonal protocol shifts.</p>
            </div>
            <div className="w-full max-w-md space-y-4 relative z-10">
                <div className="relative">
                    <input className="w-full h-20 rounded-full border-2 border-slate-200 px-8 text-lg font-black focus:border-primary focus:outline-none transition-all pr-24" placeholder="Intel Node Email" />
                    <Button className="absolute right-2 top-2 h-16 w-16 rounded-full bg-primary p-0 shadow-2xl">
                        <ChevronRight className="h-8 w-8 text-white" />
                    </Button>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center md:text-left ml-4">Encrypted NH Transmission Protocol</p>
            </div>
        </div>
      </section>
    </div>
  );
}
