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
import { Search, MapPin, Star, ShieldCheck, Compass, Wind, ArrowRight, Sparkles, Tent, Heart, Camera } from 'lucide-react';
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

  const destinations = [
    { name: 'Nainital', image: 'city-nainital', desc: 'The Lake District' },
    { name: 'Mussoorie', image: 'city-mussoorie', desc: 'Queen of Hills' },
    { name: 'Rishikesh', image: 'city-rishikesh', desc: 'Yoga Capital' },
    { name: 'Haridwar', image: 'city-haridwar', desc: 'Gateway to God' },
    { name: 'Auli', image: 'city-auli', desc: 'Ski Paradise' },
    { name: 'Jim Corbett', image: 'city-jim-corbett', desc: 'Tiger Territory' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        <Image
          src={getImageUrl('hero')}
          alt="Himalayan Landscape"
          fill
          priority
          className="object-cover brightness-[0.4] scale-105"
          data-ai-hint="mountain landscape"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        
        <div className="container relative z-10 px-4 text-center space-y-8">
          <SeasonTruthMeter />
          <h1 className="text-6xl md:text-9xl text-white tracking-tighter font-black leading-[0.85] animate-in slide-in-from-bottom-10 duration-1000">
            Unveil The <br /> <span className="text-accent italic font-medium">Himalayan</span> Soul
          </h1>
          <p className="text-lg md:text-2xl text-white/80 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
            Premium Himalayan stays with real-time landslide risk scores and verified Pahadi hospitality for a secure mountain adventure.
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
            <Button asChild className="rounded-full px-12 h-16 text-lg font-black bg-primary hover:bg-primary/90 transition-all shadow-xl hover:scale-105">
              <Link href="/search">EXPLORE STAYS</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Destinations Grid */}
      <section className="py-24 bg-white/50">
        <div className="container px-4">
            <div className="text-center mb-16 space-y-4">
                <Badge className="bg-primary/10 text-primary border-0 font-black px-6 py-2 rounded-full uppercase tracking-widest text-[10px]">Uttarakhand's Best</Badge>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight">Popular Destinations</h2>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">Explore the diverse landscapes of the Devbhumi, from serene lakes to snow-capped peaks.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {destinations.map((dest, idx) => (
                    <Link key={idx} href={`/search?city=${dest.name}`} className="group relative aspect-[3/4] overflow-hidden rounded-[2.5rem] shadow-apple hover:shadow-2xl transition-all duration-700">
                        <Image src={getImageUrl(dest.image)} alt={dest.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-white font-black text-xl tracking-tight">{dest.name}</h3>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{dest.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* Featured Smart Stays */}
      <section className="py-32">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                    <div className="h-px w-8 bg-primary" /> Verified Inventory
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-none tracking-tight">Smart Suggestions</h2>
                <p className="text-slate-500 font-bold text-xl max-w-xl">Properties with premium mountain safety scores and certified local hospitality.</p>
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
                                    </div>
                                </div>
                                <div className="p-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <h3 className="text-3xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">
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

      {/* Trust & Service Excellence */}
      <section className="bg-primary py-32 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <Compass className="w-full h-full text-white" strokeWidth={0.1} />
        </div>
        <div className="container px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-10">
                    <Badge className="bg-accent text-white font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full text-[10px]">Why Choose Tripzy</Badge>
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">Your Smart <br/><span className="italic font-medium text-accent">Mountain</span> Companion</h2>
                    <p className="text-xl text-white/70 max-w-lg font-medium leading-relaxed">We don't just book hotels; we map your journey with real-time safety logic and authentic Pahadi hospitality roots.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {[
                            { icon: ShieldCheck, title: "Safety Logic", desc: "Real-time landslide risk scores for every route." },
                            { icon: Wind, title: "Live Intel", desc: "Direct road condition reports from local nodes." },
                            { icon: Heart, title: "Verified Stays", desc: "Properties certified for Pahadi hospitality." },
                            { icon: Tent, title: "Remote Support", desc: "24/7 mountain assistance for all explorers." }
                        ].map((item, i) => (
                            <div key={i} className="space-y-3">
                                <div className="p-3 bg-white/10 rounded-2xl w-fit">
                                    <item.icon className="h-6 w-6 text-accent" />
                                </div>
                                <h4 className="font-black uppercase tracking-widest text-sm">{item.title}</h4>
                                <p className="text-xs text-white/60 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative aspect-square">
                    <div className="absolute inset-0 bg-accent rounded-[4rem] rotate-6 opacity-20" />
                    <Image 
                        src={getImageUrl('about-hero')} 
                        alt="Adventure" 
                        fill 
                        className="object-cover rounded-[4rem] shadow-2xl" 
                    />
                </div>
            </div>
        </div>
      </section>

      {/* Vibe Match Banner */}
      <section className="py-24 px-4">
        <div className="container max-w-7xl">
            <div className="relative rounded-[4rem] overflow-hidden bg-white p-12 md:p-24 flex flex-col md:flex-row items-center gap-16 shadow-apple-deep border border-black/5">
                <div className="flex-1 space-y-8">
                    <Badge className="bg-accent/10 text-accent font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full text-[10px]">Tripzy Intelligent Match</Badge>
                    <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none uppercase">Find Your Soul <br/><span className="italic font-medium text-primary">Himalayan</span> Vibe</h2>
                    <p className="text-lg text-slate-500 max-w-md font-medium">Don't know where to go? Our smart AI expert matches your mood with the perfect mountain hidden gems.</p>
                    <Button asChild size="lg" className="h-14 px-10 rounded-full bg-primary text-white hover:bg-primary/90 font-black text-lg">
                        <Link href="/vibe-match" className="flex items-center gap-3">START VIBE MATCH™ <Sparkles className="h-5 w-5 text-accent" /></Link>
                    </Button>
                </div>
                <div className="flex-shrink-0 hidden lg:block">
                    <div className="h-80 w-80 bg-muted/50 rounded-full flex items-center justify-center border-2 border-dashed border-primary/20">
                        <Camera className="h-32 w-32 text-primary/10" />
                    </div>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}