'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, ChevronRight, ShieldCheck, Heart } from 'lucide-react';
import * as React from 'react';

import type { Hotel } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HotelCardProps {
  hotel: Hotel & { id: string };
  className?: string;
}

export function HotelCard({ hotel, className }: HotelCardProps) {
  const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    const found = PlaceHolderImages.find((p) => p.id === img);
    return found ? found.imageUrl : 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800';
  };

  return (
    <div className={cn(
      "group flex flex-col md:flex-row bg-white rounded-[2.5rem] overflow-hidden border border-black/5 shadow-apple-deep transition-all duration-500 hover:shadow-2xl hover:-translate-y-1",
      className
    )}>
      {/* Visual Left */}
      <div className="relative aspect-[16/10] md:aspect-square w-full md:w-[320px] shrink-0 overflow-hidden bg-slate-100">
        <Image
          src={getImageUrl(hotel.images[0])}
          alt={hotel.name}
          width={400}
          height={400}
          className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute top-6 right-6">
            <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-md text-slate-400 hover:text-red-500 shadow-sm border-0 transition-colors">
                <Heart className="h-5 w-5" />
            </Button>
        </div>
        {hotel.discount > 0 && (
            <div className="absolute top-6 left-6 bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg">
                SAVE {hotel.discount}%
            </div>
        )}
      </div>

      {/* Main Content Body */}
      <div className="flex flex-col md:flex-row flex-1">
        <div className="flex-1 p-8 flex flex-col justify-between">
            <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                        <div className="flex gap-0.5">
                             {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("h-3.5 w-3.5", i < Math.floor(hotel.rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} />
                            ))}
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors uppercase font-heading">
                            <Link href={`/hotels/${hotel.id}`}>{hotel.name}</Link>
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{hotel.city}</span>
                        </div>
                    </div>
                    <div className="bg-primary/5 text-primary h-12 w-12 flex items-center justify-center rounded-2xl text-sm font-black border border-primary/10 shadow-sm">
                        {hotel.rating}
                    </div>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                    {hotel.description}
                </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-6">
                {hotel.amenities.slice(0, 3).map(a => (
                    <Badge key={a} variant="outline" className="rounded-full text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 border-black/5 px-3 py-1">
                        {a.replace('-', ' ')}
                    </Badge>
                ))}
                {hotel.amenities.length > 3 && (
                    <span className="text-[8px] font-black text-slate-300 ml-1">+{hotel.amenities.length - 3} MORE</span>
                )}
            </div>
        </div>

        {/* Pricing Right */}
        <div className="w-full md:w-[220px] p-8 bg-slate-50/30 flex flex-col justify-between items-end md:border-l border-black/5">
            <div className="text-right w-full">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Elite Sync Rate</p>
                <div className="flex flex-col items-end">
                    {hotel.discount > 0 && (
                        <span className="text-xs text-slate-400 line-through font-bold opacity-60">
                            ₹{(hotel.minPrice / (1 - hotel.discount/100)).toFixed(0)}
                        </span>
                    )}
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">
                        ₹{hotel.minPrice?.toLocaleString()}
                    </span>
                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mt-1">Per night + taxes</p>
                </div>
            </div>

            <div className="w-full space-y-4">
                <Button asChild className="w-full rounded-2xl font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-slate-900 text-white h-14 shadow-xl transition-all active:scale-95">
                    <Link href={`/hotels/${hotel.id}`} className="flex items-center justify-center gap-2">
                        Select Stay <ChevronRight className="h-4 w-4" />
                    </Link>
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-[8px] font-black text-green-600 uppercase tracking-[0.2em]">
                    <ShieldCheck className="h-3 w-3" /> Tripzy Verified
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}