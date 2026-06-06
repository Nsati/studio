'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Share2, Heart, ShieldAlert, Signal, IndianRupee, Car, CloudSun, CreditCard, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen bg-white pb-32 selection:bg-accent selection:text-white">
      {/* Dynamic Sub-Header */}
      <div className="bg-muted/30 py-4 border-b border-black/5 sticky top-16 z-40 backdrop-blur-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="text-[10px] text-primary flex items-center gap-3 font-black uppercase tracking-widest">
                <Link href="/" className="hover:text-accent transition-colors">Home</Link> 
                <ChevronRight className="h-3 w-3 opacity-30" />
                <span className="opacity-50">{hotel.city}</span>
                <ChevronRight className="h-3 w-3 opacity-30" />
                <span className="text-accent">{hotel.name}</span>
            </div>
            <div className="flex gap-4">
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-accent transition-colors"><Share2 className="h-4 w-4" /> Share</button>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"><Heart className="h-4 w-4" /> Save</button>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-10">
        <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 space-y-10">
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge className="bg-accent text-accent-foreground rounded-full border-0 text-[9px] font-black px-4 py-1 tracking-widest shadow-lg saffron-glow">SMART VERIFIED</Badge>
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("h-3.5 w-3.5", i < Math.floor(hotel.rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} />
                            ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{hotel.rating} / 5 Rating</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none uppercase font-heading">{hotel.name}</h1>
                    <div className="flex items-center gap-3 text-sm text-primary font-black tracking-wide border-l-4 border-accent pl-6">
                        <MapPin className="h-5 w-5 text-accent" />
                        <span>{hotel.address || `${hotel.city}, Uttarakhand`}</span>
                    </div>
                </div>

                {/* Cinematic Gallery */}
                <div className="grid grid-cols-4 gap-3 h-[500px] rounded-[3rem] overflow-hidden shadow-apple-deep">
                    <div className="col-span-2 row-span-2 relative group overflow-hidden">
                        <Image src={getImageUrl(images[0])} alt="Hero" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" priority />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {images.slice(1, 5).map((img, i) => (
                        <div key={i} className="relative group overflow-hidden">
                            <Image src={getImageUrl(img)} alt={`Gallery ${i}`} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                        </div>
                    ))}
                    {images.length > 5 && (
                        <div className="absolute bottom-10 right-10 z-10">
                            <Button variant="secondary" className="rounded-full font-black text-[10px] tracking-widest shadow-2xl px-8 h-12">VIEW ALL {images.length} PHOTOS</Button>
                        </div>
                    )}
                </div>

                {/* Intelligence & Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        <div className="p-10 bg-primary/5 border border-black/5 rounded-[2.5rem] relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 h-40 w-40 bg-accent/10 rounded-full blur-3xl" />
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-3">
                                <ShieldAlert className="h-5 w-5 text-accent" /> Smart Himalayan Insights
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Terrain Risk Node</p>
                                    <p className="font-bold text-base flex items-center gap-2">
                                        Landslide Risk: <span className={cn("px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest", hotel.landslideRisk === 'Low' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{hotel.landslideRisk}</span>
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Access Protocol</p>
                                    <p className="font-bold text-base">{hotel.roadCondition || 'Good for All Vehicles'}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expedition Strategy</p>
                                    <p className="font-bold text-base">{hotel.balconyWorthIt ? 'Strategic Balcony Access Rec.' : 'Interior Nodes are Quiter'}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Energy Grid</p>
                                    <p className="font-bold text-base">{hotel.hasPowerBackup ? 'Full Solar/Backup Node Active' : 'Limited Grid Only'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h3 className="text-2xl font-black tracking-tight uppercase font-heading">Local Logistics Nodes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex gap-4 p-6 border border-black/5 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center text-primary"><IndianRupee className="h-5 w-5" /></div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Financial Node</p>
                                        <p className="text-sm font-bold">Nearest ATM: {hotel.nearestAtmKm || 2} km</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-6 border border-black/5 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center text-primary"><Signal className="h-5 w-5" /></div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Communications</p>
                                        <div className="flex gap-3 text-[10px] font-black uppercase">
                                            <span className={hotel.networkJio ? 'text-green-600' : 'text-red-600'}>JIO: {hotel.networkJio ? 'OK' : 'FAIL'}</span>
                                            <span className={hotel.networkAirtel ? 'text-green-600' : 'text-red-600'}>AIRTEL: {hotel.networkAirtel ? 'OK' : 'FAIL'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="opacity-10" />
                        
                        <div className="space-y-8">
                            <h3 className="text-2xl font-black tracking-tight uppercase font-heading">Elite Facilities Grid</h3>
                            <div className="flex flex-wrap gap-x-12 gap-y-6">
                                {hotel.amenities.map(a => (
                                    <div key={a} className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-primary/80 group cursor-default">
                                        <div className="h-10 w-10 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                            <AmenityIcon amenity={a} className="h-5 w-5" />
                                        </div>
                                        <span className="border-b-2 border-transparent group-hover:border-accent transition-all">{a.replace('-', ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Booking Sidebar */}
                    <div className="relative">
                        <section id="availability">
                            <RoomBookingCard hotel={hotel as any} rooms={rooms || []} isLoadingRooms={isLoadingRooms} />
                        </section>
                    </div>
                </div>

                <Separator className="my-12 opacity-10" />

                {user && !user.isAnonymous && (
                    <section className="pt-10 pb-20">
                        <WriteReviewForm hotelId={slug} userId={user.uid} userHasReviewed={false} />
                    </section>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}