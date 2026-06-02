'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { Card, CardTitle } from '@/components/ui/card';
import { MapPin, Sparkles, Clock, Star, ArrowRight, Compass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function PackageSkeleton() {
    return (
        <Card className="flex flex-col overflow-hidden border border-white/10 bg-white/5 rounded-[2rem] h-[500px]">
            <Skeleton className="h-48 w-full opacity-10" />
            <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4 opacity-10" />
                <Skeleton className="h-4 w-1/2 opacity-10" />
                <Skeleton className="h-20 w-full opacity-10" />
                <Skeleton className="h-10 w-full mt-4 opacity-10" />
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
      {/* Cinematic Banner */}
      <section className="relative py-32 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
            <Image 
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920" 
                alt="Mountains" 
                fill 
                priority
                className="object-cover opacity-30 grayscale"
            />
        </div>
        
        <div className="container relative z-20 mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl space-y-6"
          >
            <div className="inline-flex items-center gap-3 bg-primary/20 border border-primary/30 px-6 py-2 rounded-full text-primary font-black uppercase tracking-[0.4em] text-[10px]">
                <Sparkles className="h-4 w-4" /> Himalayan Masterpieces
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight uppercase text-white">
              Curated <br /> <span className="text-primary italic font-heading font-light lowercase">Itineraries</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl leading-relaxed tracking-tight">
              Experience the sacred peaks with verified local experts and handpicked boutique stays.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tour Grid */}
      <section className="py-20 px-6 relative z-10">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => <PackageSkeleton key={i} />)
                ) : packages && packages.length > 0 ? (
                    packages.map((pkg, i) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                        >
                            <Card className="group flex flex-col h-full overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-xl rounded-[2rem] hover:border-primary/40 transition-all duration-500 hover:shadow-2xl">
                                {/* Image Container */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                                    <Image
                                        src={getImageUrl(pkg.image)}
                                        alt={pkg.title}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90"
                                        decoding="async"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-primary text-background border-0 font-black uppercase text-[8px] tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                            ELITE VERIFIED
                                        </Badge>
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className="p-8 flex flex-col flex-grow space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[9px]">
                                            <Clock className="h-3 w-3" /> {pkg.duration}
                                        </div>
                                        <CardTitle className="text-2xl font-black tracking-tight text-white uppercase leading-snug group-hover:text-primary transition-colors">
                                            <Link href={`/tour-packages/${pkg.id}`}>{pkg.title}</Link>
                                        </CardTitle>
                                        <div className="flex items-start gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
                                            <MapPin className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                                            <span className="line-clamp-1">{pkg.destinations?.join(' • ')}</span>
                                        </div>
                                    </div>

                                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 font-medium">
                                        {pkg.description}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-white/5 space-y-6">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Investment</p>
                                                <p className="text-3xl font-black text-white tracking-tighter">
                                                    ₹{pkg.totalCost?.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 font-black text-primary text-[10px] uppercase tracking-widest">
                                                <Star className="h-3 w-3 fill-primary" /> 5.0
                                            </div>
                                        </div>
                                        
                                        <Button asChild className="w-full bg-primary hover:bg-white hover:text-background text-background rounded-full font-black uppercase tracking-widest text-[10px] h-12 shadow-xl shadow-primary/10 transition-all active:scale-95 group/btn">
                                            <Link href={`/tour-packages/${pkg.id}`} className="flex items-center justify-center gap-2">
                                                View Journey <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-40 text-center border-2 border-dashed border-white/10 rounded-[3rem] bg-white/[0.02]">
                        <Compass className="h-16 w-16 mx-auto text-white/10 mb-6" />
                        <h3 className="text-2xl font-black tracking-tight text-white uppercase">No Active Expeditions</h3>
                        <p className="text-slate-400 font-medium mt-2 max-w-xs mx-auto text-sm leading-relaxed">
                            Our team is currently vetting new Himalayan routes. Check back soon.
                        </p>
                    </div>
                )}
            </div>
        </div>
      </section>
    </div>
  );
}