'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, MapPin, Compass, Share2, Heart, ShieldCheck, ArrowLeft, Clock, Info } from 'lucide-react';
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
import Link from 'next/link';

export default function HotelPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
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
    <div className="min-h-screen bg-background pb-32">
      {/* Editorial Header */}
      <div className="container mx-auto px-4 md:px-6 pt-8 pb-10">
        <div className="mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="rounded-full px-4 h-10 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center gap-4 flex-wrap">
                    {hotel.isVerifiedPahadiHost && (
                        <Badge className="bg-primary/10 text-primary border-0 px-5 py-1.5 rounded-full font-black uppercase text-[10px] tracking-[0.2em]">
                            Verified Pahadi Host
                        </Badge>
                    )}
                    <div className="flex items-center gap-2 text-accent font-black">
                        <Star className="h-4 w-4 fill-accent" />
                        <span className="text-xs tracking-widest uppercase">{hotel.rating} Excellence</span>
                    </div>
                </div>
                <h1 className="text-4xl md:text-8xl font-black tracking-tighter leading-[0.95] text-foreground">{hotel.name}</h1>
                <div className="flex items-center gap-6 text-muted-foreground font-bold text-lg">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span>{hotel.city}, Uttarakhand</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="rounded-full h-14 w-14 hover:bg-primary/5 transition-all shadow-apple"><Share2 className="h-5 w-5" /></Button>
                <Button variant="outline" size="icon" className="rounded-full h-14 w-14 hover:bg-destructive/5 transition-all shadow-apple"><Heart className="h-5 w-5" /></Button>
            </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="container mx-auto px-4 md:px-6 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-3 md:grid-rows-2 gap-4 h-[400px] md:h-[750px] rounded-[3rem] overflow-hidden shadow-apple-deep">
            <div className="col-span-2 row-span-2 relative group overflow-hidden">
                <Image src={hotel.images[0]?.startsWith('http') ? hotel.images[0] : (PlaceHolderImages.find(i => i.id === hotel.images[0])?.imageUrl || '')} alt="Primary" fill className="object-cover transition-transform duration-2000 group-hover:scale-105" priority />
            </div>
            <div className="col-span-1 row-span-1 relative group overflow-hidden hidden md:block">
                <Image src={hotel.images[1]?.startsWith('http') ? hotel.images[1] : (PlaceHolderImages.find(i => i.id === hotel.images[1])?.imageUrl || '')} alt="Gallery 1" fill className="object-cover transition-transform duration-2000 group-hover:scale-105" />
            </div>
            <div className="col-span-1 row-span-1 relative group overflow-hidden hidden md:block">
                <Image src={hotel.images[2]?.startsWith('http') ? hotel.images[2] : (PlaceHolderImages.find(i => i.id === hotel.images[2])?.imageUrl || '')} alt="Gallery 2" fill className="object-cover transition-transform duration-2000 group-hover:scale-105" />
            </div>
            <div className="col-span-1 row-span-1 relative group overflow-hidden">
                <Image src={hotel.images[1]?.startsWith('http') ? hotel.images[1] : (PlaceHolderImages.find(i => i.id === (hotel.images[3] || hotel.images[1]))?.imageUrl || '')} alt="Gallery 3" fill className="object-cover transition-transform duration-2000 group-hover:scale-105" />
            </div>
            <div className="col-span-1 row-span-1 relative group bg-primary overflow-hidden">
                {hotel.images.length > 2 && (
                    <Image src={hotel.images[2]?.startsWith('http') ? hotel.images[2] : (PlaceHolderImages.find(i => i.id === (hotel.images[4] || hotel.images[2]))?.imageUrl || '')} alt="Gallery 4" fill className="object-cover opacity-40" />
                )}
                <div className="absolute inset-0 flex items-center justify-center text-white font-black tracking-[0.2em] text-xs uppercase bg-black/20 backdrop-blur-sm group-hover:bg-black/40 transition-all cursor-pointer">
                    View Photos
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-24">
                <section className="space-y-8">
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-primary">
                        <Compass className="h-5 w-5" /> The Experience
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">Immerse Yourself</h2>
                    <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium">
                        {hotel.description}
                    </p>
                </section>

                <Separator className="opacity-30" />

                <section className="space-y-12">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight">Luxury Amenities</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
                        {hotel.amenities.map((amenity) => (
                            <div key={amenity} className="flex items-center gap-5 group">
                                <div className="p-5 bg-white shadow-apple rounded-[2rem] group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:scale-110 shrink-0">
                                    <AmenityIcon amenity={amenity} className="h-7 w-7" />
                                </div>
                                <span className="font-bold tracking-tight text-lg capitalize">{amenity.replace('-', ' ')}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Policies Section - Standard Practice */}
                <section className="p-10 md:p-16 rounded-[3rem] bg-white shadow-apple-deep border border-black/5 space-y-12">
                    <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-xs">
                        <Info className="h-6 w-6" /> Stay Policies
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                                <Clock className="h-4 w-4" /> Timing
                            </div>
                            <div className="space-y-2">
                                <p className="font-bold text-lg">Check-in: <span className="text-primary ml-2">12:00 PM</span></p>
                                <p className="font-bold text-lg">Check-out: <span className="text-primary ml-2">11:00 AM</span></p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                                <ShieldCheck className="h-4 w-4" /> Safety
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                    Valid ID proof (Aadhar/Passport) is mandatory for all guests during check-in.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {user && !user.isAnonymous && (
                    <section className="pt-12">
                        <WriteReviewForm hotelId={slug} userId={user.uid} userHasReviewed={false} />
                    </section>
                )}
            </div>

            {/* Desktop Sticky Booking Card */}
            <div className="lg:col-span-1 hidden lg:block">
                <div className="sticky top-28">
                    <RoomBookingCard hotel={hotel as any} rooms={rooms || []} isLoadingRooms={isLoadingRooms} />
                </div>
            </div>
        </div>
      </div>

      {/* Mobile Sticky CTA Bar - Standard Industry Practice */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-2xl border-t border-black/5 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
        <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Starting From</span>
                <span className="text-2xl font-black text-primary tracking-tighter">
                    {hotel.minPrice?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                </span>
            </div>
            <Button size="lg" onClick={() => {
                const bookingSection = document.getElementById('booking-section');
                if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth' });
                else {
                    // If no section, push to booking with defaults
                    router.push(`/booking?hotelId=${slug}&checkIn=${new Date().toISOString().split('T')[0]}&checkOut=${new Date(Date.now() + 86400000).toISOString().split('T')[0]}&guests=1`);
                }
            }} className="h-14 rounded-full px-10 bg-accent hover:bg-accent/90 font-black uppercase text-xs tracking-widest shadow-xl shadow-accent/20">
                Reserve Stay
            </Button>
        </div>
      </div>
    </div>
  );
}
