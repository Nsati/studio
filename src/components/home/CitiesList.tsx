
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import type { City } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { dummyCities } from '@/lib/dummy-data';

export function CitiesList() {
    const firestore = useFirestore();

    const citiesQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'cities');
    }, [firestore]);

    const { data: citiesFromDB, isLoading } = useCollection<City>(citiesQuery);

    const cities = useMemo(() => {
        if (citiesFromDB && citiesFromDB.length > 0) {
            return citiesFromDB.sort((a,b) => a.name.localeCompare(b.name));
        }
        if (!isLoading && (!citiesFromDB || citiesFromDB.length === 0)) {
            return dummyCities;
        }
        return [];
      }, [citiesFromDB, isLoading]);

    if (isLoading) {
      return (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
             <Skeleton key={i} className="w-full aspect-[4/3] rounded-lg" />
          ))}
        </div>
      )
    }

    return (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cities?.map((city) => {
            const cityImage = PlaceHolderImages.find(
              (img) => img.id === city.image
            );
            return (
              <Link href={`/search?city=${city.name}`} key={city.name}>
                <Card className="group overflow-hidden border-border">
                  <CardContent className="p-0">
                    <div className="relative w-full aspect-[4/3]">
                      {cityImage && (
                        <Image
                          src={cityImage.imageUrl}
                          alt={city.name}
                          data-ai-hint={cityImage.imageHint}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
