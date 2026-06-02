'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Sparkles, Utensils, Mountain, ChevronRight, Star } from 'lucide-react';
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
 * @fileOverview Reverted Standard Premium Property Card.
 * Symmetric, clean, and highly functional.
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
      "group flex flex-col bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm transition-all duration-300 hover:shadow-xl",
      className
    )}>
      {/* Visual Header */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image
          src={getImageUrl(hotel.images[0])}
          alt={hotel.name}
          width={600}
          height={400}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge className="bg-[#febb02] text-black border-0 font-black uppercase text-[9px] tracking-widest px-2 py-0.5 rounded-sm">
                SMART VERIFIED
            </Badge>
            {hotel.discount > 0 && (
                <Badge className="bg-red-600 text-white border-0 font-black uppercase text-[9px] tracking-widest px-2 py-0.5 rounded-sm">
                    -{hotel.discount}%
                </Badge>
            )}
        </div>

        <div className="absolute bottom-4 right-4 bg-white/95 px-2 py-1 rounded-sm shadow-md flex items-center gap-1">
            <Star className="h-3 w-3 fill-[#febb02] text-[#febb02]" />
            <span className="text-xs font-black">{hotel.rating}</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-col flex-1 p-6 space-y-4">
        <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#006ce4]">
                <MapPin className="h-3 w-3" /> {hotel.city}
            </div>
            <h3 className="text-lg font-black tracking-tight text-[#1a1a1a] leading-tight line-clamp-1">
                {hotel.name}
            </h3>
        </div>

        <div className="flex flex-wrap gap-4 py-2 border-y border-slate-50">
            <div className="flex items-center gap-1.5 opacity-60">
                <Wifi className="h-3.5 w-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-widest">WiFi</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-60">
                <Mountain className="h-3.5 w-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-widest">View</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-60">
                <Utensils className="h-3.5 w-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Dining</span>
            </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Starting from</span>
                <span className="text-xl font-black text-[#1a1a1a]">₹{hotel.minPrice?.toLocaleString()}</span>
            </div>
            <Button asChild size="sm" className="rounded-none font-bold bg-[#006ce4] hover:bg-[#005bb8] text-white px-4 h-9">
                <Link href={`/hotels/${hotel.id}`}>
                    Details <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}

function Wifi(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>
  )
}
