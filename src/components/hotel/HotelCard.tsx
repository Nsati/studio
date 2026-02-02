'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';
import * as React from 'react';

import type { Hotel } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface HotelCardProps {
  hotel: Hotel & { id: string };
  className?: string;
}

export function HotelCard({ hotel, className }: HotelCardProps) {
  const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    const found = PlaceHolderImages.find((p) => p.id === img);
    return found ? found.imageUrl : '';
  };

  const discountedMinPrice = hotel.minPrice && hotel.discount
    ? hotel.minPrice * (1 - hotel.discount / 100)
    : hotel.minPrice;

  const images = hotel.images && hotel.images.length > 0 ? hotel.images : ['hero'];

  return (
    <div className={cn("group block w-full", className)}>
      <div className="flex flex-col space-y-4">
        {/* Professional Card Image Container */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-muted shadow-apple transition-all duration-700 group-hover:shadow-apple-deep">
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full ml-0">
                {images.map((img, index) => {
                  const imageUrl = getImageUrl(img);
                  return (
                    <CarouselItem key={index} className="pl-0 h-full relative">
                      <Link href={`/hotels/${hotel.id}`} className="block w-full h-full relative">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={`${hotel.name} - ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            priority={index === 0}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted/50">
                            <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-40">Visual Syncing...</span>
                          </div>
                        )}
                      </Link>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              {/* Minimal arrows visible on hover */}
              {images.length > 1 && (
                <>
                  <CarouselPrevious className="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white border-0 h-8 w-8 z-20 translate-x-0" />
                  <CarouselNext className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white border-0 h-8 w-8 z-20 translate-x-0" />
                </>
              )}
            </Carousel>
            
            {/* Minimal Badge Overlay */}
            {hotel.discount && hotel.discount > 0 ? (
                <div className="absolute top-5 left-5 pointer-events-none z-10">
                    <Badge className="bg-accent text-white border-0 font-bold px-4 py-1.5 rounded-full shadow-lg text-[10px] tracking-widest uppercase">
                        {hotel.discount}% OFF
                    </Badge>
                </div>
            ) : null}

            {/* Rating Overlay */}
            <div className="absolute bottom-5 left-5 px-4 py-2 glass-morphism rounded-full flex items-center gap-1.5 shadow-sm border-white/30 backdrop-blur-md pointer-events-none z-10">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="text-xs font-black text-foreground tracking-tight">{hotel.rating}</span>
            </div>
        </div>

        {/* Minimal Details */}
        <Link href={`/hotels/${hotel.id}`} className="px-2 space-y-1.5 block">
          <h3 className="text-xl font-bold tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors truncate">
              {hotel.name}
          </h3>
          
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium tracking-tight">{hotel.city}</span>
          </div>

          <div className="pt-2 flex items-baseline gap-2">
            {hotel.minPrice && hotel.minPrice > 0 ? (
              <>
                <span className="text-xl font-black text-primary tracking-tighter">
                  {discountedMinPrice?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">/ Night</span>
              </>
            ) : (
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Seasonal Pricing</span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
