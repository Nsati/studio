
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { dummyCities } from '@/lib/dummy-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function CitiesList() {
    const cities = dummyCities;

    return (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cities?.map((city) => {
            const cityImage = PlaceHolderImages.find(
              (img) => img.id === city.image
            );
            return (
              <Link href={`/search?city=${city.name}`} key={city.name}>
                <Card className="group overflow-hidden border-border">
                  <CardContent className="p-0">
                    <div className="relative w-full aspect-[4/3]">
                      {cityImage && (
                        <Image
                          src={cityImage.imageUrl}
                          alt={city.name}
                          data-ai-hint={cityImage.imageHint}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <h3 className="absolute bottom-4 left-4 font-headline text-2xl font-bold text-white">
                        {city.name}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
    )
}
