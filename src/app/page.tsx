
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { dummyCities, dummyTourPackages } from '@/lib/dummy-data';
import { ArrowRight } from 'lucide-react';
import { HotelCard } from '@/components/hotel/HotelCard';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchFilters } from '@/app/search/SearchFilters';


function FeaturedHotelsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <Skeleton className="aspect-[4/3] w-full" />
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <div className="p-4 pt-0">
            <Skeleton className="h-5 w-1/4" />
          </div>
        </Card>
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
    <div className="pb-16 md:pb-0">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center text-center text-white">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-4 flex flex-col items-center w-full max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
            Your Himalayan Escape
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl font-sans" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
            Discover serene hotels and breathtaking views in the heart of Uttarakhand.
          </p>
          <div className="mt-8 w-full p-3">
            <SearchFilters />
          </div>
        </div>
      </section>

      {/* Featured Cities Section */}
      <section id="cities" className="py-16 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Explore by City</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto font-sans">From tranquil lakes to spiritual hubs, find your perfect destination.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {dummyCities.map((city) => {
              const cityImage = PlaceHolderImages.find((img) => img.id === city.image);
              return (
                <Link
                  key={city.id}
                  href={`/search?city=${city.name}`}
                  className="group relative block aspect-square overflow-hidden rounded-lg shadow-sm"
                >
                  {cityImage && (
                    <Image
                      src={cityImage.imageUrl}
                      alt={city.name}
                      data-ai-hint={cityImage.imageHint}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <h3 className="absolute bottom-3 left-3 text-lg font-bold text-white">
                    {city.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="py-16">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold">Featured Stays</h2>
              <p className="text-muted-foreground mt-2 font-sans">Handpicked hotels for an unforgettable experience.</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/search">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          {areHotelsLoading ? (
            <FeaturedHotelsSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredHotels?.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </section>

       {/* Tour Packages Section */}
       <section className="py-16 bg-muted/50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
             <div>
                <h2 className="text-3xl font-bold">Curated Tour Packages</h2>
                <p className="text-muted-foreground mt-2 font-sans">All-inclusive journeys to explore the best of Uttarakhand.</p>
              </div>
               <Button variant="outline" asChild>
                <Link href="/tour-packages">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dummyTourPackages.slice(0, 3).map((pkg) => {
              const pkgImage = PlaceHolderImages.find(img => img.id === pkg.image);
              return (
                <Link key={pkg.id} href="/tour-packages" className="group block">
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="p-0 relative w-full aspect-[16/9]">
                      {pkgImage && <Image src={pkgImage.imageUrl} alt={pkg.title} fill className="object-cover" />}
                    </div>
                    <CardHeader>
                      <h3 className="text-xl font-semibold leading-tight group-hover:text-primary">{pkg.title}</h3>
                      <p className="text-muted-foreground !mt-1 font-sans">{pkg.duration}</p>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
