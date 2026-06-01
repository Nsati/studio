'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Sparkles, Utensils, Mountain, ShieldCheck, ChevronRight } from 'lucide-react';
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
 * @fileOverview Premium Harrier Property Card.
 * Features: Circular Safety Indicator, Gold Verified Badge, and Editorial Layout.
 */
export function HotelCard({ hotel, className }: HotelCardProps) {
  const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    const found = PlaceHolderImages.find((p) => p.id === img);
    return found ? found.imageUrl : 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800';
  };

  const score = hotel.mountainSafetyScore || 9.2;
  const percentage = (score / 10) * 100;
  const strokeDasharray = `${percentage}, 100`;

  return (
    <div className={cn(
      "group relative flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-black/5 shadow-apple-deep transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl",
      className
    )}>
      {/* Visual Header */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image
          src={getImageUrl(hotel.images[0])}
          alt={hotel.name}
          width={600}
          height={400}
          className="object-cover w-full h-full transition-transform duration-2000 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Elite Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />
        
        <div className="absolute top-6 left-6 flex flex-col gap-2">
            <Badge className="bg-[#C6A43F] text-white border-0 font-black uppercase text-[9px] tracking-[0.2em] px-4 py-1.5 rounded-full shadow-xl">
                Harrier Verified
            </Badge>
            {hotel.discount > 0 && (
                <Badge className="bg-white/95 backdrop-blur-md text-primary border-0 font-black uppercase text-[8px] tracking-widest px-3 py-1 rounded-full shadow-lg">
                    Exclusive -{hotel.discount}%
                </Badge>
            )}
        </div>

        {/* Safety Score Circular Indicator */}
        <div className="absolute top-6 right-6 h-14 w-14 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border border-white">
            <svg viewBox="0 0 36 36" className="h-12 w-12 transform -rotate-90">
                <path
                    className="text-slate-100"
                    strokeDasharray="100, 100"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                    className="text-[#C6A43F]"
                    strokeDasharray={strokeDasharray}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] font-black text-primary leading-none">{score}</span>
                <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">Safety</span>
            </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-col flex-1 p-8 md:p-10 space-y-6">
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#2C5F8A]">
                <MapPin className="h-3 w-3" /> {hotel.city}
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 leading-tight group-hover:text-[#2C5F8A] transition-colors">
                {hotel.name}
            </h3>
        </div>

        {/* Amenities Icons */}
        <div className="flex items-center gap-8 py-2">
            <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#2C5F8A]/5 group-hover:text-[#2C5F8A] transition-all">
                    <Sparkles className="h-5 w-5" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Elite Spa</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#2C5F8A]/5 group-hover:text-[#2C5F8A] transition-all">
                    <Mountain className="h-5 w-5" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">View</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#2C5F8A]/5 group-hover:text-[#2C5F8A] transition-all">
                    <Utensils className="h-5 w-5" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Fine Dine</span>
            </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Expedition Price</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{hotel.minPrice?.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">/night</span>
                </div>
            </div>
            <Button asChild size="lg" className="h-14 px-8 rounded-full bg-slate-900 hover:bg-[#2C5F8A] text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all group-hover:scale-105">
                <Link href={`/hotels/${hotel.id}`}>
                    Explore Node <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
