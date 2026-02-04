
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { dummyCities } from '@/lib/dummy-data';
import { ShieldCheck, CloudSun, Users, IndianRupee, ThermometerSnowflake, Mountain, MapPin } from 'lucide-react';
import { HotelCard } from '@/components/hotel/HotelCard';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchFilters } from '@/app/search/SearchFilters';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

function SeasonTruthMeter() {
    const metrics = [
        { label: 'Crowd', value: 'Moderate', color: 'text-amber-600', icon: Users },
        { label: 'Cost', value: 'Standard', color: 'text-green-600', icon: IndianRupee },
        { label: 'Weather', value: 'Snow Possible', color: 'text-blue-600', icon: CloudSun },
        { label: 'Safety', value: 'Stable Roads', color: 'text-green-700', icon: ShieldCheck },
    ];

    return (
        <section className="py-12 px-4 bg-white border-b">
            <div className="container mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <ThermometerSnowflake className="text-primary h-6 w-6" />
                    <h2 className="text-2xl font-bold">Season Truth Meter™</h2>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full font-bold uppercase tracking-widest text-muted-foreground ml-auto">Live Uttarakhand Status</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {metrics.map((m) => (
                        <Card key={m.label} className="rounded-none border-dashed">
                            <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                                <m.icon className="h-5 w-5 text-muted-foreground" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{m.label}</p>
                                <p className={`text-lg font-black ${m.color}`}>{m.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function HomePage() {
  const firestore = useFirestore();
  const featuredHotelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'hotels'), limit(4));
  }, [firestore]);

  const { data: featuredHotels, isLoading: areHotelsLoading } = useCollection<Hotel>(featuredHotelsQuery);

  return (
    <div className="bg-background">
      {/* Search Header Hero */}
      <section className="bg-[#003580] pt-12 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
            <Image src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1080" fill className="object-cover" alt="bg" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl space-y-6 mb-10">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              Your Uttarakhand <br/> <span className="text-[#febb02]">Smart Companion</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium">
              Real-time safety scores, weather alerts, and mountain-ready stays.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <SearchFilters />
          </div>
        </div>
      </section>

      <SeasonTruthMeter />

      {/* Trending Destinations */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="mb-8 space-y-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Mountain Hubs</h2>
              <p className="text-muted-foreground font-medium">Safe routes and verified properties in top cities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dummyCities.slice(0, 2).map((city) => {
              const cityImage = PlaceHolderImages.find((img) => img.id === city.image);
              return (
                <Link
                  key={city.id}
                  href={`/search?city=${city.name}`}
                  className="group relative h-[320px] overflow-hidden rounded-sm shadow-sm"
                >
                  {cityImage && (
                    <Image
                      src={cityImage.imageUrl}
                      alt={city.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-3xl font-black">{city.name}</h3>
                    <p className="text-white/70 text-sm font-bold flex items-center gap-2 mt-1">
                        <Mountain className="h-4 w-4" /> Explore Smart Collection
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Smart Suggestions */}
      <section className="py-16 bg-[#f0f6ff] px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-2xl font-bold text-[#1a1a1a]">Smart Suggestions</h2>
                <p className="text-muted-foreground text-sm font-medium">Verified for safety and mountain comfort</p>
            </div>
            <Link href="/search" className="text-[#006ce4] font-bold hover:underline text-sm flex items-center gap-1">
              View all < IndianRupee className="h-3 w-3" />
            </Link>
          </div>
          {areHotelsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredHotels?.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel as any} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mode Promo */}
      <section className="bg-[#003580] py-20 px-4 text-white">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <h2 className="text-4xl font-black tracking-tighter">Plan your spiritual <br/> or adventure quest.</h2>
                <p className="text-white/70 text-lg">Switch to Char Dham Mode for temple proximity or Trek Mode for base-camp essentials.</p>
                <div className="flex gap-4">
                    <Button asChild className="bg-[#febb02] text-[#003580] hover:bg-[#febb02]/90 rounded-none font-bold px-8 h-12">
                        <Link href="/search?mode=chardham">Char Dham Mode</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-white text-white hover:bg-white/10 rounded-none font-bold px-8 h-12">
                        <Link href="/search?mode=trek">Trek Mode</Link>
                    </Button>
                </div>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
                <Image src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1080" fill className="object-cover" alt="mountains" />
            </div>
        </div>
      </section>
    </div>
  );
}
