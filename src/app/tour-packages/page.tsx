import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dummyTourPackages } from '@/lib/dummy-data';
import { Calendar, IndianRupee, Mountain, Tag } from 'lucide-react';
import Link from 'next/link';

function TourPackageCard({ tourPackage }: { tourPackage: (typeof dummyTourPackages)[0] }) {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dummyTourPackages.map((pkg) => (
              <TourPackageCard key={pkg.id} tourPackage={pkg} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
