
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { Card, CardTitle } from '@/components/ui/card';
import { MapPin, Compass, Sparkles, Clock, Star, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function PackageSkeleton() {
    return (
        <Card className="flex flex-col md:flex-row overflow-hidden border border-white/5 bg-white/5 rounded-2xl">
            <Skeleton className="h-[250px] w-full md:w-[400px] opacity-10" />
            <div className="flex-1 p-8 space-y-4">
                <Skeleton className="h-8 w-3/4 opacity-10" />
                <Skeleton className="h-4 w-1/2 opacity-10" />
                <Skeleton className="h-20 w-full opacity-10" />
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
    <div className="bg-background min-h-screen text-white">
      {/* Cinematic Banner */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
            <Image 
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920" 
                alt="Mountains" 
                fill 
                className="object-cover opacity-30"
            />
        </div>
        
        <div className="container relative z-20">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
                <Sparkles className="h-4 w-4" /> Himalayan Masterpieces
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none uppercase">
              Curated <br /> <span className="text-primary italic font-heading font-light lowercase">Itineraries</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium max-w-xl leading-relaxed">
              Experience Uttarakhand with verified local experts, elite transport, and handpicked boutique stays.
            </p>
          </div>
        </div>
      </section>

      {/* Tour Grid */}
      <section className="py-20 px-6">
        <div className="container">
            <div className="grid grid-cols-1 gap-10">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <PackageSkeleton key={i} />)
                ) : packages && packages.length > 0 ? (
                    packages.map((pkg, i) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="flex flex-col md:flex-row overflow-hidden border border-white/5 bg-white/5 backdrop-blur-xl rounded-[2.5rem] hover:border-primary/30 transition-all duration-500 group group/card luxury-shadow">
                                <div className="relative w-full md:w-[450px] aspect-[16/10] md:aspect-auto flex-shrink-0 overflow-hidden bg-slate-900">
                                        <Image
                                            src={getImageUrl(pkg.image)}
                                            alt={pkg.title}
                                            fill
                                            unoptimized={true}
                                            className="object-cover transition-transform duration-1000 group-hover/card:scale-110 opacity-80"
                                        />
                                        <div className="absolute top-6 left-6">
                                            <Badge className="bg-primary text-background border-0 font-black uppercase text-[9px] tracking-widest px-4 py-1.5 rounded-full shadow-xl">
                                                Verified Elite
                                            </Badge>
                                        </div>
                                </div>

                                <div className="flex flex-col flex-grow p-8 md:p-12 justify-center">
                                    <div className="flex flex-col lg:flex-row justify-between gap-10">
                                        <div className="space-y-6 flex-1">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                                                    <MapPin className="h-4 w-4" /> {pkg.destinations?.join(' — ')}
                                                </div>
                                                <CardTitle className="text-3xl md:text-4xl font-black tracking-tighter leading-tight hover:text-primary transition-colors">
                                                    <Link href={`/tour-packages/${pkg.id}`}>{pkg.title}</Link>
                                                </CardTitle>
                                            </div>
                                            
                                            <div className="flex items-center gap-8 border-y border-white/5 py-4">
                                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-200 uppercase tracking-widest">
                                                    <Clock className="h-4 w-4 text-primary" />
                                                    {pkg.duration}
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-200 uppercase tracking-widest">
                                                    <Star className="h-4 w-4 text-primary fill-primary" />
                                                    Top Rated
                                                </div>
                                            </div>

                                            <p className="text-slate-400 font-medium leading-relaxed line-clamp-3 text-base">
                                                {pkg.description}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-center lg:items-end lg:border-l border-white/5 lg:pl-12 space-y-6 min-w-[240px] justify-center">
                                            <div className="text-center lg:text-right space-y-1">
                                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Package Starts At</p>
                                                <div className="flex flex-col items-center lg:items-end">
                                                    <span className="text-4xl font-black text-white tracking-tighter">
                                                        ₹{pkg.totalCost?.toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">All-Inclusive Luxury</span>
                                                </div>
                                            </div>
                                            
                                            <Button asChild className="bg-primary hover:bg-primary/90 text-background rounded-full font-black uppercase tracking-[0.2em] text-[11px] h-14 w-full shadow-2xl shadow-primary/20">
                                                <Link href={`/tour-packages/${pkg.id}`}>
                                                    Discover Details <ArrowRight className="ml-3 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-32 text-center border-2 border-dashed border-white/10 rounded-[3rem] bg-white/5">
                        <Compass className="h-16 w-16 mx-auto text-white/20 mb-6" />
                        <h3 className="text-2xl font-black tracking-tight text-white uppercase">No Active Expeditions</h3>
                        <p className="text-slate-400 font-medium mt-2 max-w-sm mx-auto">Check back soon as we curate more elite Himalayan journeys.</p>
                    </div>
                )}
            </div>
        </div>
      </section>
    </div>
  );
}
