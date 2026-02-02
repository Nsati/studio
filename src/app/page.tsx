'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { dummyCities } from '@/lib/dummy-data';
import { ArrowRight, MapPin, Star, Building2, Trees, Waves } from 'lucide-react';
import { HotelCard } from '@/components/hotel/HotelCard';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchFilters } from '@/app/search/SearchFilters';
import React from 'react';

function FeaturedHotelsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] w-full rounded-none" />
      ))}
    </div>
  )
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
      <section className="bg-[#003580] pt-8 pb-12 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl space-y-6 mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Find your next stay
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Search deals on hotels, homes, and much more...
            </p>
          </div>
          
          <div className="relative -bottom-16 z-20 max-w-6xl mx-auto">
            <SearchFilters />
          </div>
        </div>
      </section>

      {/* Spacing for Search Bar */}
      <div className="h-20" />

      {/* Destinations */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="mb-8 space-y-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Trending destinations</h2>
              <p className="text-muted-foreground">Most popular choices for travelers from India</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dummyCities.slice(0, 2).map((city) => {
              const cityImage = PlaceHolderImages.find((img) => img.id === city.image);
              return (
                <Link
                  key={city.id}
                  href={`/search?city=${city.name}`}
                  className="group relative h-[280px] overflow-hidden rounded-lg shadow-sm"
                >
                  {cityImage && (
                    <Image
                      src={cityImage.imageUrl}
                      alt={city.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-6 left-6 text-white">
                    <h3 className="text-3xl font-bold flex items-center gap-2">
                      {city.name} <Image src="https://image2url.com/images/india-flag.png" width={24} height={16} alt="IN" className="rounded-sm" />
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {dummyCities.slice(2, 5).map((city) => {
              const cityImage = PlaceHolderImages.find((img) => img.id === city.image);
              return (
                <Link
                  key={city.id}
                  href={`/search?city=${city.name}`}
                  className="group relative h-[200px] overflow-hidden rounded-lg shadow-sm"
                >
                  {cityImage && (
                    <Image
                      src={cityImage.imageUrl}
                      alt={city.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-4 left-4 text-white">
                    <h3 className="text-2xl font-bold">{city.name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Browse by Property Type */}
      <section className="py-12 bg-white px-4">
        <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-6">Browse by property type</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[
                    { icon: Building2, label: 'Hotels' },
                    { icon: Trees, label: 'Resorts' },
                    { icon: Waves, label: 'Villas' },
                    { icon: Star, label: 'Cabins' },
                    { icon: Building2, label: 'Cottages' },
                ].map((type, i) => (
                    <div key={i} className="space-y-3 cursor-pointer group">
                        <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-muted">
                            <Image 
                                src={`https://picsum.photos/seed/${i+50}/400/300`} 
                                fill 
                                className="object-cover group-hover:scale-105 transition-transform" 
                                alt={type.label}
                            />
                        </div>
                        <p className="font-bold text-[#1a1a1a]">{type.label}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Homes guests love */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Signature Experiences</h2>
            <Link href="/search" className="text-[#006ce4] font-bold hover:underline text-sm">
              Discover all stays
            </Link>
          </div>
          {areHotelsLoading ? (
            <FeaturedHotelsSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredHotels?.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel as any} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subscription Banner */}
      <section className="bg-[#003580] py-16 px-4 mt-12">
        <div className="container mx-auto text-center text-white space-y-6">
            <h2 className="text-3xl font-bold">Save time, save money!</h2>
            <p className="text-white/80">Sign up and we&apos;ll send the best deals to you</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-lg mx-auto">
                <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full h-12 px-4 rounded-sm text-black focus:outline-none"
                />
                <Button className="bg-[#006ce4] hover:bg-[#005bb8] h-12 px-8 rounded-sm font-bold text-lg w-full sm:w-auto">
                    Subscribe
                </Button>
            </div>
        </div>
      </section>
    </div>
  );
}