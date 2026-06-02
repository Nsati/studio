'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, ChevronRight, Wifi, Mountain, Utensils } from 'lucide-react';
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

/**
 * @fileOverview Clean & Symmetric Property Card.
 * Reverted to the standard modern layout as requested.
 */
export function HotelCard({ hotel, className }: HotelCardProps) {
  const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    const found = PlaceHolderImages.find((p) => p.id === img);
    return found ? found.imageUrl : 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800';
  };

  return (
    <div className={cn(
      "group flex flex-col bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
      className
    )}>
      {/* Visual Header */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image
          src={getImageUrl(hotel.images[0])}
          alt={hotel.name}
          width={600}
          height={400}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge className="bg-[#febb02] text-black border-0 font-black uppercase text-[9px] tracking-widest px-2 py-0.5 rounded-sm shadow-sm">
                SMART VERIFIED
            </Badge>
            {hotel.discount > 0 && (
                <Badge className="bg-red-600 text-white border-0 font-black uppercase text-[9px] tracking-widest px-2 py-0.5 rounded-sm">
                    -{hotel.discount}%
                </Badge>
            )}
        </div>

        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-sm shadow-md flex items-center gap-1 border border-black/5">
            <Star className="h-3 w-3 fill-[#febb02] text-[#febb02]" />
            <span className="text-xs font-black text-slate-900">{hotel.rating}</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-col flex-1 p-6 space-y-4">
        <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#006ce4]">
                <MapPin className="h-3 w-3" /> {hotel.city}, Northern Grid
            </div>
            <h3 className="text-lg font-black tracking-tight text-[#1a1a1a] leading-tight line-clamp-1">
                {hotel.name}
            </h3>
        </div>

        <div className="flex items-center gap-4 py-2 border-y border-slate-50">
            <div className="flex items-center gap-1.5 opacity-40">
                <Wifi className="h-3.5 w-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-widest">WiFi</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-40">
                <Mountain className="h-3.5 w-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-widest">View</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-40">
                <Utensils className="h-3.5 w-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Meal</span>
            </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Starting from</span>
                <span className="text-xl font-black text-[#1a1a1a]">₹{hotel.minPrice?.toLocaleString()}</span>
            </div>
            <Button asChild size="sm" className="rounded-none font-black text-[10px] uppercase tracking-widest bg-[#006ce4] hover:bg-[#005bb8] text-white px-6 h-10 shadow-lg shadow-blue-100 transition-all active:scale-95">
                <Link href={`/hotels/${hotel.id}`}>
                    Explore <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
