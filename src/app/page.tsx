'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, ShieldCheck, Compass, ThermometerSun, Wind, ArrowRight, Sparkles } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function SeasonTruthMeter() {
  const [isClient, setIsClient] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setIsClient(true);
    setCurrentDate(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
  }, []);

  if (!isClient) return <div className="h-10 w-48 bg-white/10 animate-pulse rounded-full" />;

  return (
    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-700">
      <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
      Verified {currentDate}: Mountain Access Stable
    </div>
  );
}

export default function Home() {
  const firestore = useFirestore();

  const featuredHotelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'hotels'), limit(6));
  }, [firestore]);

  const { data: featuredHotels, isLoading: hotelsLoading } = useCollection<Hotel>(featuredHotelsQuery);

  const getImageUrl = (idOrUrl: string) => {
    if (!idOrUrl) return 'https://picsum.photos/seed/mountain/1200/800';
    if (idOrUrl.startsWith('http')) return idOrUrl;
    const placeholder = PlaceHolderImages.find((p) => p.id === idOrUrl);
    return placeholder ? placeholder.imageUrl : `https://picsum.photos/seed/${idOrUrl}/800/600`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        <Image
          src={getImageUrl('hero')}
          alt="Himalayan Landscape"
          fill
          priority
          className="object-cover brightness-[0.5] scale-105"
          data-ai-hint="mountain landscape"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
        
        <div className="container relative z-10 px-4 text-center space-y-10">
          <SeasonTruthMeter />
          <h1 className="font-heading text-6xl md:text-9xl text-white tracking-tighter leading-[0.85]">
            Unveil The <br /> <span className="text-accent italic font-medium">Himalayan</span> Soul
          </h1>
          <p className="text-lg md:text-2xl text-white/80 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
            Smart Himalayan stays with real-time landslide risk scores and verified Pahadi hospitality for a secure mountain adventure.
          </p>

          <div className="max-w-4xl mx-auto glass-morphism p-2 rounded-3xl md:rounded-full shadow-2xl flex flex-col md:flex-row gap-2 mt-12 scale-105">
            <div className="flex-1 flex items-center px-8 gap-3 border-b md:border-b-0 md:border-r border-black/5 py-4">
              <Search className="h-5 w-5 text-primary" />
              <Input
                placeholder="Where to, explorer?"
                className="border-0 focus-visible:ring-0 text-lg font-bold placeholder:text-black/40 bg-transparent"
              />
            </div>
            <div className="flex-1 flex items-center px-8 gap-3 py-4">
              <Compass className="h-5 w-5 text-primary" />
              <Input
                placeholder="Your travel vibe?"
                className="border-0 focus-visible:ring-0 text-lg font-bold placeholder:text-black/40 bg-transparent"
              />
            </div>
            <Button asChild className="rounded-full px-12 h-16 text-lg font-black bg-primary hover:bg-primary/90 transition-all shadow-xl hover:scale-105 active:scale-95">
              <Link href="/search">EXPLORE STAYS</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white/50 backdrop-blur-sm border-b py-10">
        <div className="container px-4 flex flex-wrap justify-center md:justify-between items-center gap-12">
            {[
                { icon: ShieldCheck, title: "Safety Verified", sub: "Landslide Risk Logic", color: "text-green-600", bg: "bg-green-50" },
                { icon: Wind, title: "Live Weather", sub: "Real-time Road Intel", color: "text-blue-500", bg: "bg-blue-50" },
                { icon: Star, title: "Pahadi Certified", sub: "Authentic Local Stays", color: "text-accent", bg: "bg-orange-50" }
            ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-4 group cursor-default">
                    <div className={`p-4 ${badge.bg} rounded-3xl group-hover:scale-110 transition-transform duration-500`}>
                        <badge.icon className={`h-6 w-6 ${badge.color}`} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">{badge.title}</span>
                        <span className="text-[10px] font-bold text-slate-400">{badge.sub}</span>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Featured Stays */}
      <section className="py-32">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                    <div className="h-px w-8 bg-primary" /> Curated Collection
                </div>
                <h2 className="font-heading text-5xl md:text-7xl font-bold text-slate-900 leading-none tracking-tight">Smart Suggestions</h2>
                <p className="text-slate-500 font-bold text-xl max-w-xl">Hand-picked properties with premium mountain safety scores and verified local vibes.</p>
            </div>
            <Button variant="outline" className="rounded-full font-black border-2 h-14 px-10 hover:bg-primary hover:text-white transition-all shadow-apple" asChild>
                <Link href="/search">VIEW ALL PROPERTIES <ArrowRight className="ml-3 h-5 w-5" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {hotelsLoading ? (
               [...Array(6)].map((_, i) => (
                   <Card key={i} className="animate-pulse h-[500px] rounded-[3rem] bg-slate-100 border-0" />
               ))
            ) : (
                featuredHotels?.map((hotel) => (
                    <Link key={hotel.id} href={`/hotels/${hotel.id}`}>
                        <Card className="group overflow-hidden rounded-[3rem] border-0 shadow-apple-deep hover:shadow-2xl transition-all duration-1000 cursor-pointer bg-white">
                            <CardContent className="p-0 relative">
                                <div className="relative h-80 w-full overflow-hidden">
                                    <Image
                                        src={getImageUrl(hotel.images[0])}
                                        alt={hotel.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute top-8 left-8 flex flex-col gap-3">
                                        <Badge className="bg-primary/90 backdrop-blur-md text-white border-0 font-black px-5 py-2 text-[10px] rounded-full shadow-lg tracking-widest">
                                            SAFETY: {hotel.mountainSafetyScore}/100
                                        </Badge>
                                        {hotel.discount > 0 && (
                                            <Badge className="bg-accent text-white border-0 font-black px-5 py-2 text-[10px] rounded-full shadow-lg tracking-widest">
                                                SAVE {hotel.discount}%
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="p-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <h3 className="font-heading text-3xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight">
                                                {hotel.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                                {hotel.city}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
                                            <Star className="h-4 w-4 fill-primary text-primary" />
                                            <span className="text-sm font-black text-primary">{hotel.rating}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 pt-8 border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Starting from</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                                    ₹{hotel.minPrice?.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-slate-400 font-bold">/ night</span>
                                            </div>
                                        </div>
                                        <div className="ml-auto">
                                            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary transition-all duration-500 shadow-inner group-hover:shadow-primary/30">
                                                <ArrowRight className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))
            )}
          </div>
        </div>
      </section>

      {/* Vibe Match Banner */}
      <section className="py-24 px-4">
        <div className="container max-w-7xl">
            <div className="relative rounded-[4rem] overflow-hidden bg-primary p-16 md:p-32 flex flex-col md:flex-row items-center gap-16 text-white shadow-apple-deep">
                <div className="absolute top-0 right-0 w-3/4 h-full opacity-20 pointer-events-none">
                    <Image src={getImageUrl('about-hero')} alt="Vibe Match" fill className="object-cover" />
                </div>
                <div className="flex-1 space-y-10 relative z-10">
                    <Badge className="bg-accent text-white font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full text-[10px]">Tripzy Intelligent Match</Badge>
                    <h2 className="font-heading text-6xl md:text-8xl font-bold tracking-tighter leading-[0.85] uppercase">Find Your Soul <br/><span className="italic font-medium text-accent">Himalayan</span> Vibe</h2>
                    <p className="text-xl text-white/70 max-w-lg font-medium leading-relaxed">Confused where to go? Our smart AI expert maps your mood to the perfect hidden mountain gems.</p>
                    <Button asChild size="lg" className="h-16 px-12 rounded-full bg-white text-primary hover:bg-white/90 font-black text-xl shadow-2xl hover:scale-105 transition-all">
                        <Link href="/vibe-match" className="flex items-center gap-3">START VIBE MATCH™ <Sparkles className="h-6 w-6 text-accent" /></Link>
                    </Button>
                </div>
                <div className="flex-shrink-0 relative z-10 hidden lg:block">
                    <div className="h-96 w-96 bg-white/5 rounded-full backdrop-blur-3xl border border-white/10 flex items-center justify-center animate-pulse">
                        <Compass className="h-48 w-48 text-accent/40" strokeWidth={0.5} />
                    </div>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}