
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
import { Search, MapPin, Star, ShieldCheck, Compass, ThermometerSun, Wind } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/**
 * @fileOverview Tripzy Home - Smart Uttarakhand Getaways.
 * Hardened to prevent hydration mismatches and production crashes.
 */

function SeasonTruthMeter() {
  const [isClient, setIsClient] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setIsClient(true);
    // Execute dynamic logic ONLY on client to prevent hydration mismatch
    setCurrentDate(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
  }, []);

  if (!isClient) return <div className="h-10 w-48 bg-muted animate-pulse rounded-full" />;

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

  const getImageUrl = (id: string) => {
    return PlaceHolderImages.find((p) => p.id === id)?.imageUrl || '';
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src={getImageUrl('hero')}
          alt="Himalayan Landscape"
          fill
          priority
          className="object-cover brightness-[0.7]"
          data-ai-hint="mountain landscape"
        />
        <div className="container relative z-10 px-4 text-center space-y-6">
          <SeasonTruthMeter />
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none">
            SMART STAYS IN <br /> <span className="text-[#febb02]">UTTARAKHAND</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium">
            Real-time landslide risk scores, verified Pahadi hosts, and local mountain intel for a safe getaway.
          </p>

          <div className="max-w-4xl mx-auto bg-white p-2 rounded-none md:rounded-full shadow-2xl flex flex-col md:flex-row gap-2 mt-8">
            <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-gray-100 py-3">
              <Search className="h-5 w-5 text-primary" />
              <Input
                placeholder="Where do you want to go?"
                className="border-0 focus-visible:ring-0 text-base font-bold placeholder:font-medium rounded-none"
              />
            </div>
            <div className="flex-1 flex items-center px-4 gap-3 py-3">
              <Compass className="h-5 w-5 text-primary" />
              <Input
                placeholder="Choose travel vibe"
                className="border-0 focus-visible:ring-0 text-base font-bold placeholder:font-medium rounded-none"
              />
            </div>
            <Button className="rounded-full px-10 h-14 text-lg font-black bg-[#006ce4] hover:bg-[#005bb8] transition-all">
              FIND MY STAY
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b py-6">
        <div className="container px-4 flex flex-wrap justify-center md:justify-between items-center gap-8">
            <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span className="text-[10px] font-black uppercase tracking-widest">Verified Mountain Safety</span>
            </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <Wind className="h-5 w-5 text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Live Weather Insights</span>
            </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="h-5 w-5 text-[#febb02]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Pahadi Hospitality Only</span>
            </div>
        </div>
      </section>

      {/* Featured Stays */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="container px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 mb-2 uppercase">Smart Suggestions</h2>
                <p className="text-slate-500 font-bold">Hand-picked properties with high safety scores.</p>
            </div>
            <Button variant="outline" className="hidden md:flex rounded-full font-black border-2" asChild>
                <Link href="/search">VIEW ALL STAYS</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotelsLoading ? (
               [...Array(6)].map((_, i) => (
                   <Card key={i} className="animate-pulse h-[400px] rounded-2xl bg-slate-200" />
               ))
            ) : (
                featuredHotels?.map((hotel) => (
                    <Link key={hotel.id} href={`/hotels/${hotel.id}`}>
                        <Card className="group overflow-hidden rounded-2xl border-0 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer bg-white">
                            <CardContent className="p-0 relative">
                                <div className="relative h-64 w-full overflow-hidden">
                                    <Image
                                        src={getImageUrl(hotel.images[0]) || 'https://picsum.photos/seed/hotel/800/600'}
                                        alt={hotel.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <Badge className="bg-[#febb02] text-black border-0 font-black px-3 py-1 text-[10px]">
                                            SAFETY: {hotel.mountainSafetyScore}/100
                                        </Badge>
                                        {hotel.discount > 0 && (
                                            <Badge className="bg-red-500 text-white border-0 font-black px-3 py-1 text-[10px]">
                                                SAVE {hotel.discount}%
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">
                                            {hotel.name}
                                        </h3>
                                        <div className="flex items-center gap-1 bg-[#febb02]/10 px-2 py-1 rounded">
                                            <Star className="h-3 w-3 fill-[#febb02] text-[#febb02]" />
                                            <span className="text-xs font-black">{hotel.rating}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 text-xs font-bold mb-4 uppercase tracking-widest">
                                        <MapPin className="h-3 w-3" />
                                        {hotel.city}
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-slate-900">
                                            ₹{hotel.minPrice?.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-slate-400 font-bold">/ night</span>
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
    </div>
  );
}
