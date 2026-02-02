'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { dummyCities, dummyTourPackages } from '@/lib/dummy-data';
import { ArrowRight, Sparkles, MapPin, Compass, Mountain, Cloud, Star } from 'lucide-react';
import { HotelCard } from '@/components/hotel/HotelCard';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchFilters } from '@/app/search/SearchFilters';
import React from 'react';

function FeaturedHotelsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[4/5] w-full rounded-[2.5rem]" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');
  const firestore = useFirestore();
  const featuredHotelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'hotels'), limit(4));
  }, [firestore]);

  const { data: featuredHotels, isLoading: areHotelsLoading } = useCollection<Hotel>(featuredHotelsQuery);

  return (
    <div className="bg-background">
      {/* Immersive Hero Section */}
      <section className="relative min-h-[85vh] w-full flex flex-col items-center justify-center overflow-hidden px-4 md:px-6 pt-20 pb-32">
        {heroImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover animate-slow-zoom"
              priority
            />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>
        )}
        
        <div className="relative z-10 w-full max-w-6xl text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.25em] border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Compass className="h-3.5 w-3.5" /> Curating Himalayan Dreams
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-white leading-[0.9] tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Book Your <br/><span className="italic font-heading font-medium text-accent">Escape</span>
            </h1>
            <p className="text-white/80 text-lg md:text-2xl font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-400">
                Experience the magic of Uttarakhand with handpicked stays and exclusive local journeys.
            </p>
          </div>
          
          {/* Prominent Standard Search Box */}
          <div className="w-full max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-500">
            <div className="bg-white p-2 md:p-4 rounded-[2.5rem] md:rounded-[4rem] shadow-apple-deep">
                <SearchFilters />
            </div>
          </div>
        </div>
      </section>

      {/* Industry destinations grid */}
      <section id="cities" className="py-24 bg-white px-4 md:px-6">
        <div className="container mx-auto">
          <div className="text-center md:text-left mb-16 space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                <MapPin className="h-4 w-4" /> Explore Destinations
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">The Collection</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {dummyCities.map((city, idx) => {
              const cityImage = PlaceHolderImages.find((img) => img.id === city.image);
              return (
                <Link
                  key={city.id}
                  href={`/search?city=${city.name}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-[2rem] shadow-apple transition-all duration-700 hover:shadow-apple-deep hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 duration-1000"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {cityImage && (
                    <Image
                      src={cityImage.imageUrl}
                      alt={city.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 16vw"
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                      {city.name}
                    </h3>
                    <div className="text-white/70 text-[9px] font-black uppercase tracking-widest mt-2 flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      Discover <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Stays */}
      <section className="py-24 bg-muted/20 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                <Star className="h-4 w-4 fill-primary" /> Curated Stays
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Signature Experiences</h2>
            </div>
            <Button variant="outline" asChild className="rounded-full px-10 h-14 border-black/10 hover:bg-primary hover:text-white transition-all font-bold text-base shadow-apple">
              <Link href="/search">Explore All Properties</Link>
            </Button>
          </div>
          {areHotelsLoading ? (
            <FeaturedHotelsSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {featuredHotels?.map((hotel, idx) => (
                <div key={hotel.id} className="animate-in fade-in slide-in-from-bottom-12 duration-1000" style={{ animationDelay: `${idx * 150}ms` }}>
                    <HotelCard hotel={hotel} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust & Safety Final CTA */}
      <section className="py-24 px-4 md:px-6 container mx-auto">
        <div className="relative rounded-[3rem] md:rounded-[5rem] bg-primary overflow-hidden p-12 md:p-32 text-center text-white space-y-10 shadow-apple-deep group">
            <div className="absolute inset-0 z-0">
                <Image 
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
                    alt="Mountain range"
                    fill
                    className="object-cover opacity-30 mix-blend-overlay animate-slow-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-black/40" />
            </div>

            <div className="relative z-10 space-y-10">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md text-accent text-[10px] font-black uppercase tracking-[0.4em] border border-white/10">
                        <Sparkles className="h-4 w-4" /> Ready for the Heights?
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                        Your Journey <br/><span className="text-accent italic font-heading font-medium">Starts Here</span>
                    </h2>
                </div>
                
                <p className="text-white/80 text-lg md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed">
                    Verified hosts, secure payments, and 24/7 support for your perfect Himalayan retreat.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
                    <Button 
                        size="lg" 
                        asChild
                        className="w-full sm:w-auto rounded-full px-12 h-20 bg-white text-primary hover:bg-accent hover:text-white font-black text-xl shadow-2xl transition-all active:scale-95"
                    >
                        <Link href="/search">Find a Stay</Link>
                    </Button>
                    <Button 
                        variant="outline" 
                        size="lg" 
                        asChild
                        className="w-full sm:w-auto rounded-full px-12 h-20 border-2 border-white/40 bg-transparent text-white hover:bg-white/10 hover:border-white font-black text-xl transition-all shadow-none"
                    >
                        <Link href="/contact">Help Center <HelpCircle className="ml-3 h-6 w-6" /></Link>
                    </Button>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}

function HelpCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
        </svg>
    )
}
