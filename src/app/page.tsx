
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowRight, 
  Mountain, 
  Compass, 
  Sparkles, 
  Search,
  ChevronRight,
  Wifi,
  Coffee,
  CloudSun,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

/**
 * @fileOverview Northern Harrier Main Portal Landing.
 * Clean, symmetric layout using Direct Image URLs for stability.
 */

export default function LandingPage() {
  const featuredDestinations = [
    { id: 'nainital', name: 'Nainital', imageUrl: 'https://images.unsplash.com/photo-1693153318626-682ef3712136?auto=format&fit=crop&q=80&w=800', score: '9.2' },
    { id: 'auli', name: 'Auli', imageUrl: 'https://images.unsplash.com/photo-1515442597003-a25e0a78dae9?auto=format&fit=crop&q=80&w=800', score: '9.6' },
    { id: 'rishikesh', name: 'Rishikesh', imageUrl: 'https://images.unsplash.com/photo-1724118136076-5b0921aa529c?auto=format&fit=crop&q=80&w=800', score: '9.4' },
    { id: 'mussoorie', name: 'Mussoorie', imageUrl: 'https://images.unsplash.com/photo-1615568551460-705b7662c0b4?auto=format&fit=crop&q=80&w=800', score: '8.9' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-accent selection:text-white">
      
      {/* Immersive Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1920" 
          alt="Himalayan Majesty" 
          fill 
          priority
          unoptimized={true}
          className="object-cover brightness-[0.6]" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />
        
        <div className="container relative z-10 px-6 text-center space-y-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 text-accent text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4" /> Himalayan Operational Grid: STABLE
          </div>
          <h1 className="text-5xl md:text-[8rem] text-white tracking-tighter font-black leading-[0.85] uppercase">
            Beyond the <br /> <span className="text-accent italic font-heading font-light capitalize">Horizon</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/80 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight">
            Elite Himalayan Stays. Precision Safety Logic. Authentic Hospitality. <br className="hidden md:block"/>
            The new standard for mountain expeditions.
          </p>

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
                <Button asChild className="h-16 md:h-20 bg-[#006ce4] hover:bg-[#005bb8] rounded-none px-12 text-xl font-black shadow-lg">
                    <Link href="/search">Check Protocol</Link>
                </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Symmetric Prime Destinations */}
      <section className="py-32 container px-6 bg-white">
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
              <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] shadow-apple-deep hover:shadow-2xl transition-all duration-700">
                <Image 
                  src={dest.imageUrl} 
                  alt={dest.name} 
                  fill 
                  unoptimized={true}
                  className="object-cover transition-transform duration-2000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute top-6 right-6">
                  <Badge className="bg-white/95 backdrop-blur-md text-primary border-0 font-black px-3 py-1 rounded-full text-[10px]">
                    SCORE: {dest.score}
                  </Badge>
                </div>
                <div className="absolute bottom-10 left-10 right-10 space-y-2">
                  <Badge className="bg-accent text-white border-0 font-black uppercase text-[8px] tracking-[0.2em] px-3 py-1 rounded-sm shadow-lg">HARRIER AUDITED</Badge>
                  <h3 className="text-4xl text-white font-black tracking-tighter uppercase leading-none">{dest.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Elite Stay Inventory Preview */}
      <section className="py-32 bg-slate-50">
        <div className="container px-6">
            <div className="text-center mb-24 space-y-4">
                <div className="flex items-center justify-center gap-3 text-accent font-black uppercase tracking-[0.4em] text-[10px]">
                    <Sparkles className="h-4 w-4" /> THE CURATED SERIES
                </div>
                <h2 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-none">Elite Collection</h2>
                <p className="text-slate-400 font-bold text-xl max-w-2xl mx-auto italic">Properties strictly audited for safety, connectivity, and authentic Himalayan warmth.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[
                    { name: "Zenith Mountain Loft", city: "Auli", price: "18,000", score: "9.8", image: "https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&q=80&w=800" },
                    { name: "Riverside Sanctuary", city: "Rishikesh", price: "12,500", score: "9.4", image: "https://images.unsplash.com/photo-1544122102-33e23d51824b?auto=format&fit=crop&q=80&w=800" },
                    { name: "The Pine Heritage", city: "Nainital", price: "15,000", score: "9.2", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800" }
                ].map((hotel, i) => (
                    <Card key={i} className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                        <CardContent className="p-0">
                            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                <Image src={hotel.image} alt={hotel.name} fill unoptimized={true} className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-white/95 backdrop-blur-md text-slate-900 border-0 font-black px-2 py-1 rounded-sm text-[10px]">
                                      SAFETY: {hotel.score}
                                    </Badge>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-[#006ce4] text-[10px] font-black uppercase tracking-widest">
                                        <MapPin className="h-3.5 w-3.5" /> {hotel.city}, Northern Grid
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-[#006ce4] transition-colors uppercase">
                                        {hotel.name}
                                    </h3>
                                </div>
                                
                                <div className="flex items-center gap-6 py-2 border-y border-slate-50">
                                    <Wifi className="h-4 w-4 text-slate-300" />
                                    <Coffee className="h-4 w-4 text-slate-300" />
                                    <CloudSun className="h-4 w-4 text-slate-300" />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">nightly rate</span>
                                        <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{hotel.price}</span>
                                    </div>
                                    <Button asChild className="h-12 px-8 rounded-none bg-[#006ce4] hover:bg-[#005bb8] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-100 transition-all active:scale-95">
                                        <Link href="/search">Check Availability</Link>
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
          <div className="max-w-4xl mx-auto text-center mb-24 space-y-4">
            <Badge className="bg-accent text-white font-black uppercase tracking-[0.4em] px-8 py-2 rounded-full text-[10px] shadow-2xl">The Northern Harrier Protocol</Badge>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">Engineered <br/><span className="italic font-light text-accent">Safety</span> Logic</h2>
            <p className="text-xl text-white/50 font-medium leading-relaxed max-w-2xl mx-auto">We don't just book hotels; we map your entire journey with precision telemetry and a deep respect for the horizon.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: "Precision Safety", desc: "Military-grade landscape risk assessments for every route." },
              { icon: Compass, title: "Satellite Intel", desc: "Live road and weather monitoring from regional nodes." },
              { icon: Sparkles, title: "Curated Stays", desc: "Only properties meeting Harrier gold-standards are listed." },
              { icon: Compass, title: "AI Vibe Sync", desc: "Interactive selection engine matches mood to geography." }
            ].map((item, i) => (
              <div key={i} className="group p-10 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-accent transition-all duration-500 hover:border-accent hover:-translate-y-2">
                <div className="p-5 bg-white/10 rounded-2xl w-fit mb-8 group-hover:bg-white/20 transition-colors shadow-2xl">
                  <item.icon className="h-8 w-8 text-accent group-hover:text-white" />
                </div>
                <h4 className="text-xl font-black uppercase tracking-widest mb-4 group-hover:text-white leading-tight">{item.title}</h4>
                <p className="text-sm text-white/40 group-hover:text-white/80 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Protocol */}
      <section className="py-32 bg-white container px-6">
        <div className="bg-[#f0f6ff] rounded-[3rem] p-16 md:p-24 flex flex-col md:flex-row items-center justify-between gap-16 overflow-hidden relative">
            <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 pointer-events-none">
                <Compass className="h-full w-full text-primary" strokeWidth={0.5} />
            </div>
            <div className="space-y-6 max-w-xl relative z-10 text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">Synchronize With <br/> The Northern Grid</h2>
                <p className="text-slate-500 font-bold text-lg">Receive encrypted intelligence on new properties, private treks, and seasonal protocol shifts.</p>
            </div>
            <div className="w-full max-w-md space-y-4 relative z-10">
                <div className="relative">
                    <input className="w-full h-16 rounded-full border-2 border-slate-200 px-8 text-lg font-black focus:border-primary focus:outline-none transition-all pr-24" placeholder="Intel Node Email" />
                    <Button className="absolute right-2 top-2 h-12 w-12 rounded-full bg-primary p-0 shadow-2xl">
                        <ChevronRight className="h-6 w-6 text-white" />
                    </Button>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center md:text-left ml-4">Encrypted NH Transmission Protocol</p>
            </div>
        </div>
      </section>
    </div>
  );
}
