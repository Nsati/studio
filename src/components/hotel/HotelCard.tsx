'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, ChevronRight, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
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
      "group flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl",
      className
    )}>
      {/* Visual Left */}
      <div className="relative aspect-[16/10] md:aspect-square w-full md:w-[300px] shrink-0 overflow-hidden bg-slate-100">
        <Image
          src={getImageUrl(hotel.images[0])}
          alt={hotel.name}
          width={400}
          height={400}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4">
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500 shadow-sm border-0">
                <Heart className="h-4 w-4" />
            </Button>
        </div>
        {hotel.discount > 0 && (
            <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-lg">
                SAVE {hotel.discount}%
            </div>
        )}
      </div>

      {/* Main Content Body */}
      <div className="flex flex-col md:flex-row flex-1">
        <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="space-y-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex gap-0.5">
                             {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("h-3 w-3", i < Math.floor(hotel.rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} />
                            ))}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">
                            <Link href={`/hotels/${hotel.id}`}>{hotel.name}</Link>
                        </h3>
                    </div>
                    <div className="bg-primary/10 text-primary h-10 w-10 flex items-center justify-center rounded-xl text-sm font-black border border-primary/20">
                        {hotel.rating}
                    </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{hotel.city}</span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 font-medium leading-relaxed pt-2">
                    {hotel.description}
                </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-4">
                {hotel.amenities.slice(0, 3).map(a => (
                    <Badge key={a} variant="outline" className="rounded-lg text-[9px] font-bold uppercase text-slate-400 bg-slate-50 border-slate-100">
                        {a.replace('-', ' ')}
                    </Badge>
                ))}
            </div>
        </div>

        {/* Pricing Right */}
        <div className="w-full md:w-[200px] p-6 bg-slate-50/50 flex flex-col justify-end items-end md:items-end space-y-4 md:border-l border-slate-100">
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard Rate</p>
                <div className="flex flex-col items-end">
                    {hotel.discount > 0 && (
                        <span className="text-xs text-slate-400 line-through font-bold opacity-60">
                            ₹{(hotel.minPrice / (1 - hotel.discount/100)).toFixed(0)}
                        </span>
                    )}
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                        ₹{hotel.minPrice?.toLocaleString()}
                    </span>
                </div>
            </div>

            <Button asChild className="w-full rounded-xl font-black text-xs uppercase tracking-widest bg-primary hover:bg-blue-700 text-white h-12 shadow-lg shadow-blue-100 transition-all active:scale-95">
                <Link href={`/hotels/${hotel.id}`}>
                    Select Stays <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
            </Button>
            
            <div className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase tracking-tighter">
                <ShieldCheck className="h-3 w-3" /> Tripzy Verified
            </div>
        </div>
      </div>
    </div>
  );
}
