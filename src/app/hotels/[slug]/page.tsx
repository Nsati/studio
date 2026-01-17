'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, MapPin, BedDouble } from 'lucide-react';
import React, { useMemo } from 'react';
import { doc } from 'firebase/firestore';

import type { Hotel } from '@/lib/types';
import { useDoc, useFirestore } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AmenityIcon } from '@/components/hotel/AmenityIcon';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { RoomBookingCard } from '@/components/hotel/RoomBookingCard';
import { Button } from '@/components/ui/button';
import Loading from './loading';


export default function HotelPage() {
  const { slug } = useParams();
  const firestore = useFirestore();
  
  const hotelRef = useMemo(() => {
    if (!firestore || !slug) return null;
    return doc(firestore, 'hotels', slug as string);
  }, [firestore, slug]);

  const { data: hotel, isLoading } = useDoc<Hotel>(hotelRef);
  const bookingSectionRef = React.useRef<HTMLDivElement>(null);

  const handleScrollToBooking = () => {
    bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!hotel) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="font-headline text-4xl font-bold">{hotel.name}</h1>
            <Button onClick={handleScrollToBooking} className="mt-4 md:mt-0">
                <BedDouble className="mr-2 h-5 w-5" />
                Book a Room
            </Button>
        </div>
        <div className="mt-2 flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-5 w-5" />
            <span>{hotel.city}</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-amber-500">
            <Star className="h-5 w-5 fill-current" />
            <span>{hotel.rating}</span>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <Carousel className="w-full">
          <CarouselContent>
            {hotel.images.map((imgId, index) => {
              const imgData = PlaceHolderImages.find((i) => i.id === imgId);
              return (
                <CarouselItem key={index}>
                  <div className="relative h-[500px] w-full overflow-hidden rounded-lg">
                    {imgData && (
                      <Image
                        src={imgData.imageUrl}
                        alt={imgData.description}
                        data-ai-hint={imgData.imageHint}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    )}
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4" />
          <CarouselNext className="absolute right-4" />
        </Carousel>
      </section>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="mb-8">
            <h2 className="font-headline text-3xl font-bold mb-4">About this hotel</h2>
            <p className="text-foreground/80 leading-relaxed">{hotel.description}</p>
          </section>

          <Separator className="my-8" />

          <section>
            <h2 className="font-headline text-3xl font-bold mb-6">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {hotel.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-3">
                  <AmenityIcon amenity={amenity} className="h-6 w-6 text-primary" />
                  <span className="capitalize">{amenity}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1" ref={bookingSectionRef}>
           <RoomBookingCard hotel={hotel} />
        </div>
      </div>
    </div>
  );
}
