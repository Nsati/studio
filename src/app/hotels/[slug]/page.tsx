'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Share2, Heart, ShieldAlert, Signal, Info, Check, IndianRupee, Car, CloudSun, CreditCard } from 'lucide-react';
import React from 'react';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AmenityIcon } from '@/components/hotel/AmenityIcon';
import type { Hotel, Room } from '@/lib/types';
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

  const scrollToAvailability = () => {
    document.getElementById('availability')?.scrollIntoView({ behavior: 'smooth' });
  };

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
      {/* Sub-Header */}
      <div className="bg-[#f5f5f5] py-3 border-b border-black/5">
        <div className="container mx-auto px-4 text-[12px] text-[#006ce4] flex items-center gap-2 font-bold">
            <Link href="/" className="hover:underline">Home</Link> &gt; 
            <span className="hover:underline cursor-pointer">Uttarakhand</span> &gt; 
            <span className="hover:underline cursor-pointer">{hotel.city}</span> &gt; 
            <span className="text-muted-foreground">{hotel.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-[#febb02] text-black rounded-none border-0 text-[10px] font-black px-1.5 py-0.5">SMART VERIFIED</Badge>
                            <div className="flex gap-0.5">
                                {[...Array(Math.floor(hotel.rating))].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-[#febb02] text-[#febb02]" />
                                ))}
                            </div>
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-[#1a1a1a]">{hotel.name}</h1>
                        <div className="flex items-center gap-2 text-sm text-[#006ce4] font-medium underline-offset-2 hover:underline cursor-pointer">
                            <MapPin className="h-4 w-4 text-[#003580]" />
                            <span>{hotel.address || `${hotel.city}, Uttarakhand`} — Show local highlights</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-[#006ce4] hover:bg-[#006ce4]/10"><Heart className="h-6 w-6" /></Button>
                        <Button variant="ghost" size="icon" className="text-[#006ce4] hover:bg-[#006ce4]/10"><Share2 className="h-6 w-6" /></Button>
                        <Button onClick={scrollToAvailability} className="bg-[#006ce4] hover:bg-[#005bb8] rounded-none font-bold px-8 h-11 text-base">Reserve Now</Button>
                    </div>
                </div>

                {/* Gallery */}
                <div className="grid grid-cols-4 gap-2 h-[480px]">
                    <div className="col-span-2 row-span-2 relative group overflow-hidden">
                        <Image src={getImageUrl(images[0])} alt="Main" fill className="object-cover" />
                    </div>
                    {images.slice(1, 5).map((img, i) => (
                        <div key={i} className="relative group overflow-hidden">
                            <Image src={getImageUrl(img)} alt={`Gallery ${i}`} fill className="object-cover" />
                        </div>
                    ))}
                </div>

                {/* Local Intel & Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="p-6 bg-[#f0f6ff] border border-black/5 rounded-sm">
                            <h3 className="text-lg font-black uppercase tracking-widest text-[#003580] mb-4 flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5" /> Smart Insights
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Mountain Safety</p>
                                    <p className="font-bold text-sm">Landslide Risk: <span className={hotel.landslideRisk === 'Low' ? 'text-green-600' : 'text-amber-600'}>{hotel.landslideRisk}</span></p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Road Access</p>
                                    <p className="font-bold text-sm">Condition: {hotel.roadCondition || 'Good for Hatchbacks'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Room Tip</p>
                                    <p className="font-bold text-sm">{hotel.balconyWorthIt ? 'Balcony view is highly recommended' : 'Standard rooms are quietest'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Power Status</p>
                                    <p className="font-bold text-sm">{hotel.hasPowerBackup ? 'Full Power Backup Available' : 'Limited Backup'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">Local Tips & Intel</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex gap-3 p-4 border rounded-sm">
                                    <IndianRupee className="h-5 w-5 text-muted-foreground" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase text-muted-foreground">Nearest ATM</p>
                                        <p className="text-sm font-bold">{hotel.nearestAtmKm || 2} km distance</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 p-4 border rounded-sm">
                                    <Car className="h-5 w-5 text-muted-foreground" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase text-muted-foreground">Cab to Center</p>
                                        <p className="text-sm font-bold">Approx. ₹{hotel.cabFareToCenter || 300}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 p-4 border rounded-sm">
                                    <Signal className="h-5 w-5 text-muted-foreground" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase text-muted-foreground">Network Status</p>
                                        <div className="flex gap-2 text-[10px] font-bold">
                                            <span className={hotel.networkJio ? 'text-green-600' : 'text-red-600'}>JIO: {hotel.networkJio ? 'OK' : 'FAIL'}</span>
                                            <span className={hotel.networkAirtel ? 'text-green-600' : 'text-red-600'}>AIRTEL: {hotel.networkAirtel ? 'OK' : 'FAIL'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 p-4 border rounded-sm">
                                    <CloudSun className="h-5 w-5 text-muted-foreground" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase text-muted-foreground">Weather Alert</p>
                                        <p className="text-sm font-bold text-green-700 italic">Clear Skies - Good for Travel</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />
                        
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

                    {/* Right Summary Sidebar */}
                    <div className="space-y-4">
                        <div className="bg-[#f0f6ff] p-6 rounded-md border border-black/5 space-y-4">
                            <h4 className="font-black text-sm text-[#1a1a1a] uppercase tracking-widest">Property highlights</h4>
                            <div className="space-y-3">
                                <div className="flex gap-2 text-[13px]">
                                    <MapPin className="h-4 w-4 text-green-700 shrink-0" />
                                    <span className="font-bold">Top Location: Highly rated for views</span>
                                </div>
                                <div className="flex gap-2 text-[13px]">
                                    <Check className="h-4 w-4 text-green-700 shrink-0" />
                                    <span className="font-bold">Hassle-free parking onsite</span>
                                </div>
                                <div className="flex gap-2 text-[13px]">
                                    <CreditCard className="h-4 w-4 text-green-700 shrink-0" />
                                    <span className="font-bold">Accepts UPI & Major Cards</span>
                                </div>
                            </div>
                            <Button onClick={scrollToAvailability} className="w-full bg-[#006ce4] hover:bg-[#005bb8] rounded-none font-bold py-6">Check Availability</Button>
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                <section id="availability">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-primary h-8 w-1 rounded-full" />
                        <h2 className="text-2xl font-black text-[#1a1a1a] tracking-tight">Select Your Stay</h2>
                    </div>
                    <RoomBookingCard hotel={hotel as any} rooms={rooms || []} isLoadingRooms={isLoadingRooms} />
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
