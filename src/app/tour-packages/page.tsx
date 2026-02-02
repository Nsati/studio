'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { dummyTourPackages } from '@/lib/dummy-data';
import { Calendar, IndianRupee, MapPin, Compass, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TourPackagesPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'tour-packages-hero');

  return (
    <div className="bg-white min-h-screen">
       {/* Booking style Banner */}
      <section className="bg-[#003580] py-12 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Uttarakhand Tour Packages
            </h1>
            <p className="text-xl text-white/90">
              Discover local experiences and handpicked itineraries across the Himalayas.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 gap-6">
                {dummyTourPackages.map((pkg) => {
                    const pkgImage = PlaceHolderImages.find(img => img.id === pkg.image);
                    return (
                        <Card key={pkg.id} className="flex flex-col md:flex-row overflow-hidden border border-border rounded-sm hover:shadow-md transition-shadow">
                           <div className="relative w-full md:w-[350px] aspect-[4/3] md:aspect-square flex-shrink-0">
                            {pkgImage && (
                                <Image
                                    src={pkgImage.imageUrl}
                                    alt={pkg.title}
                                    fill
                                    className="object-cover"
                                />
                            )}
                            <div className="absolute top-2 left-2">
                                <Badge className="bg-[#008009] text-white rounded-none border-0 font-bold">Recommended</Badge>
                            </div>
                           </div>

                           <div className="flex flex-col flex-grow p-4 md:p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2 text-[#006ce4] font-bold text-lg hover:underline cursor-pointer">
                                            <CardTitle className="text-2xl font-bold">{pkg.title}</CardTitle>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-[#006ce4] underline underline-offset-2">
                                            <MapPin className="h-4 w-4" />
                                            {pkg.destinations.join(', ')}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-green-700 font-bold">
                                            <Clock className="h-4 w-4" />
                                            {pkg.duration}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-none mt-4 max-w-2xl">
                                            {pkg.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end md:border-l md:pl-6 space-y-2 min-w-[180px]">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex flex-col items-end leading-none">
                                                <span className="text-sm font-bold">Very Good</span>
                                                <span className="text-[10px] text-muted-foreground">1,240 reviews</span>
                                            </div>
                                            <div className="bg-[#003580] text-white h-8 w-8 flex items-center justify-center font-bold rounded-t-lg rounded-br-lg text-sm">
                                                8.9
                                            </div>
                                        </div>
                                        
                                        <span className="text-[12px] text-muted-foreground">Price from</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-bold">
                                                {pkg.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">includes taxes and charges</span>
                                        </div>
                                        <Button asChild className="bg-[#006ce4] hover:bg-[#005bb8] rounded-none font-bold px-8 w-full mt-4">
                                            <Link href="/search">See availability</Link>
                                        </Button>
                                    </div>
                                </div>
                           </div>
                        </Card>
                    )
                })}
            </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="bg-muted/30 py-16 px-4 border-t border-b">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-3">
                <div className="h-12 w-12 bg-[#003580]/10 rounded-full flex items-center justify-center mx-auto">
                    <Compass className="h-6 w-6 text-[#003580]" />
                </div>
                <h4 className="font-bold">Expert Local Guidance</h4>
                <p className="text-sm text-muted-foreground">Our packages are designed by travel experts who know every corner of Uttarakhand.</p>
            </div>
            <div className="space-y-3">
                <div className="h-12 w-12 bg-[#003580]/10 rounded-full flex items-center justify-center mx-auto">
                    <IndianRupee className="h-6 w-6 text-[#003580]" />
                </div>
                <h4 className="font-bold">Best Price Guarantee</h4>
                <p className="text-sm text-muted-foreground">We offer the most competitive rates for high-quality Himalayan experiences.</p>
            </div>
            <div className="space-y-3">
                <div className="h-12 w-12 bg-[#003580]/10 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="h-6 w-6 text-[#003580]" />
                </div>
                <h4 className="font-bold">Hassle-free Booking</h4>
                <p className="text-sm text-muted-foreground">Instant confirmation and secure payment options for your peace of mind.</p>
            </div>
        </div>
      </section>
    </div>
  );
}