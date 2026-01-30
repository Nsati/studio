'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { dummyTourPackages } from '@/lib/dummy-data';
import { Calendar, IndianRupee, MapPin, Compass, Sparkles, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TourPackagesPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'tour-packages-hero');

  return (
    <div className="bg-background min-h-screen">
       {/* Editorial Hero Section */}
      <section className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden">
        {heroImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover animate-slow-zoom"
              priority
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          </div>
        )}
        <div className="relative z-10 w-full max-w-5xl px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.3em] border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Compass className="h-4 w-4" /> Curated Himalayan Journeys
          </div>
          <h1 className="text-6xl md:text-[9rem] font-black text-white leading-[0.85] tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Tour <br/><span className="text-accent italic font-heading font-medium">Packages</span>
          </h1>
          <p className="text-white/90 text-xl md:text-3xl max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400">
            Handpicked itineraries designed to immerse you in the authentic soul of Uttarakhand.
          </p>
        </div>
      </section>

      {/* Packages Grid Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                {dummyTourPackages.map((pkg, idx) => {
                    const pkgImage = PlaceHolderImages.find(img => img.id === pkg.image);
                    return (
                        <Card key={pkg.id} className="flex flex-col border-0 bg-white rounded-[4rem] overflow-hidden shadow-apple transition-all duration-700 hover:shadow-apple-deep hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-16 duration-1000" style={{ animationDelay: `${idx * 150}ms` }}>
                           <CardContent className="p-0 relative w-full aspect-[4/3] group cursor-pointer overflow-hidden">
                            {pkgImage && (
                                <Image
                                    src={pkgImage.imageUrl}
                                    alt={pkg.title}
                                    fill
                                    className="object-cover transition-transform duration-2000 group-hover:scale-110"
                                />
                            )}
                            <div className="absolute top-8 right-8 px-5 py-2 glass-morphism rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                                <Calendar className="h-3.5 w-3.5" /> {pkg.duration}
                            </div>
                            </CardContent>
                            <CardHeader className="p-10 space-y-4">
                                <div className="flex items-center gap-2 text-accent">
                                    <Sparkles className="h-4 w-4 fill-accent" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exclusive Journey</span>
                                </div>
                                <CardTitle className="text-4xl font-black leading-tight tracking-tight hover:text-primary transition-colors">
                                    {pkg.title}
                                </CardTitle>
                                <CardDescription className="text-lg text-muted-foreground font-medium line-clamp-3 leading-relaxed pt-2">
                                    {pkg.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-10 pb-10 flex-grow">
                                <div className="flex flex-wrap gap-3">
                                    {pkg.destinations.map(dest => (
                                        <div key={dest} className="flex items-center gap-1.5 px-4 py-2 bg-muted/50 rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-black/5">
                                            <MapPin className="h-3 w-3 text-primary" /> {dest}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                             <CardFooter className="p-10 bg-muted/20 border-t border-black/5 flex justify-between items-center group/footer">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Investment in Memories</p>
                                    <p className="font-black text-3xl text-primary tracking-tighter">
                                        {pkg.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                                    </p>
                                </div>
                                 <Button asChild size="lg" className="rounded-full px-8 h-16 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
                                    <Link href="/search" className="flex items-center gap-3 font-black text-lg">
                                        Reserve Spot <ArrowRight className="h-5 w-5" />
                                    </Link>
                                 </Button>
                             </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-32 bg-primary text-white overflow-hidden">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10 animate-in fade-in slide-in-from-left-12 duration-1000">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md text-accent text-[10px] font-black uppercase tracking-[0.3em] border border-white/10">
                    <Compass className="h-5 w-5" /> The Pahadi Way
                </div>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">Why Journey <br/>With Us?</h2>
                <div className="space-y-8 text-xl md:text-2xl text-white/80 font-medium leading-relaxed">
                    <p>We don't just book hotels; we craft stories. Every package is a result of years of local exploration, ensuring you see the mountains through the eyes of a local.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
                        <div className="space-y-3">
                            <div className="h-1 w-12 bg-accent rounded-full" />
                            <h4 className="font-black text-white text-lg uppercase tracking-widest">Local Hosts</h4>
                            <p className="text-base text-white/60">Verified Pahadi hospitality at every destination.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="h-1 w-12 bg-accent rounded-full" />
                            <h4 className="font-black text-white text-lg uppercase tracking-widest">Slow Travel</h4>
                            <p className="text-base text-white/60">Itineraries that breathe, letting you soak in the serenity.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative aspect-square rounded-[5rem] overflow-hidden shadow-apple-deep group animate-in fade-in scale-95 duration-1000">
                <Image 
                    src="https://images.unsplash.com/photo-1548957175-84f0f9af659e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                    alt="Pahadi Life"
                    fill
                    className="object-cover transition-transform duration-3000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-16 left-16 right-16">
                    <p className="text-4xl font-black italic font-heading">"To live in the mountains is to live in the heart of God."</p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
