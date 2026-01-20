'use client';
import Image from 'next/image';
import Link from 'next/link';

import { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { HotelCard } from '@/components/hotel/HotelCard';
import { HeroSearchForm } from '@/components/home/HeroSearchForm';
import { ArrowRight } from 'lucide-react';
import type { City, Hotel } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { dummyCities, dummyHotels } from '@/lib/dummy-data';

function FeaturedHotels() {
  const firestore = useFirestore();

  const hotelsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'hotels'), limit(4));
  }, [firestore]);

  const { data: liveHotels, isLoading } = useCollection<Hotel>(hotelsQuery);

  const featuredHotels = useMemo(() => {
    if (liveHotels && liveHotels.length > 0) {
      return liveHotels;
    }
    // If firestore is empty, fall back to first 4 dummy hotels
    if (!isLoading && (!liveHotels || liveHotels.length === 0)) {
        return dummyHotels.slice(0, 4);
    }
    return [];
  }, [liveHotels, isLoading]);

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-0">
                    <Skeleton className="h-48 w-full" />
                    </CardContent>
                    <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                    </div>
                </Card>
            ))}
        </div>
    )
  }

  if (!featuredHotels || featuredHotels.length === 0) {
      return <p className="text-center text-muted-foreground">No featured hotels available yet. Add some from the admin panel!</p>
  }


  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {featuredHotels.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  );
}

function CitiesList() {
    const cities = dummyCities;

    return (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cities?.map((city) => {
            const cityImage = PlaceHolderImages.find(
              (img) => img.id === city.image
            );
            return (
              <Link href={`/search?city=${city.name}`} key={city.name}>
                <Card className="group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-64 w-full">
                      {cityImage && (
                        <Image
                          src={cityImage.imageUrl}
                          alt={city.name}
                          data-ai-hint={cityImage.imageHint}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <h3 className="absolute bottom-4 left-4 font-headline text-2xl font-bold text-white">
                        {city.name}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
    )
}

export default function HomePage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div className="space-y-16 pb-16">
      <section className="relative h-[60vh] min-h-[400px] w-full">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white p-4">
          <h1 className="font-headline text-4xl font-bold leading-tight sm:text-5xl md:text-7xl">
            Discover Serenity
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg">
            Find your perfect escape in the heart of the Himalayas. Unforgettable
            views and unparalleled hospitality await.
          </p>
        </div>
        <div className="relative z-20 mx-auto -mt-16 w-[90%] max-w-6xl">
          <HeroSearchForm />
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6">
        <div className="space-y-4 text-center">
          <h2 className="font-headline text-4xl font-bold">Explore by City</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Journey through the most enchanting cities of Uttarakhand, each offering
            a unique blend of nature, adventure, and culture.
          </p>
        </div>
        <CitiesList />
      </section>

      <section className="container mx-auto px-4 md:px-6">
        <div className="space-y-4 text-center">
          <h2 className="font-headline text-4xl font-bold">Featured Stays</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Handpicked hotels and resorts that promise an unforgettable stay
            with top-notch amenities and breathtaking views.
          </p>
        </div>
        <div className="mt-8">
            <FeaturedHotels />
        </div>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
            <Link href="/search">
              View All Hotels <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
