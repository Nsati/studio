'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { dummyCities, dummyTourPackages } from '@/lib/dummy-data';
import { ArrowRight, Sparkles, MapPin, Compass, Mountain, Cloud, Star } from 'lucide-react';
import { HotelCard } from '@/components/hotel/HotelCard';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchFilters } from '@/app/search/SearchFilters';

function FeaturedHotelsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[4/5] w-full rounded-[2.5rem] md:rounded-[2.5rem]" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');
  const firestore = useFirestore();
  const featuredHotelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'hotels'), limit(4));
  }, [firestore]);

  const { data: featuredHotels, isLoading: areHotelsLoading } = useCollection<Hotel>(featuredHotelsQuery);

  return (
    <div className="bg-background">
      {/* Hero Section - Apple/Luxury Immersive */}
      <section className="relative h-[85vh] md:h-[90vh] w-full flex items-center justify-center overflow-hidden px-4 md:px-6">
        {heroImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover animate-slow-zoom"
              priority
            />
            <div className="absolute inset-0 hero-gradient" />
          </div>
        )}
        <div className="relative z-10 w-full max-w-6xl text-center space-y-8 md:space-y-12">
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Compass className="h-3 md:h-3.5 w-3 md:w-3.5" /> Curating Himalayan Dreams
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-9xl font-black text-white leading-[0.95] tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Your Escape to <br/><span className="italic font-heading font-medium text-white/90">Serenity</span>
            </h1>
          </div>
          
          <div className="w-full max-w-5xl mx-auto p-2 md:p-3 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] md:rounded-pill border border-white/20 shadow-apple-deep animate-in fade-in zoom-in-95 duration-1000 delay-500">
            <SearchFilters />
          </div>
        </div>
      </section>

      {/* Luxury Destinations Section - "The Collection" */}
      <section id="cities" className="py-20 md:py-32 overflow-hidden bg-white px-4 md:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-6">
            <div className="space-y-4 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary">
                <MapPin className="h-4 w-4" /> Destinations
              </div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter">The Collection</h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-md font-medium">Explore the most enchanting corners of Devbhoomi.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-8">
            {dummyCities.map((city, idx) => {
              const cityImage = PlaceHolderImages.find((img) => img.id === city.image);
              return (
                <Link
                  key={city.id}
                  href={`/search?city=${city.name}`}
                  className={`group relative block aspect-[3/4] overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] shadow-apple transition-all duration-700 hover:shadow-apple-deep hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 duration-1000`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {cityImage && (
                    <Image
                      src={cityImage.imageUrl}
                      alt={city.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 16vw"
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-40 group-hover:opacity-70 transition-opacity duration-700" />
                  <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                      {city.name}
                    </h3>
                    <p className="text-white/70 text-[9px] md:text-xs font-bold uppercase tracking-widest mt-1 md:mt-2 transform translate-y-4 md:translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      View Stays <ArrowRight className="inline h-3 w-3 ml-1" />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Stays Section */}
      <section className="py-20 md:py-32 bg-muted/20 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 md:mb-20 gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary">
                <Star className="h-4 w-4 fill-primary" /> Curated Stays
              </div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter">Signature Experiences</h2>
              <p className="text-muted-foreground text-lg md:text-xl font-medium">Handpicked for exceptional comfort and majestic views.</p>
            </div>
            <Button variant="outline" asChild className="w-full md:w-auto rounded-full px-10 h-14 md:h-16 border-black/10 hover:bg-primary hover:text-white transition-all font-bold text-base md:text-lg shadow-apple">
              <Link href="/search">Explore All Properties</Link>
            </Button>
          </div>
          {areHotelsLoading ? (
            <FeaturedHotelsSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {featuredHotels?.map((hotel, idx) => (
                <div key={hotel.id} className="animate-in fade-in slide-in-from-bottom-12 duration-1000" style={{ animationDelay: `${idx * 150}ms` }}>
                    <HotelCard hotel={hotel} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

       {/* Exclusive Journeys Section */}
       <section className="py-20 md:py-32 bg-white px-4 md:px-6">
        <div className="container mx-auto">
          <div className="text-center space-y-4 md:space-y-6 mb-16 md:mb-24">
             <div className="flex items-center justify-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-accent">
                <Sparkles className="h-4 w-4 fill-accent" /> Premium Tours
             </div>
             <h2 className="text-4xl md:text-8xl font-black tracking-tighter leading-none">Exclusive Journeys</h2>
             <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">Seamlessly planned all-inclusive experiences to discover the soul of the mountains.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {dummyTourPackages.slice(0, 3).map((pkg, idx) => {
              const pkgImage = PlaceHolderImages.find(img => img.id === pkg.image);
              return (
                <Link key={pkg.id} href="/tour-packages" className="group block animate-in fade-in slide-in-from-bottom-16 duration-1000" style={{ animationDelay: `${idx * 200}ms` }}>
                  <div className="space-y-6 md:space-y-10">
                    <div className="relative aspect-[16/11] overflow-hidden rounded-[2rem] md:rounded-[3.5rem] shadow-apple transition-all duration-700 group-hover:shadow-apple-deep">
                      {pkgImage && (
                        <Image 
                          src={pkgImage.imageUrl} 
                          alt={pkg.title} 
                          fill 
                          className="object-cover transition-transform duration-2000 group-hover:scale-110" 
                        />
                      )}
                      <div className="absolute top-6 right-6 md:top-10 md:right-10 px-4 py-2 md:px-6 md:py-3 glass-morphism rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                        {pkg.duration}
                      </div>
                    </div>
                    <div className="px-4 md:px-6 space-y-3 md:space-y-4">
                      <h3 className="text-2xl md:text-4xl font-black leading-[1.1] group-hover:text-primary transition-colors duration-500">{pkg.title}</h3>
                      <p className="text-muted-foreground line-clamp-2 text-base md:text-lg leading-relaxed font-medium">{pkg.description}</p>
                      <div className="flex items-center gap-4 pt-4 md:pt-6 text-primary font-black text-lg md:text-xl">
                        <span>From {pkg.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <ArrowRight className="h-5 w-5 md:h-6 md:w-6 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section - High End Luxury */}
      <section className="py-20 md:py-32 container mx-auto px-4 md:px-6 overflow-hidden">
        <div className="relative rounded-[3rem] md:rounded-[5rem] bg-primary overflow-hidden p-12 md:p-40 text-center text-white space-y-8 md:space-y-12 shadow-apple-deep group">
            <div className="absolute inset-0 z-0">
                <Image 
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
                    alt="Mountain range"
                    fill
                    className="object-cover opacity-30 mix-blend-overlay animate-slow-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-black/40" />
            </div>

            <div className="absolute top-24 left-24 hidden lg:block animate-float" style={{ animationDelay: '0s' }}>
                <Cloud className="h-24 w-24 text-white/20" />
            </div>
            <div className="absolute bottom-24 right-28 hidden lg:block animate-float" style={{ animationDelay: '2s' }}>
                <Mountain className="h-32 w-32 text-white/10" />
            </div>

            <div className="relative z-10 space-y-8 md:space-y-12">
                <div className="space-y-4 md:space-y-6">
                    <div className="inline-flex items-center gap-3 px-6 py-2 md:px-8 md:py-3 rounded-full bg-white/10 backdrop-blur-md text-accent text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Sparkles className="h-4 w-4 md:h-5 md:w-5" /> Final Step to Serenity
                    </div>
                    <h2 className="text-5xl md:text-[10rem] font-black tracking-tighter leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Ready for the <br/><span className="text-accent italic font-heading font-medium">Heights?</span>
                    </h2>
                </div>
                
                <p className="text-white/80 text-lg md:text-4xl max-w-3xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                    Your journey to the soul of the Himalayas begins with a single click. Let our experts craft your dream escape.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10 pt-8 md:pt-12 animate-in fade-in zoom-in-95 duration-1000 delay-700">
                    <Button 
                        size="lg" 
                        className="w-full sm:w-auto rounded-full px-12 md:px-20 h-16 md:h-24 bg-white text-primary hover:bg-accent hover:text-white font-black text-xl md:text-3xl shadow-2xl shadow-white/10 transition-all active:scale-95 group/btn overflow-hidden relative"
                    >
                        <span className="relative z-10">Start Planning</span>
                        <div className="absolute inset-0 bg-accent translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full sm:w-auto rounded-full px-12 md:px-20 h-16 md:h-24 border-2 border-white/40 bg-transparent text-white hover:bg-white/10 hover:border-white font-black text-xl md:text-3xl transition-all shadow-none group/outline"
                    >
                        Contact Expert <ArrowRight className="ml-3 md:ml-4 h-6 w-6 md:h-8 md:w-8 group-hover/outline:translate-x-2 transition-transform" />
                    </Button>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
