
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { HeroSearchForm } from '@/components/home/HeroSearchForm';
import { ArrowRight } from 'lucide-react';
import { FeaturedHotels } from '@/components/home/FeaturedHotels';
import { CitiesList } from '@/components/home/CitiesList';

export default function HomePage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div className="space-y-16 pb-16">
      <section className="relative flex h-[70vh] min-h-[500px] w-full items-center justify-center">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 w-full max-w-5xl px-4 text-center">
           <h1 className="font-headline text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            Book Hotels at the Best Prices
          </h1>
          <p className="mt-4 text-lg text-white/90">
            Search from thousands of properties to find your perfect stay.
          </p>
          <div className="mt-8">
            <HeroSearchForm />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6">
        <div className="space-y-4 text-center">
          <h2 className="font-headline text-4xl font-bold">Explore by City</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Journey through the most enchanting cities of Uttarakhand, each offering
            a unique blend of nature, adventure, and culture.
          </p>
        </div>
        <CitiesList />
      </section>

      <section className="container mx-auto px-4 md:px-6">
        <div className="space-y-4 text-center">
          <h2 className="font-headline text-4xl font-bold">Featured Stays</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Handpicked hotels and resorts that promise an unforgettable stay
            with top-notch amenities and breathtaking views.
          </p>
        </div>
        <div className="mt-8">
            <FeaturedHotels />
        </div>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
            <Link href="/search">
              View All Hotels <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
