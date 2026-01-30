'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, MapPin, Compass, Share2, Heart, ShieldCheck } from 'lucide-react';
import React, { useMemo } from 'react';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="min-h-screen bg-white">
      {/* Editorial Header */}
      <div className="container mx-auto px-6 pt-12 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
                <div className="flex items-center gap-3">
                    {hotel.isVerifiedPahadiHost && (
                        <Badge className="bg-primary/5 text-primary border-primary/10 hover:bg-primary/5 px-4 py-1 rounded-full font-bold uppercase text-[10px] tracking-widest">
                            Verified Host
                        </Badge>
                    )}
                    <div className="flex items-center gap-1.5 text-accent font-bold">
                        <Star className="h-4 w-4 fill-accent" />
                        <span className="text-sm">{hotel.rating} Rating</span>
                    </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">{hotel.name}</h1>
                <div className="flex items-center gap-4 text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{hotel.city}, Uttarakhand</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="rounded-full hover:bg-primary/5 transition-all"><Share2 className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="rounded-full hover:bg-destructive/5 transition-all"><Heart className="h-4 w-4" /></Button>
            </div>
        </div>
      </div>

      {/* Massive Airbnb Style Gallery */}
      <div className="container mx-auto px-6 mb-16">
        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden">
            <div className="col-span-2 row-span-2 relative group cursor-pointer">
                <Image src={hotel.images[0]?.startsWith('http') ? hotel.images[0] : (PlaceHolderImages.find(i => i.id === hotel.images[0])?.imageUrl || '')} alt="Primary" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="col-span-1 row-span-1 relative group cursor-pointer">
                <Image src={hotel.images[1]?.startsWith('http') ? hotel.images[1] : (PlaceHolderImages.find(i => i.id === hotel.images[1])?.imageUrl || '')} alt="Gallery 1" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="col-span-1 row-span-1 relative group cursor-pointer">
                <Image src={hotel.images[2]?.startsWith('http') ? hotel.images[2] : (PlaceHolderImages.find(i => i.id === hotel.images[2])?.imageUrl || '')} alt="Gallery 2" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="col-span-1 row-span-1 relative group cursor-pointer">
                <Image src={hotel.images[3]?.startsWith('http') ? hotel.images[3] : (PlaceHolderImages.find(i => i.id === hotel.images[3])?.imageUrl || '')} alt="Gallery 3" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="col-span-1 row-span-1 relative group cursor-pointer bg-primary">
                {hotel.images.length > 4 ? (
                    <Image src={hotel.images[4]?.startsWith('http') ? hotel.images[4] : (PlaceHolderImages.find(i => i.id === hotel.images[4])?.imageUrl || '')} alt="Gallery 4" fill className="object-cover opacity-50 transition-transform duration-700 group-hover:scale-105" />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold tracking-widest text-xs uppercase bg-black/20">
                    View All Photos
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-16">
                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        <Compass className="h-4 w-4" /> The Experience
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight">Immerse Yourself</h2>
                    <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                        {hotel.description}
                    </p>
                </section>

                <Separator className="opacity-50" />

                {/* Modern Amenities Grid */}
                <section className="space-y-10">
                    <h2 className="text-3xl font-bold tracking-tight">Luxury Amenities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        {hotel.amenities.map((amenity) => (
                            <div key={amenity} className="flex items-center gap-4 group">
                                <div className="p-4 bg-muted/50 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    <AmenityIcon amenity={amenity} className="h-6 w-6" />
                                </div>
                                <span className="font-bold tracking-tight capitalize">{amenity.replace('-', ' ')}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {hotel.safetyInfo && (
                    <section className="p-10 rounded-[2.5rem] bg-blue-50 border border-blue-100 space-y-6">
                        <div className="flex items-center gap-2 text-blue-600 font-black uppercase tracking-[0.2em] text-[10px]">
                            <ShieldCheck className="h-4 w-4" /> Safety First
                        </div>
                        <h3 className="text-2xl font-bold text-blue-900 tracking-tight">Premium Care & Support</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-800 font-medium">
                            <div className="flex items-center gap-3"><Badge className="bg-blue-200 text-blue-800">Hospital</Badge> <span>{hotel.safetyInfo.nearestHospital}</span></div>
                            <div className="flex items-center gap-3"><Badge className="bg-blue-200 text-blue-800">Network</Badge> <span className="capitalize">{hotel.safetyInfo.networkCoverage} Coverage</span></div>
                        </div>
                    </section>
                )}

                {user && !user.isAnonymous && (
                    <section className="pt-12">
                        <WriteReviewForm hotelId={slug} userId={user.uid} userHasReviewed={false} />
                    </section>
                )}
            </div>

            {/* Sticky Right Card */}
            <div className="lg:col-span-1">
                <RoomBookingCard hotel={hotel as any} rooms={rooms} isLoadingRooms={isLoadingRooms} />
            </div>
        </div>
      </div>
    </div>
  );
}