
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

/**
 * @fileOverview Tripzy Home - Smart Uttarakhand Getaways.
 * Robust image handling and hydration crash prevention.
 */

function SeasonTruthMeter() {
  const [isClient, setIsClient] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setIsClient(true);
    setCurrentDate(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
  }, []);

  if (!isClient) return <div className="h-10 w-48 bg-white/10 animate-pulse rounded-full" />;

  return (
    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-500">
      <ThermometerSun className="h-3 w-3 text-[#febb02]" />
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
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src={getImageUrl('hero')}
          alt="Himalayan Landscape"
          fill
          priority
          className="object-cover brightness-[0.6]"
          data-ai-hint="mountain peaks"
        />
        <div className="container relative z-10 px-4 text-center space-y-8">
          <SeasonTruthMeter />
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
            SMART STAYS IN <br /> <span className="text-[#febb02]">UTTARAKHAND</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed">
            Real-time landslide risk scores, verified Pahadi hosts, and local mountain intel for a secure Himalayan adventure.
          </p>

          <div className="max-w-5xl mx-auto bg-white p-2 rounded-none md:rounded-full shadow-2xl flex flex-col md:flex-row gap-2 mt-12">
            <div className="flex-1 flex items-center px-6 gap-3 border-b md:border-b-0 md:border-r border-gray-100 py-4">
              <Search className="h-6 w-6 text-primary" />
              <Input
                placeholder="Where are you heading?"
                className="border-0 focus-visible:ring-0 text-lg font-bold placeholder:font-medium rounded-none"
              />
            </div>
            <div className="flex-1 flex items-center px-6 gap-3 py-4">
              <Compass className="h-6 w-6 text-primary" />
              <Input
                placeholder="Choose travel vibe"
                className="border-0 focus-visible:ring-0 text-lg font-bold placeholder:font-medium rounded-none"
              />
            </div>
            <Button asChild className="rounded-full px-12 h-16 text-xl font-black bg-[#006ce4] hover:bg-[#005bb8] transition-all shadow-lg hover:scale-105 active:scale-95">
              <Link href="/search">SEARCH STAYS</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b py-8 shadow-sm">
        <div className="container px-4 flex flex-wrap justify-center md:justify-between items-center gap-10">
            <div className="flex items-center gap-3 text-muted-foreground group">
                <div className="p-3 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Safety Verified</span>
                    <span className="text-[9px] font-bold">Landslide Risk Monitoring</span>
                </div>
            </div>
             <div className="flex items-center gap-3 text-muted-foreground group">
                <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                    <Wind className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Live Weather</span>
                    <span className="text-[9px] font-bold">Real-time Road Access</span>
                </div>
            </div>
             <div className="flex items-center gap-3 text-muted-foreground group">
                <div className="p-3 bg-amber-50 rounded-full group-hover:bg-amber-100 transition-colors">
                    <Star className="h-6 w-6 text-[#febb02]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Authentic Stays</span>
                    <span className="text-[9px] font-bold">Verified Pahadi Hospitality</span>
                </div>
            </div>
        </div>
      </section>

      {/* Featured Stays */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                    <Compass className="h-4 w-4" /> Curated Collection
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 uppercase leading-none">Smart Suggestions</h2>
                <p className="text-slate-500 font-bold text-lg">Hand-picked properties with premium mountain safety scores.</p>
            </div>
            <Button variant="outline" className="rounded-full font-black border-2 h-12 px-8 hover:bg-primary hover:text-white transition-all" asChild>
                <Link href="/search">VIEW ALL PROPERTIES <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {hotelsLoading ? (
               [...Array(6)].map((_, i) => (
                   <Card key={i} className="animate-pulse h-[450px] rounded-[2.5rem] bg-slate-200 border-0" />
               ))
            ) : (
                featuredHotels?.map((hotel) => (
                    <Link key={hotel.id} href={`/hotels/${hotel.id}`}>
                        <Card className="group overflow-hidden rounded-[2.5rem] border-0 shadow-apple-deep hover:shadow-2xl transition-all duration-700 cursor-pointer bg-white">
                            <CardContent className="p-0 relative">
                                <div className="relative h-72 w-full overflow-hidden">
                                    <Image
                                        src={getImageUrl(hotel.images[0])}
                                        alt={hotel.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                                        <Badge className="bg-[#febb02]/90 backdrop-blur-md text-black border-0 font-black px-4 py-1.5 text-[10px] rounded-full shadow-sm">
                                            SAFETY: {hotel.mountainSafetyScore}/100
                                        </Badge>
                                        {hotel.discount > 0 && (
                                            <Badge className="bg-red-500 text-white border-0 font-black px-4 py-1.5 text-[10px] rounded-full shadow-sm">
                                                SAVE {hotel.discount}%
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">
                                                {hotel.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                                <MapPin className="h-3 w-3 text-primary" />
                                                {hotel.city}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-[#febb02]/10 px-3 py-1.5 rounded-xl border border-[#febb02]/20">
                                            <Star className="h-3 w-3 fill-[#febb02] text-[#febb02]" />
                                            <span className="text-xs font-black">{hotel.rating}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Starts from</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-slate-900">
                                                    ₹{hotel.minPrice?.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-slate-400 font-bold">/ night</span>
                                            </div>
                                        </div>
                                        <div className="ml-auto">
                                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary transition-colors">
                                                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-white" />
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
      <section className="py-20 px-4">
        <div className="container max-w-6xl">
            <div className="relative rounded-[3rem] overflow-hidden bg-[#003580] p-12 md:p-20 flex flex-col md:flex-row items-center gap-12 text-white">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                    <Image src={getImageUrl('about-hero')} alt="Vibe Match" fill className="object-cover" />
                </div>
                <div className="flex-1 space-y-6 relative z-10">
                    <Badge className="bg-[#febb02] text-black font-black uppercase tracking-widest px-4 py-1">Tripzy Exclusive</Badge>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">Find your Soul <br/> Himalayan Vibe</h2>
                    <p className="text-lg text-white/70 max-w-md font-medium">Don't know where to go? Our smart AI expert matches your mood with the perfect mountain hidden gems.</p>
                    <Button asChild size="lg" className="h-14 px-10 rounded-full bg-white text-[#003580] hover:bg-white/90 font-black text-lg">
                        <Link href="/vibe-match">START VIBE MATCH™ <Sparkles className="ml-2 h-5 w-5" /></Link>
                    </Button>
                </div>
                <div className="flex-shrink-0 relative z-10">
                    <div className="h-64 w-64 md:h-80 md:w-80 bg-white/5 rounded-full backdrop-blur-3xl border border-white/10 flex items-center justify-center animate-pulse">
                        <Compass className="h-32 w-32 text-[#febb02]" strokeWidth={1} />
                    </div>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
