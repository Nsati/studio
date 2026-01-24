
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';

import type { Hotel } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HotelCardProps {
  hotel: Hotel;
}


export function HotelCard({ hotel }: HotelCardProps) {
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
    <Link href={`/hotels/${hotel.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border">
        <CardContent className="p-0">
          <div className="relative w-full aspect-[4/3]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={hotel.name}
                data-ai-hint={imageHint}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                No Image
              </div>
            )}
             {hotel.discount && hotel.discount > 0 && (
                <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground border-accent text-sm">
                    {hotel.discount}% OFF
                </Badge>
            )}
          </div>
        </CardContent>
        <CardHeader className="p-4">
          <CardTitle className="font-headline text-xl leading-tight group-hover:text-primary">
            {hotel.name}
          </CardTitle>
          <CardDescription className="flex items-center gap-1 pt-1">
            <MapPin className="h-4 w-4" />
            {hotel.city}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between items-end p-4 pt-0">
          {hotel.minPrice && hotel.minPrice > 0 ? (
            <div>
              <span className="text-xs text-muted-foreground">Starts from</span>
              <div className="flex items-baseline gap-2">
                <p className="font-bold text-lg text-primary">
                  {discountedMinPrice?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                </p>
                {hotel.discount && hotel.discount > 0 && (
                  <del className="text-sm text-muted-foreground">
                    {hotel.minPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                  </del>
                )}
              </div>
              <p className="text-xs text-muted-foreground -mt-1">/night</p>
            </div>
          ) : (
            <div /> // Placeholder to keep alignment
          )}
          <Badge>
            <Star className="h-4 w-4 fill-current mr-1" />
            <span>{hotel.rating}</span>
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
