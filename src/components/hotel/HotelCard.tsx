'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';

import type { Hotel, Room } from '@/lib/types';
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
import { useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';

interface HotelCardProps {
  hotel: Hotel;
}

function HotelMinPrice({ hotelId }: { hotelId: string}) {
  const firestore = useFirestore();

  const roomsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'hotels', hotelId, 'rooms');
  }, [firestore, hotelId]);

  const { data: rooms, isLoading } = useCollection<Room>(roomsQuery);

  const minPrice = useMemo(() => {
    if (!rooms || rooms.length === 0) return 0;
    return Math.min(...rooms.map((r) => r.price))
  }, [rooms]);
  
  if (isLoading) {
      return <Skeleton className="h-5 w-24" />
  }

  if (minPrice === 0) return null;

  return (
    <div>
        <span className="text-xs text-muted-foreground">Starts from </span>
        <p className="font-bold text-lg text-foreground">
        {minPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
        <span className="text-sm font-normal text-muted-foreground">/night</span>
        </p>
    </div>
  )
}

export function HotelCard({ hotel }: HotelCardProps) {
  const imageUrl = hotel.images[0]?.startsWith('http')
    ? hotel.images[0]
    : PlaceHolderImages.find((img) => img.id === hotel.images[0])?.imageUrl;

  const imageHint = !hotel.images[0]?.startsWith('http')
    ? PlaceHolderImages.find((img) => img.id === hotel.images[0])?.imageHint
    : undefined;

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
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                No Image
              </div>
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
          <HotelMinPrice hotelId={hotel.id} />
          <Badge>
            <Star className="h-4 w-4 fill-current mr-1" />
            <span>{hotel.rating}</span>
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
