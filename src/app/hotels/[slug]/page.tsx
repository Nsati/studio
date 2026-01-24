'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, MapPin, BedDouble } from 'lucide-react';
import React, { useMemo } from 'react';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AmenityIcon } from '@/components/hotel/AmenityIcon';
import type { Hotel, Room, Review } from '@/lib/types';
import { useFirestore, useDoc, useCollection } from '@/firebase/client/provider';
import { doc, collection } from 'firebase/firestore';
import { dummyHotels, dummyRooms, dummyReviews } from '@/lib/dummy-data';

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
import { HotelReviewSummary } from '@/components/hotel/HotelReviewSummary';


export default function HotelPage() {
  const params = useParams();
  const slug = params.slug as string;
  const firestore = useFirestore();
  
  const hotelRef = useMemo(() => {
    if (!firestore || !slug) return null;
    return doc(firestore, 'hotels', slug);
  }, [firestore, slug]);
  
  const { data: liveHotel, isLoading } = useDoc<Hotel>(hotelRef);
  
  const roomsQuery = useMemo(() => {
    if (!firestore || !slug) return null;
    return collection(firestore, 'hotels', slug, 'rooms');
  }, [firestore, slug]);

  const { data: liveRooms, isLoading: isLoadingRooms } = useCollection<Room>(roomsQuery);

  const reviewsQuery = useMemo(() => {
    if (!firestore || !slug) return null;
    return collection(firestore, 'hotels', slug, 'reviews');
  }, [firestore, slug]);

  const { data: liveReviews, isLoading: isLoadingReviews } = useCollection<Review>(reviewsQuery);

  const hotel = useMemo(() => {
    if (isLoading) return null;
    if (liveHotel) return liveHotel;
    return dummyHotels.find(h => h.id === slug);
  }, [isLoading, liveHotel, slug]);

  const rooms = useMemo(() => {
    if (liveRooms && liveRooms.length > 0) return liveRooms;
    if (!isLoadingRooms && (!liveRooms || liveRooms.length === 0)) {
      return dummyRooms.filter(r => r.hotelId === slug);
    }
    return [];
  }, [liveRooms, isLoadingRooms, slug]);

  const reviews = useMemo(() => {
    if (liveReviews && liveReviews.length > 0) return liveReviews;
    if (!isLoadingReviews && (!liveReviews || liveReviews.length === 0)) {
        return dummyReviews.filter(r => r.hotelId === slug);
    }
    return [];
  }, [liveReviews, isLoadingReviews, slug]);

  const minPrice = useMemo(() => {
    if (!rooms || rooms.length === 0) return 0;
    const availableRooms = rooms.filter(r => (r.availableRooms ?? r.totalRooms) > 0);
    if (availableRooms.length === 0) return 0;
    return Math.min(...availableRooms.map((r) => r.price));
  }, [rooms]);

  const bookingSectionRef = React.useRef<HTMLDivElement>(null);

  const handleScrollToBooking = () => {
    bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading || isLoadingRooms || isLoadingReviews) {
    return <Loading />;
  }

  if (!hotel) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="font-headline text-3xl font-bold md:text-4xl">{hotel.name}</h1>
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
            {hotel.images.map((imgSrc, index) => {
              const isUrl = imgSrc.startsWith('http');
              const imageUrl = isUrl
                ? imgSrc
                : PlaceHolderImages.find((i) => i.id === imgSrc)?.imageUrl;
              const imgData = !isUrl
                ? PlaceHolderImages.find((i) => i.id === imgSrc)
                : null;

              return (
                <CarouselItem key={imgSrc}>
                  <div className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full overflow-hidden rounded-lg">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={imgData?.description || hotel.name}
                        data-ai-hint={imgData?.imageHint}
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
          <CarouselPrevious className="absolute left-4 bg-background/50 hover:bg-background/80" />
          <CarouselNext className="absolute right-4 bg-background/50 hover:bg-background/80" />
        </Carousel>
      </section>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-headline text-3xl font-bold mb-4">About this hotel</h2>
            <p className="text-foreground/80 leading-relaxed">{hotel.description}</p>
          </section>

          <Separator />

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

          <Separator />

          <section>
             <HotelReviewSummary reviews={reviews} hotelName={hotel.name} />
          </section>
        </div>

        <div className="lg:col-span-1" ref={bookingSectionRef}>
           <RoomBookingCard hotel={hotel} rooms={rooms} isLoadingRooms={isLoadingRooms} />
        </div>
      </div>
      
       {/* Sticky Footer for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex items-center justify-between gap-4">
        <div>
          {minPrice > 0 ? (
             <div>
                <p className="font-bold text-lg text-foreground">
                  {minPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                  <span className="text-sm font-normal text-muted-foreground">/night</span>
                </p>
                <p className="text-xs text-muted-foreground">Price for 1 adult</p>
              </div>
          ) : (
             <p className="text-sm font-semibold text-muted-foreground">Booking not available</p>
          )}
        </div>
        <Button onClick={handleScrollToBooking} disabled={minPrice === 0} size="lg">
            Book Now
        </Button>
      </div>
    </div>
  );
}
