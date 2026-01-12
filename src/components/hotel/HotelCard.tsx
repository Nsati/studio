
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
  const hotelImage = PlaceHolderImages.find((img) => img.id === hotel.images[0]);

  return (
    <Link href={`/hotels/${hotel.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardContent className="p-0">
          <div className="relative h-48 w-full">
            {hotelImage ? (
              <Image
                src={hotelImage.imageUrl}
                alt={hotel.name}
                data-ai-hint={hotelImage.imageHint}
                fill
                className="object-cover"
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
        <CardFooter className="flex justify-between p-4 pt-0">
          <Badge variant="secondary" className="text-sm">
            from ₹{Math.min(...hotel.rooms.map((r) => r.price))}/night
          </Badge>
          <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span>{hotel.rating}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
