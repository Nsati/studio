'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, MapPin, Share2, Heart, ArrowLeft, Clock, Info, Check } from 'lucide-react';
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

  if (isLoading || isLoadingRooms) {
    return <Loading />;
  }

  if (!hotel) {
    notFound();
  }

  const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return PlaceHolderImages.find((p) => p.id === img)?.imageUrl || '';
  };

  const images = hotel.images && hotel.images.length > 0 ? hotel.images : ['hero'];

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Sub-Header Breadcrumbs */}
      <div className="bg-[#f5f5f5] py-3 border-b border-black/5">
        <div className="container mx-auto px-4 text-[12px] text-[#006ce4] flex items-center gap-2">
            <span className="hover:underline cursor-pointer">Home</span> &gt; 
            <span className="hover:underline cursor-pointer">India</span> &gt; 
            <span className="hover:underline cursor-pointer">Uttarakhand</span> &gt; 
            <span className="hover:underline cursor-pointer">{hotel.city}</span> &gt; 
            <span className="text-muted-foreground">{hotel.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-[#febb02] text-black rounded-none border-0 text-[10px] font-bold px-1.5 py-0.5">Resort</Badge>
                            <div className="flex gap-0.5">
                                {[...Array(Math.floor(hotel.rating))].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-[#febb02] text-[#febb02]" />
                                ))}
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-[#1a1a1a]">{hotel.name}</h1>
                        <div className="flex items-center gap-2 text-sm text-[#006ce4] underline-offset-2 hover:underline cursor-pointer">
                            <MapPin className="h-4 w-4 text-[#003580]" />
                            <span>{hotel.address || `${hotel.city}, Uttarakhand`} — Excellent location - show map</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-[#006ce4] hover:bg-[#006ce4]/10"><Heart className="h-6 w-6" /></Button>
                        <Button variant="ghost" size="icon" className="text-[#006ce4] hover:bg-[#006ce4]/10"><Share2 className="h-6 w-6" /></Button>
                        <Button className="bg-[#006ce4] hover:bg-[#005bb8] rounded-none font-bold px-8 h-11 text-base">Reserve</Button>
                    </div>
                </div>

                {/* Booking Style Gallery Grid */}
                <div className="grid grid-cols-4 gap-2 h-[480px]">
                    <div className="col-span-2 row-span-2 relative group overflow-hidden cursor-pointer">
                        <Image src={getImageUrl(images[0])} alt="Main" fill className="object-cover hover:scale-105 transition-transform duration-700" />
                    </div>
                    {images.slice(1, 5).map((img, i) => (
                        <div key={i} className="relative group overflow-hidden cursor-pointer">
                            <Image src={getImageUrl(img)} alt={`Gallery ${i}`} fill className="object-cover hover:scale-105 transition-transform duration-700" />
                            {i === 3 && images.length > 5 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                                    +{images.length - 5} photos
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Information Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <p className="text-[#1a1a1a] leading-relaxed text-[15px]">
                            {hotel.description}
                        </p>
                        
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">Most popular facilities</h3>
                            <div className="flex flex-wrap gap-x-8 gap-y-4">
                                {hotel.amenities.map(a => (
                                    <div key={a} className="flex items-center gap-2 text-sm text-green-700 font-bold">
                                        <AmenityIcon amenity={a} className="h-5 w-5" />
                                        <span className="capitalize">{a.replace('-', ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Summary Sidebar (Integrated) */}
                    <div className="space-y-4">
                        <div className="bg-[#f0f6ff] p-4 rounded-md border border-black/5 flex justify-between items-start">
                            <div>
                                <p className="font-bold text-[#1a1a1a]">Excellent</p>
                                <p className="text-[12px] text-muted-foreground">{Math.floor(hotel.rating * 100)} verified reviews</p>
                            </div>
                            <div className="bg-[#003580] text-white h-10 w-10 flex items-center justify-center font-bold rounded-t-lg rounded-br-lg text-lg">
                                {hotel.rating}
                            </div>
                        </div>
                        <div className="bg-[#f0f6ff] p-4 rounded-md border border-black/5 space-y-4">
                            <h4 className="font-bold text-sm text-[#1a1a1a]">Property highlights</h4>
                            <div className="space-y-3">
                                <div className="flex gap-2 text-[13px]">
                                    <MapPin className="h-4 w-4 text-green-700 shrink-0" />
                                    <span className="font-medium">Top Location: Highly rated by recent guests</span>
                                </div>
                                <div className="flex gap-2 text-[13px]">
                                    <Check className="h-4 w-4 text-green-700 shrink-0" />
                                    <span className="font-medium">Continental, Buffet Breakfast Info</span>
                                </div>
                                <div className="flex gap-2 text-[13px]">
                                    <Clock className="h-4 w-4 text-green-700 shrink-0" />
                                    <span className="font-medium">24-hour Front Desk Node</span>
                                </div>
                            </div>
                            <Button className="w-full bg-[#006ce4] hover:bg-[#005bb8] rounded-none font-bold py-6">Reserve Now</Button>
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                {/* Availability Section */}
                <section id="availability">
                    <h2 className="text-2xl font-bold mb-6 text-[#1a1a1a]">Availability</h2>
                    <RoomBookingCard hotel={hotel as any} rooms={rooms || []} isLoadingRooms={isLoadingRooms} />
                </section>

                <Separator className="my-8" />

                {/* Policies Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-[#1a1a1a]">House Rules</h2>
                    <div className="border border-black/10 rounded-md overflow-hidden bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-4 p-5 border-b hover:bg-muted/5 transition-colors">
                            <div className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><Clock className="h-4 w-4" /> Check-in</div>
                            <div className="md:col-span-3 text-sm">From 12:00 PM. Guests are required to show a photo identification and credit card upon check-in.</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 p-5 border-b hover:bg-muted/5 transition-colors">
                            <div className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><Clock className="h-4 w-4" /> Check-out</div>
                            <div className="md:col-span-3 text-sm">Until 11:00 AM</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 p-5 border-b hover:bg-muted/5 transition-colors">
                            <div className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><Info className="h-4 w-4" /> Pets</div>
                            <div className="md:col-span-3 text-sm font-bold text-red-600">Pets are not allowed.</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 p-5 hover:bg-muted/5 transition-colors">
                            <div className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><Check className="h-4 w-4" /> Cards</div>
                            <div className="md:col-span-3 text-sm">This property accepts major credit cards and UPI.</div>
                        </div>
                    </div>
                </section>

                {user && !user.isAnonymous && (
                    <section className="pt-12">
                        <WriteReviewForm hotelId={slug} userId={user.uid} userHasReviewed={false} />
                    </section>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
