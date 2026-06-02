'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, ChevronRight, Wifi, Mountain, Utensils, ShieldCheck, CheckCircle2, Info } from 'lucide-react';
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
 * @fileOverview Professional "Booking.com" style Hotel Card.
 * Optimized for search result lists with horizontal layout on desktop.
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
      "group flex flex-col md:flex-row bg-white rounded-sm overflow-hidden border border-black/10 shadow-sm transition-all duration-300 hover:shadow-md hover:border-black/20",
      className
    )}>
      {/* Visual Header / Left Image */}
      <div className="relative aspect-[16/10] md:aspect-square w-full md:w-[280px] shrink-0 overflow-hidden bg-slate-100">
        <Image
          src={getImageUrl(hotel.images[0])}
          alt={hotel.name}
          width={400}
          height={400}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <Badge className="bg-[#febb02] text-black border-0 font-black uppercase text-[8px] tracking-widest px-2 py-0.5 rounded-none shadow-sm">
                SMART VERIFIED
            </Badge>
            {hotel.discount > 0 && (
                <Badge className="bg-red-600 text-white border-0 font-black uppercase text-[8px] tracking-widest px-2 py-0.5 rounded-none">
                    -{hotel.discount}%
                </Badge>
            )}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Details Section */}
        <div className="flex-1 p-5 md:p-6 flex flex-col space-y-3">
            <div className="space-y-1">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black tracking-tight text-[#006ce4] hover:underline cursor-pointer leading-tight">
                        <Link href={`/hotels/${hotel.id}`}>{hotel.name}</Link>
                    </h3>
                    <div className="flex items-center gap-2 text-right">
                        <div className="hidden md:block">
                            <p className="text-[11px] font-black text-[#1a1a1a]">Wonderful</p>
                            <p className="text-[9px] text-muted-foreground font-medium">1,240 reviews</p>
                        </div>
                        <div className="bg-[#003580] text-white h-8 w-8 flex items-center justify-center rounded-sm text-sm font-black">
                            {hotel.rating}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#006ce4] font-bold underline-offset-2 hover:underline cursor-pointer">
                    <MapPin className="h-3 w-3 text-[#1a1a1a]" />
                    <span>{hotel.city}</span>
                    <span className="text-muted-foreground no-underline ml-1">· 2.5 km from center</span>
                </div>
            </div>

            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1.5 text-green-700 font-bold text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Free cancellation</span>
                </div>
                <div className="flex items-center gap-1.5 text-green-700 font-bold text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>No prepayment needed – pay at the property</span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 font-medium">
                    {hotel.description}
                </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
                {hotel.amenities.slice(0, 3).map(a => (
                    <Badge key={a} variant="outline" className="rounded-none text-[9px] font-black uppercase text-muted-foreground border-black/5 bg-slate-50">
                        {a.replace('-', ' ')}
                    </Badge>
                ))}
            </div>
        </div>

        {/* Pricing Section (Right Column on Desktop) */}
        <div className="w-full md:w-[220px] p-5 md:p-6 md:border-l border-black/5 bg-slate-50/30 flex flex-col justify-end items-end md:items-end space-y-2">
            <div className="text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nightly Rate</p>
                <div className="flex flex-col items-end">
                    {hotel.discount > 0 && (
                        <span className="text-xs text-red-600 line-through font-bold opacity-60">
                            ₹{(hotel.minPrice / (1 - hotel.discount/100)).toFixed(0)}
                        </span>
                    )}
                    <span className="text-2xl font-black text-[#1a1a1a] tracking-tighter">
                        ₹{hotel.minPrice?.toLocaleString()}
                    </span>
                </div>
                <p className="text-[9px] font-medium text-muted-foreground">Includes taxes and charges</p>
            </div>

            <div className="w-full pt-4">
                <Button asChild className="w-full rounded-none font-black text-[12px] uppercase tracking-widest bg-[#006ce4] hover:bg-[#005bb8] text-white h-12 shadow-sm transition-all active:scale-95">
                    <Link href={`/hotels/${hotel.id}`}>
                        See availability <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            
            <div className="flex items-center gap-1 text-[9px] font-black text-green-700 uppercase tracking-tighter pt-1">
                <ShieldCheck className="h-3 w-3" /> Harrier Protocol Ready
            </div>
        </div>
      </div>
    </div>
  );
}
