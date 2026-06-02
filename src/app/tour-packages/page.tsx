
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
        <Card className="flex flex-col md:flex-row overflow-hidden border border-white/5 bg-white/5 rounded-[2.5rem]">
            <Skeleton className="h-[250px] w-full md:w-[450px] bg-white/5" />
            <div className="flex-1 p-8 md:p-12 space-y-6">
                <Skeleton className="h-10 w-3/4 bg-white/5" />
                <Skeleton className="h-6 w-1/2 bg-white/5" />
                <Skeleton className="h-24 w-full bg-white/5" />
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
    <div className="bg-background min-h-screen text-white selection:bg-primary selection:text-background">
      {/* Animated Background Decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Cinematic Banner */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent z-10" />
            <Image 
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920" 
                alt="Mountains" 
                fill 
                priority
                decoding="async"
                className="object-cover opacity-40 grayscale"
            />
        </div>
        
        <div className="container relative z-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl space-y-6"
          >
            <div className="inline-flex items-center gap-3 bg-primary/20 border border-primary/30 px-6 py-2 rounded-full text-primary font-black uppercase tracking-[0.4em] text-[10px]">
                <Sparkles className="h-4 w-4" /> Himalayan Masterpieces
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase text-white">
              Curated <br /> <span className="text-primary italic font-heading font-light lowercase">Itineraries</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium max-w-xl leading-relaxed">
              Experience Uttarakhand with verified local experts, elite transport, and handpicked boutique stays.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tour Grid */}
      <section className="py-24 px-6 relative z-10">
        <div className="container">
            <div className="grid grid-cols-1 gap-12">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <PackageSkeleton key={i} />)
                ) : packages && packages.length > 0 ? (
                    packages.map((pkg, i) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                        >
                            <Card className="flex flex-col md:flex-row overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl rounded-[3rem] hover:border-primary/40 transition-all duration-700 group luxury-shadow">
                                {/* Image Container */}
                                <div className="relative w-full md:w-[500px] aspect-[16/10] md:aspect-auto flex-shrink-0 overflow-hidden bg-slate-900">
                                        <Image
                                            src={getImageUrl(pkg.image)}
                                            alt={pkg.title}
                                            fill
                                            loading="lazy"
                                            decoding="async"
                                            className="object-cover transition-transform duration-3000 group-hover:scale-105 opacity-80"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent hidden md:block" />
                                        <div className="absolute top-8 left-8">
                                            <Badge className="bg-primary text-background border-0 font-black uppercase text-[10px] tracking-[0.2em] px-5 py-2 rounded-full shadow-2xl">
                                                ELITE VERIFIED
                                            </Badge>
                                        </div>
                                </div>

                                {/* Content Details */}
                                <div className="flex flex-col flex-grow p-8 md:p-14 justify-center bg-gradient-to-br from-white/[0.03] to-transparent">
                                    <div className="flex flex-col lg:flex-row justify-between gap-12">
                                        <div className="space-y-8 flex-1">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[11px]">
                                                    <MapPin className="h-4 w-4" /> {pkg.destinations?.join(' — ')}
                                                </div>
                                                <CardTitle className="text-3xl md:text-5xl font-black tracking-tighter leading-none text-white uppercase group-hover:text-primary transition-colors">
                                                    <Link href={`/tour-packages/${pkg.id}`}>{pkg.title}</Link>
                                                </CardTitle>
                                            </div>
                                            
                                            <div className="flex items-center gap-8 border-y border-white/10 py-6">
                                                <div className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.2em]">
                                                    <Clock className="h-4 w-4 text-primary" />
                                                    {pkg.duration}
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.2em]">
                                                    <Star className="h-4 w-4 text-primary fill-primary" />
                                                    Top Rated Expedition
                                                </div>
                                            </div>

                                            <p className="text-slate-400 font-medium leading-relaxed line-clamp-3 text-lg max-w-2xl">
                                                {pkg.description}
                                            </p>
                                        </div>

                                        {/* Pricing & CTA Unit */}
                                        <div className="flex flex-col items-center lg:items-end lg:border-l border-white/10 lg:pl-12 space-y-8 min-w-[280px] justify-center text-center lg:text-right">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Investment Starts At</p>
                                                <div className="flex flex-col items-center lg:items-end">
                                                    <span className="text-5xl font-black text-white tracking-tighter">
                                                        ₹{pkg.totalCost?.toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mt-2 bg-primary/10 px-3 py-1 rounded-sm border border-primary/20">All-Inclusive Luxury</span>
                                                </div>
                                            </div>
                                            
                                            <Button asChild className="bg-primary hover:bg-white hover:text-background text-background rounded-full font-black uppercase tracking-[0.3em] text-[12px] h-16 w-full shadow-2xl shadow-primary/20 transition-all active:scale-95 group/btn">
                                                <Link href={`/tour-packages/${pkg.id}`}>
                                                    Discover Details <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover/btn:translate-x-2" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-40 text-center border-2 border-dashed border-white/10 rounded-[4rem] bg-white/[0.02]">
                        <Compass className="h-20 w-20 mx-auto text-white/10 mb-8" />
                        <h3 className="text-3xl font-black tracking-tight text-white uppercase">No Active Expeditions</h3>
                        <p className="text-slate-400 font-medium mt-3 max-w-md mx-auto text-lg leading-relaxed">
                            Our team is currently vetting new Himalayan routes. Check back soon for updated collections.
                        </p>
                    </div>
                )}
            </div>
        </div>
      </section>
    </div>
  );
}
