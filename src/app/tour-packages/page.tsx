
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { Card, CardTitle } from '@/components/ui/card';
import { MapPin, Compass, Sparkles, Clock, Star, ArrowRight, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function PackageSkeleton() {
    return (
        <Card className="flex flex-col md:flex-row overflow-hidden border-white/5 bg-white/5 rounded-3xl h-[300px]">
            <Skeleton className="h-full w-full md:w-[400px] opacity-10" />
            <div className="flex-1 p-10 space-y-6">
                <Skeleton className="h-10 w-3/4 opacity-10" />
                <Skeleton className="h-4 w-1/2 opacity-10" />
                <Skeleton className="h-24 w-full opacity-10" />
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
    if (url.includes('pexels.com/photo/')) {
        const parts = url.split('/');
        const idPart = parts.find(p => p.match(/^\d+$/)) || parts[parts.length - 2];
        if (idPart && idPart.match(/^\d+$/)) {
            return `https://images.pexels.com/photos/${idPart}/pexels-photo-${idPart}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
        }
    }
    return url.startsWith('http') ? url : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200';
  };

  return (
    <div className="bg-background min-h-screen text-white pb-32">
      {/* Cinematic Header */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="container relative z-10 mx-auto text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="bg-primary/20 text-primary border-primary/30 px-6 py-2 rounded-full font-black uppercase tracking-[0.4em] text-[10px] mb-4">
                <Sparkles className="h-3 w-3 mr-2 inline" /> Premium Collection
            </Badge>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
              Elite <span className="text-primary italic font-heading font-light lowercase">Expeditions</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium max-w-2xl mx-auto mt-4">
              Verified local stays and handpicked routes across the sacred Himalayas.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 gap-10">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <PackageSkeleton key={i} />)
                ) : packages && packages.length > 0 ? (
                    packages.map((pkg, i) => (
                        <motion.div 
                            key={pkg.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="flex flex-col lg:flex-row overflow-hidden border-white/5 bg-white/5 backdrop-blur-xl rounded-[2.5rem] hover:border-primary/20 transition-all duration-700 group luxury-shadow">
                                <div className="relative w-full lg:w-[450px] aspect-[16/10] lg:aspect-auto flex-shrink-0 overflow-hidden">
                                    <Image
                                        src={getImageUrl(pkg.image)}
                                        alt={pkg.title}
                                        fill
                                        unoptimized={true}
                                        className="object-cover transition-transform duration-2000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                                    <div className="absolute top-6 left-6">
                                        <Badge className="bg-primary text-background rounded-full border-0 font-black uppercase text-[9px] tracking-widest px-5 py-2 shadow-xl">
                                            Himalayan Verified
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex flex-col flex-grow p-8 md:p-12 justify-between">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                                                <TrendingUp className="h-4 w-4" /> Trending Expedition
                                            </div>
                                            <CardTitle className="text-3xl md:text-5xl font-black tracking-tighter leading-none hover:text-primary transition-colors cursor-pointer uppercase">
                                                <Link href={`/tour-packages/${pkg.id}`}>{pkg.title}</Link>
                                            </CardTitle>
                                            <div className="flex items-center gap-2 text-sm text-slate-400 font-bold uppercase tracking-widest">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                {pkg.destinations?.join(' — ')}
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-8">
                                            <div className="flex items-center gap-3 text-xs font-black text-white uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                                <Clock className="h-4 w-4 text-primary" />
                                                {pkg.duration}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest">
                                                <Star className="h-4 w-4 fill-primary" />
                                                Top Rated Experience
                                            </div>
                                        </div>

                                        <p className="text-slate-300 text-base font-medium leading-relaxed max-w-3xl line-clamp-3">
                                            {pkg.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 mt-10 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-1">Starting from</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-white tracking-tighter leading-none">
                                                    ₹{pkg.totalCost?.toLocaleString('en-IN')}
                                                </span>
                                                <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Incl. GST + Trans.</span>
                                            </div>
                                        </div>
                                        
                                        <Button asChild className="bg-primary hover:bg-primary/90 text-background rounded-full px-12 h-16 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 group/btn transition-all hover:scale-105 active:scale-95">
                                            <Link href={`/tour-packages/${pkg.id}`}>
                                                Explore Itinerary <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover/btn:translate-x-2" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-32 text-center border-2 border-dashed border-white/10 rounded-[3rem] bg-white/5">
                        <Compass className="h-20 w-20 mx-auto text-white/10 mb-6" />
                        <h3 className="text-3xl font-black tracking-tight uppercase">No Live Itineraries</h3>
                        <p className="text-slate-400 text-lg font-medium mt-2">New Himalayan journeys are being curated. Check back soon.</p>
                    </div>
                )}
            </div>
        </div>
      </section> section 
    </div>
  );
}
