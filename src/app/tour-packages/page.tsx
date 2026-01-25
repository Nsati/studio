import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { dummyTourPackages } from '@/lib/dummy-data';
import { Calendar, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TourPackagesPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'tour-packages-hero');

  return (
    <div>
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
          <h1 className="font-headline text-4xl font-bold md:text-6xl">Tour Packages</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl">
            Curated journeys to experience the soul of Uttarakhand.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16 px-4 md:px-6">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dummyTourPackages.map((pkg) => {
                    const pkgImage = PlaceHolderImages.find(img => img.id === pkg.image);
                    return (
                        <Card key={pkg.id} className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
                           <div className="relative w-full aspect-video">
                            {pkgImage && (
                                <Image
                                src={pkgImage.imageUrl}
                                alt={pkg.title}
                                data-ai-hint={pkgImage.imageHint}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover"
                                />
                            )}
                            </div>
                            <CardHeader>
                                <CardTitle className="font-headline text-xl leading-tight">{pkg.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2 pt-1">
                                    <Calendar className="h-4 w-4" /> {pkg.duration}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {pkg.destinations.map(dest => (
                                        <Badge key={dest} variant="secondary">{dest}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                             <CardFooter className="bg-muted/50 p-4 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-muted-foreground">Starts from</p>
                                    <p className="font-bold text-lg text-primary">
                                        {pkg.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                                    </p>
                                </div>
                                 <Button asChild>
                                    <Link href="/search">Book Hotel</Link>
                                </Button>
                             </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
      </section>
    </div>
  );
}
