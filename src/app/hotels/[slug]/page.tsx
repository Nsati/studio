'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, MapPin, Compass, Share2, Heart, ShieldCheck } from 'lucide-react';
import React from 'react';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AmenityIcon } from '@/components/hotel/AmenityIcon';
import type { Hotel, Room, Review } from '@/lib/types';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

import { Separator } from '@/components/ui/separator';
import { RoomBookingCard } from '@/components/hotel/RoomBookingCard';
import { Button } from '@/components/ui/button';
import Loading from './loading';
import { WriteReviewForm } from '@/components/hotel/WriteReviewForm';
import { Badge } from '@/components/ui/badge';

export default function HotelPage() {
  const params = useParams();
  const slug = params.slug as string;
  const firestore = useFirestore();
  const { user } = useUser();
  
  const hotelRef = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    return doc(firestore, 'hotels', slug);
  }, [firestore, slug]);
  
  const { data: hotel, isLoading } = useDoc<Hotel>(hotelRef);
  
  const roomsQuery = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    return collection(firestore, 'hotels', slug, 'rooms');
  }, [firestore, slug]);

  const { data: rooms, isLoading: isLoadingRooms } = useCollection<Room>(roomsQuery);

  const reviewsQuery = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    return collection(firestore, 'hotels', slug, 'reviews');
  }, [firestore, slug]);

  const { data: reviews, isLoading: isLoadingReviews } = useCollection<Review>(reviewsQuery);

  if (isLoading || isLoadingRooms || isLoadingReviews) {
    return <Loading />;
  }

  if (!hotel || !rooms || !reviews) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Editorial Header - Apple Style */}
      <div className="container mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-6 md:pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">
            <div className="space-y-4 md:space-y-6 max-w-4xl">
                <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                    {hotel.isVerifiedPahadiHost && (
                        <Badge className="bg-primary/10 text-primary border-0 hover:bg-primary/10 px-4 md:px-5 py-1.5 rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em]">
                            Verified Host
                        </Badge>
                    )}
                    <div className="flex items-center gap-2 text-accent font-black">
                        <Star className="h-3.5 w-3.5 fill-accent" />
                        <span className="text-[10px] md:text-xs tracking-widest uppercase">{hotel.rating} Excellence</span>
                    </div>
                </div>
                <h1 className="text-4xl md:text-8xl font-black tracking-tighter leading-[0.95] text-foreground">{hotel.name}</h1>
                <div className="flex items-center gap-4 md:gap-6 text-muted-foreground font-bold text-base md:text-lg">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        <span>{hotel.city}, Uttarakhand</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 md:h-14 md:w-14 hover:bg-primary/5 transition-all shadow-apple"><Share2 className="h-4 w-4 md:h-5 md:w-5" /></Button>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 md:h-14 md:w-14 hover:bg-destructive/5 transition-all shadow-apple"><Heart className="h-4 w-4 md:h-5 md:w-5" /></Button>
            </div>
        </div>
      </div>

      {/* Massive Magazine-Style Gallery - Responsive Adaptation */}
      <div className="container mx-auto px-4 md:px-6 mb-12 md:mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-3 md:grid-rows-2 gap-2 md:gap-4 h-[400px] md:h-[750px] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-apple-deep">
            {/* Primary Image */}
            <div className="col-span-2 row-span-2 md:row-span-2 relative group cursor-pointer overflow-hidden">
                <Image src={hotel.images[0]?.startsWith('http') ? hotel.images[0] : (PlaceHolderImages.find(i => i.id === hotel.images[0])?.imageUrl || '')} alt="Primary" fill className="object-cover transition-transform duration-2000 group-hover:scale-105" priority />
            </div>
            {/* Secondary Images - Flexible for Mobile */}
            <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden hidden md:block">
                <Image src={hotel.images[1]?.startsWith('http') ? hotel.images[1] : (PlaceHolderImages.find(i => i.id === hotel.images[1])?.imageUrl || '')} alt="Gallery 1" fill className="object-cover transition-transform duration-2000 group-hover:scale-105" />
            </div>
            <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden hidden md:block">
                <Image src={hotel.images[2]?.startsWith('http') ? hotel.images[2] : (PlaceHolderImages.find(i => i.id === hotel.images[2])?.imageUrl || '')} alt="Gallery 2" fill className="object-cover transition-transform duration-2000 group-hover:scale-105" />
            </div>
            <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
                <Image src={hotel.images[1]?.startsWith('http') ? hotel.images[1] : (PlaceHolderImages.find(i => i.id === (hotel.images[3] || hotel.images[1]))?.imageUrl || '')} alt="Gallery 3" fill className="object-cover transition-transform duration-2000 group-hover:scale-105" />
            </div>
            <div className="col-span-1 row-span-1 relative group cursor-pointer bg-primary overflow-hidden">
                {hotel.images.length > 2 ? (
                    <Image src={hotel.images[2]?.startsWith('http') ? hotel.images[2] : (PlaceHolderImages.find(i => i.id === (hotel.images[4] || hotel.images[2]))?.imageUrl || '')} alt="Gallery 4" fill className="object-cover opacity-40 transition-transform duration-2000 group-hover:scale-105" />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center text-white font-black tracking-[0.1em] md:tracking-[0.2em] text-[10px] md:text-xs uppercase bg-black/20 backdrop-blur-sm group-hover:bg-black/40 transition-all duration-500 text-center px-2">
                    View Photos
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 pb-20 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-24">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-16 md:space-y-24">
                <section className="space-y-6 md:space-y-8">
                    <div className="flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary">
                        <Compass className="h-4 w-4 md:h-5 md:w-5" /> The Experience
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight">Immerse Yourself</h2>
                    <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed font-medium">
                        {hotel.description}
                    </p>
                </section>

                <Separator className="opacity-30" />

                {/* Modern Amenities Grid */}
                <section className="space-y-8 md:space-y-12">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight">Luxury Amenities</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-10">
                        {hotel.amenities.map((amenity) => (
                            <div key={amenity} className="flex items-center gap-3 md:gap-5 group">
                                <div className="p-4 md:p-5 bg-white shadow-apple rounded-[1.2rem] md:rounded-[2rem] group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:scale-110 shrink-0">
                                    <AmenityIcon amenity={amenity} className="h-5 w-5 md:h-7 md:w-7" />
                                </div>
                                <span className="font-bold tracking-tight text-sm md:text-lg capitalize">{amenity.replace('-', ' ')}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {hotel.safetyInfo && (
                    <section className="p-8 md:p-16 rounded-[2rem] md:rounded-[4rem] bg-white shadow-apple-deep border border-black/5 space-y-8 md:space-y-10">
                        <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">
                            <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" /> Premium Safety
                        </div>
                        <h3 className="text-2xl md:text-4xl font-black tracking-tight">Care & Protection</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 text-base md:text-lg font-bold">
                            <div className="flex items-center gap-3 md:gap-4">
                                <Badge className="bg-muted text-primary h-8 md:h-10 px-4 md:px-6 rounded-full border-0 text-[10px] md:text-sm">Hospital</Badge> 
                                <span className="text-muted-foreground text-sm md:text-lg">{hotel.safetyInfo.nearestHospital}</span>
                            </div>
                            <div className="flex items-center gap-3 md:gap-4">
                                <Badge className="bg-muted text-primary h-8 md:h-10 px-4 md:px-6 rounded-full border-0 text-[10px] md:text-sm">Network</Badge> 
                                <span className="capitalize text-muted-foreground text-sm md:text-lg">{hotel.safetyInfo.networkCoverage} Coverage</span>
                            </div>
                        </div>
                    </section>
                )}

                {user && !user.isAnonymous && (
                    <section className="pt-8 md:pt-12">
                        <WriteReviewForm hotelId={slug} userId={user.uid} userHasReviewed={false} />
                    </section>
                )}
            </div>

            {/* Sticky Right Card - Apple Style */}
            <div className="lg:col-span-1 order-first lg:order-last">
                <div className="lg:sticky lg:top-28">
                    <RoomBookingCard hotel={hotel as any} rooms={rooms} isLoadingRooms={isLoadingRooms} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
