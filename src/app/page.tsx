'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { dummyCities, dummyTourPackages } from '@/lib/dummy-data';
import { ArrowRight, Sparkles, MapPin, Compass } from 'lucide-react';
import { HotelCard } from '@/components/hotel/HotelCard';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchFilters } from '@/app/search/SearchFilters';

function FeaturedHotelsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
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
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full flex items-end justify-center pb-24 overflow-hidden">
        {heroImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover scale-105 animate-in fade-in duration-1000"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-background" />
          </div>
        )}
        <div className="relative z-10 w-full max-w-5xl px-6 text-center space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest border border-white/20">
              <Compass className="h-3 w-3" /> Explore the Himalayas
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              Design Your Perfect <br/><span className="italic font-heading font-medium text-white/90">Himalayan Escape</span>
            </h1>
          </div>
          <div className="w-full max-w-4xl mx-auto p-2 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-2xl">
            <SearchFilters />
          </div>
        </div>
      </section>

      {/* Featured Cities - Apple Horizontal Scroll style */}
      <section id="cities" className="py-24 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight">Destinations</h2>
              <p className="text-muted-foreground text-lg max-w-md">The most enchanting corners of Devbhoomi.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {dummyCities.map((city) => {
              const cityImage = PlaceHolderImages.find((img) => img.id === city.image);
              return (
                <Link
                  key={city.id}
                  href={`/search?city=${city.name}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-[2rem] shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  {cityImage && (
                    <Image
                      src={cityImage.imageUrl}
                      alt={city.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 16vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {city.name}
                    </h3>
                    <p className="text-white/70 text-xs mt-1 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                      Explore stays <ArrowRight className="inline h-3 w-3 ml-1" />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Hotels - Airbnb Grid style */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight">Curated Stays</h2>
              <p className="text-muted-foreground text-lg">Handpicked for exceptional comfort and views.</p>
            </div>
            <Button variant="outline" asChild className="rounded-full px-8 hover:bg-primary hover:text-white transition-all">
              <Link href="/search">View All Stays</Link>
            </Button>
          </div>
          {areHotelsLoading ? (
            <FeaturedHotelsSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredHotels?.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </section>

       {/* Tour Packages - Luxury Wide Cards */}
       <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
             <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Exclusive Journeys</h2>
             <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Seamlessly planned all-inclusive experiences to discover the soul of the mountains.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {dummyTourPackages.slice(0, 3).map((pkg) => {
              const pkgImage = PlaceHolderImages.find(img => img.id === pkg.image);
              return (
                <Link key={pkg.id} href="/tour-packages" className="group block">
                  <div className="space-y-6">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] shadow-lg">
                      {pkgImage && (
                        <Image 
                          src={pkgImage.imageUrl} 
                          alt={pkg.title} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                      )}
                      <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-primary shadow-sm">
                        {pkg.duration}
                      </div>
                    </div>
                    <div className="px-2 space-y-2">
                      <h3 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">{pkg.title}</h3>
                      <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">{pkg.description}</p>
                      <div className="flex items-center gap-2 pt-2 text-primary font-bold">
                        <span>From {pkg.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section - Apple Style */}
      <section className="py-24 container mx-auto px-6">
        <div className="relative rounded-[3rem] bg-primary overflow-hidden p-12 md:p-24 text-center text-white space-y-8">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/seed/bg/1200/800')] opacity-10 mix-blend-overlay" />
            <Sparkles className="h-12 w-12 mx-auto text-accent mb-4" />
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready for the heights?</h2>
            <p className="text-white/80 text-xl max-w-xl mx-auto">Your journey to the heart of the Himalayas begins here. Book your serenity today.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="rounded-full px-10 h-14 bg-white text-primary hover:bg-white/90 font-bold text-lg">
                    Start Planning
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-10 h-14 border-white/20 hover:bg-white/10 text-white font-bold text-lg">
                    Contact an Expert
                </Button>
            </div>
        </div>
      </section>
    </div>
  );
}