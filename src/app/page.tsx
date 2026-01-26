import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dummyCities, dummyHotels, dummyTourPackages } from '@/lib/dummy-data';
import { ArrowRight } from 'lucide-react';
import { HotelCard } from '@/components/hotel/HotelCard';

export default function HomePage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] w-full flex items-center justify-center text-center text-white">
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
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 p-4">
          <h1 className="font-headline text-4xl font-bold md:text-6xl lg:text-7xl">
            Your Himalayan Escape
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl">
            Discover serene hotels and breathtaking views in the heart of Uttarakhand.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/search">Find Your Stay</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Cities Section */}
      <section id="cities" className="py-16 bg-muted/40">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-bold">Explore by City</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">From tranquil lakes to spiritual hubs, find your perfect destination.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {dummyCities.map((city) => {
              const cityImage = PlaceHolderImages.find((img) => img.id === city.image);
              return (
                <Link
                  key={city.id}
                  href={`/search?city=${city.name}`}
                  className="group relative block aspect-square overflow-hidden rounded-lg"
                >
                  {cityImage && (
                    <Image
                      src={cityImage.imageUrl}
                      alt={city.name}
                      data-ai-hint={cityImage.imageHint}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h3 className="absolute bottom-3 left-3 font-headline text-lg font-bold text-white">
                    {city.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="py-16">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="font-headline text-3xl font-bold">Featured Stays</h2>
              <p className="text-muted-foreground mt-2">Handpicked hotels for an unforgettable experience.</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/search">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyHotels.slice(0, 3).map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        </div>
      </section>

       {/* Tour Packages Section */}
       <section className="py-16 bg-muted/40">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
             <div>
                <h2 className="font-headline text-3xl font-bold">Curated Tour Packages</h2>
                <p className="text-muted-foreground mt-2">All-inclusive journeys to explore the best of Uttarakhand.</p>
              </div>
               <Button variant="outline" asChild>
                <Link href="/tour-packages">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dummyTourPackages.slice(0, 3).map((pkg) => {
              const pkgImage = PlaceHolderImages.find(img => img.id === pkg.image);
              return (
                <Link key={pkg.id} href="/tour-packages" className="group block">
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <CardContent className="p-0 relative w-full aspect-video">
                      {pkgImage && <Image src={pkgImage.imageUrl} alt={pkg.title} fill className="object-cover" />}
                    </CardContent>
                    <CardHeader>
                      <CardTitle className="font-headline text-xl leading-tight group-hover:text-primary">{pkg.title}</CardTitle>
                      <CardDescription>{pkg.duration}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
