
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { Card, CardTitle } from '@/components/ui/card';
import { MapPin, Compass, Sparkles, Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function PackageSkeleton() {
    return (
        <Card className="flex flex-col md:flex-row overflow-hidden border border-border rounded-sm">
            <Skeleton className="h-[250px] w-full md:w-[400px]" />
            <div className="flex-1 p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
            </div>
        </Card>
    );
}

export default function TourPackagesPage() {
  const firestore = useFirestore();

  const packagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tourPackages');
  }, [firestore]);

  const { data: packages, isLoading } = useCollection<TourPackage>(packagesQuery);

  const getImageUrl = (img: string) => {
    if (!img) return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200';
    
    let url = img.trim();
    
    // Fix Pexels page links to direct image links
    if (url.includes('pexels.com/photo/')) {
        const parts = url.split('/');
        const idPart = parts.find(p => p.match(/^\d+$/)) || parts[parts.length - 2];
        if (idPart && idPart.match(/^\d+$/)) {
            return `https://images.pexels.com/photos/${idPart}/pexels-photo-${idPart}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
        }
    }

    if (url.startsWith('http')) return url;
    return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200';
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-[#003580] py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl space-y-4">
            <div className="flex items-center gap-2 text-[#febb02] font-black uppercase tracking-[0.3em] text-[10px]">
                <Sparkles className="h-4 w-4" /> Himalayan Experiences
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              Curated Itineraries
            </h1>
            <p className="text-xl text-white/80 font-medium">
              Verified local stays and handpicked routes across the Devbhumi.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 gap-8">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <PackageSkeleton key={i} />)
                ) : packages && packages.length > 0 ? (
                    packages.map((pkg) => (
                        <Card key={pkg.id} className="flex flex-col md:flex-row overflow-hidden border border-black/5 rounded-none hover:shadow-xl transition-all duration-500 group">
                           <div className="relative w-full md:w-[400px] aspect-[16/9] md:aspect-auto flex-shrink-0 overflow-hidden bg-slate-100">
                                <Image
                                    src={getImageUrl(pkg.image)}
                                    alt={pkg.title}
                                    fill
                                    unoptimized={true}
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4">
                                    <Badge className="bg-[#008009] text-white rounded-none border-0 font-black uppercase text-[9px] tracking-widest px-3 py-1">Himalayan Verified</Badge>
                                </div>
                           </div>

                           <div className="flex flex-col flex-grow p-6 md:p-10">
                                <div className="flex flex-col md:flex-row justify-between gap-8">
                                    <div className="space-y-4 flex-1">
                                        <div className="space-y-1">
                                            <CardTitle className="text-3xl font-black tracking-tighter leading-none hover:text-[#006ce4] transition-colors">
                                                <Link href={`/tour-packages/${pkg.id}`}>{pkg.title}</Link>
                                            </CardTitle>
                                            <div className="flex items-center gap-2 text-sm text-[#006ce4] font-black uppercase tracking-widest underline decoration-2 underline-offset-4">
                                                <MapPin className="h-4 w-4 text-[#003580]" />
                                                {pkg.destinations?.join(' • ')}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest">
                                                <Clock className="h-4 w-4 text-[#003580]" />
                                                {pkg.duration}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest">
                                                <Star className="h-4 w-4 text-[#febb02] fill-[#febb02]" />
                                                Top Rated
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground line-clamp-3 font-medium leading-relaxed max-w-2xl">
                                            {pkg.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end md:border-l border-black/5 md:pl-10 space-y-4 min-w-[220px]">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Starting from</p>
                                            <div className="flex flex-col items-end">
                                                <span className="text-3xl font-black text-[#1a1a1a] tracking-tighter leading-none">
                                                    ₹{pkg.totalCost?.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                                </span>
                                                <span className="text-[9px] font-bold text-green-700 uppercase tracking-widest mt-1">Includes GST + Transport</span>
                                            </div>
                                        </div>
                                        
                                        <Button asChild className="bg-[#006ce4] hover:bg-[#005bb8] rounded-none font-black uppercase tracking-widest text-[11px] h-12 w-full shadow-lg shadow-blue-200">
                                            <Link href={`/tour-packages/${pkg.id}`}>View Itinerary</Link>
                                        </Button>
                                    </div>
                                </div>
                           </div>
                        </Card>
                    ))
                ) : (
                    <div className="py-24 text-center border-2 border-dashed rounded-sm bg-muted/20">
                        <Compass className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-black tracking-tight">No live itineraries found</h3>
                        <p className="text-sm text-muted-foreground font-medium mt-2">Check back soon for new Himalayan journeys.</p>
                    </div>
                )}
            </div>
        </div>
      </section>
    </div>
  );
}
