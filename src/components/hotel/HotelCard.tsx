
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, ShieldAlert, Signal, Car } from 'lucide-react';
import * as React from 'react';

import type { Hotel } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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
    <div className={cn("booking-card group overflow-hidden bg-white flex flex-col", className)}>
        {/* Gallery */}
        <div className="relative aspect-[16/10] w-full bg-muted">
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
                            className="object-cover"
                            priority={index === 0}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-xs text-muted-foreground">Image Syncing...</span>
                          </div>
                        )}
                      </Link>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              {images.length > 1 && (
                <>
                  <CarouselPrevious className="absolute left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 h-8 w-8 translate-x-0" />
                  <CarouselNext className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 h-8 w-8 translate-x-0" />
                </>
              )}
            </Carousel>
            
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                {hotel.discount && hotel.discount > 0 && (
                    <Badge className="bg-[#d4111e] text-white rounded-none border-0 font-bold px-2 py-1 text-[10px]">
                        Save {hotel.discount}%
                    </Badge>
                )}
                {hotel.mountainSafetyScore >= 80 && (
                    <Badge className="bg-green-600 text-white rounded-none border-0 font-bold px-2 py-1 text-[10px] flex items-center gap-1">
                        High Safety {hotel.mountainSafetyScore}
                    </Badge>
                )}
            </div>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1 space-y-2">
          <div className="flex justify-between items-start gap-2">
            <Link href={`/hotels/${hotel.id}`}>
                <h3 className="text-lg font-bold text-[#006ce4] leading-tight hover:text-[#003580] underline-offset-2 hover:underline">
                    {hotel.name}
                </h3>
            </Link>
            <div className="bg-[#003580] text-white h-8 w-8 shrink-0 flex items-center justify-center font-bold rounded-t-lg rounded-br-lg text-sm">
                {hotel.rating}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-[12px] text-[#006ce4] font-bold">
            <MapPin className="h-3.5 w-3.5" />
            <span className="underline">{hotel.city}</span>
          </div>

          <div className="flex items-center gap-3 py-1">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn("flex items-center gap-1 text-[10px] font-bold", hotel.landslideRisk === 'Low' ? 'text-green-600' : 'text-amber-600')}>
                            <ShieldAlert className="h-3 w-3" /> {hotel.landslideRisk} Risk
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-[10px] font-bold">Mountain landslide probability based on recent terrain data.</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                            <Signal className="h-3 w-3" /> Jio/Airtel OK
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-[10px] font-bold">Verified network stability for remote work.</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                            <Car className="h-3 w-3" /> {hotel.roadCondition || 'Good Road'}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-[10px] font-bold">Verified road accessibility for small cars.</TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>

          <div className="text-[12px] space-y-1">
            <div className="flex items-center gap-1 text-green-700 font-bold">
                <span className="px-1 border border-green-700 text-[10px]">Snow-friendly</span>
                <span>Power Backup</span>
            </div>
          </div>

          <div className="mt-auto pt-4 flex flex-col items-end">
            <span className="text-[12px] text-muted-foreground">Starting / night</span>
            <div className="flex flex-col items-end">
                <span className="text-xl font-bold text-[#1a1a1a]">
                  ₹{discountedMinPrice?.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground">+ taxes & charges</span>
            </div>
            <Button size="sm" asChild className="bg-[#006ce4] hover:bg-[#005bb8] rounded-none mt-3 font-bold px-6 w-full">
                <Link href={`/hotels/${hotel.id}`}>See availability</Link>
            </Button>
          </div>
        </div>
    </div>
  );
}
