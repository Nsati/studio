
'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, IndianRupee, Mountain, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function TourPackageCard({ tourPackage }: { tourPackage: TourPackage }) {
  const image = PlaceHolderImages.find((img) => img.id === tourPackage.image);
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative w-full aspect-video">
        {image && (
          <Image
            src={image.imageUrl}
            alt={tourPackage.title}
            data-ai-hint={image.imageHint}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        )}
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-xl leading-snug">{tourPackage.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 pt-1 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{tourPackage.duration}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-4">
            <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                Destinations Covered
            </p>
            <div className="flex flex-wrap gap-1.5">
                {tourPackage.destinations.map((dest) => (
                    <Badge key={dest} variant="outline" className="font-normal">{dest}</Badge>
                ))}
            </div>
        </div>
        <p className="text-sm text-muted-foreground">{tourPackage.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between bg-muted/50 p-4">
        <div>
            <p className="text-xs text-muted-foreground">Starts from</p>
            <p className="text-xl font-bold text-primary flex items-center">
                <IndianRupee className="h-5 w-5" />
                {tourPackage.price.toLocaleString('en-IN')}
            </p>
        </div>
        <Button asChild>
            <Link href="#">View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function TourPackageCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Skeleton className="w-full aspect-video" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/2 mb-2" />
        <div className="flex flex-wrap gap-1.5 mb-4">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardContent>
      <CardFooter className="flex items-center justify-between bg-muted/50 p-4">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-10 w-28" />
      </CardFooter>
    </Card>
  );
}

function PackagesGrid() {
  const firestore = useFirestore();
  const packagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tourPackages');
  }, [firestore]);

  const { data: tourPackages, isLoading } = useCollection<TourPackage>(packagesQuery);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => <TourPackageCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!tourPackages || tourPackages.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
          <p>No tour packages found. Please add some from the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {tourPackages.map((pkg) => (
        <TourPackageCard key={pkg.id} tourPackage={pkg} />
      ))}
    </div>
  );
}

export default function TourPackagesPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'tour-packages-hero');

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[300px] w-full flex items-center justify-center text-center text-white">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-4">
          <Mountain className="h-16 w-16 mx-auto text-white mb-4" />
          <h1 className="font-headline text-4xl font-bold md:text-6xl">Our Tour Packages</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl">
            Discover the heart of the Himalayas with our specially curated tour packages.
          </p>
        </div>
      </section>

      {/* Packages Grid Section */}
      <section className="py-16 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-bold">Find Your Next Adventure</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              From spiritual journeys to thrilling escapades, we have a package for every traveler.
            </p>
          </div>
          <PackagesGrid />
        </div>
      </section>
    </div>
  );
}
