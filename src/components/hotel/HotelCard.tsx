'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';

import type { Hotel } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HotelCardProps {
  hotel: Hotel & { id: string };
  className?: string;
}

export function HotelCard({ hotel, className }: HotelCardProps) {
  const imageUrl = hotel.images[0]?.startsWith('http')
    ? hotel.images[0]
    : PlaceHolderImages.find((img) => img.id === hotel.images[0])?.imageUrl;

  const imageHint = !hotel.images[0]?.startsWith('http')
    ? PlaceHolderImages.find((img) => img.id === hotel.images[0])?.imageHint
    : undefined;

  const discountedMinPrice = hotel.minPrice && hotel.discount
    ? hotel.minPrice * (1 - hotel.discount / 100)
    : hotel.minPrice;

  return (
    <Link href={`/hotels/${hotel.id}`} className={cn("group block w-full", className)}>
      <div className="flex flex-col space-y-4">
        {/* Modern Tall Card Image */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-muted shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:shadow-black/5">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={hotel.name}
                data-ai-hint={imageHint}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-bold">No Preview</span>
              </div>
            )}
            
            {/* Minimal Badge Overlay */}
            {hotel.discount && hotel.discount > 0 ? (
                <div className="absolute top-4 left-4">
                    <Badge className="bg-accent text-white border-0 font-bold px-3 py-1 rounded-full shadow-lg">
                        {hotel.discount}% OFF
                    </Badge>
                </div>
            ) : null}

            {/* Rating Overlay */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 glass-morphism rounded-full flex items-center gap-1 shadow-sm border-white/30">
                <Star className="h-3 w-3 fill-accent text-accent" />
                <span className="text-[11px] font-bold text-foreground">{hotel.rating}</span>
            </div>
        </div>

        {/* Minimal Details */}
        <div className="px-1 space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-bold tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors truncate">
                {hotel.name}
            </h3>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-sm font-medium tracking-tight">{hotel.city}</span>
          </div>

          <div className="pt-2 flex items-baseline gap-2">
            {hotel.minPrice && hotel.minPrice > 0 ? (
              <>
                <span className="text-lg font-black text-primary tracking-tight">
                  {discountedMinPrice?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                </span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">/ Night</span>
              </>
            ) : (
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Seasonal Only</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}