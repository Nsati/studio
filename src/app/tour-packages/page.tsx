'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { Card, CardTitle } from '@/components/ui/card';
import { MapPin, Sparkles, Clock, Star, ArrowRight, Compass, ShieldCheck, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function PackageSkeleton() {
    return (
        <Card className="flex flex-col md:flex-row overflow-hidden border border-white/10 bg-white/5 rounded-[2.5rem] h-auto mb-8">
            <Skeleton className="h-64 w-full md:w-2/5 opacity-10" />
            <div className="p-8 flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4 opacity-10" />
                <Skeleton className="h-4 w-1/2 opacity-10" />
                <Skeleton className="h-24 w-full opacity-10" />
                <div className="flex justify-between items-end mt-6">
                    <Skeleton className="h-12 w-32 opacity-10" />
                    <Skeleton className="h-12 w-40 opacity-10" />
                </div>
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
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
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
                <Sparkles className="h-4 w-4" /> Elite Himalayan Series
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight uppercase text-white">
              Sacred <span className="text-primary italic font-heading font-light lowercase">Expeditions</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl leading-relaxed tracking-tight">
              A curated collection of journeys engineered for elite discovery and spiritual depth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Horizontal Tour Grid */}
      <section className="py-20 px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-12">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <PackageSkeleton key={i} />)
                ) : packages && packages.length > 0 ? (
                    packages.map((pkg, i) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                        >
                            <Card className="group flex flex-col md:flex-row overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] hover:border-primary/40 transition-all duration-700 hover:shadow-2xl hover:bg-white/[0.05]">
                                {/* Horizontal Image Container */}
                                <div className="relative w-full md:w-2/5 aspect-[16/10] md:aspect-auto overflow-hidden bg-slate-900">
                                    <Image
                                        src={getImageUrl(pkg.image)}
                                        alt={pkg.title}
                                        fill
                                        className="object-cover transition-transform duration-2000 group-hover:scale-110 opacity-90"
                                        decoding="async"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                                    <div className="absolute top-8 left-8">
                                        <Badge className="bg-primary text-background border-0 font-black uppercase text-[10px] tracking-[0.2em] px-6 py-2.5 rounded-full shadow-2xl">
                                            VERIFIED NODE
                                        </Badge>
                                    </div>
                                </div>

                                {/* Content Details - Extended View */}
                                <div className="p-10 md:p-14 flex flex-col flex-1 justify-between gap-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[11px]">
                                                <Clock className="h-4 w-4" /> {pkg.duration}
                                            </div>
                                            <div className="h-px w-8 bg-white/20" />
                                            <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-[0.3em] text-[11px]">
                                                <Star className="h-4 w-4 text-primary fill-primary" /> 5.0 Rating
                                            </div>
                                        </div>

                                        <CardTitle className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase leading-[0.9] group-hover:text-primary transition-colors">
                                            <Link href={`/tour-packages/${pkg.id}`}>{pkg.title}</Link>
                                        </CardTitle>

                                        <div className="flex items-start gap-3 text-slate-300 font-bold text-sm md:text-base leading-relaxed max-w-2xl">
                                            <MapPin className="h-5 w-5 text-primary shrink-0 mt-1" />
                                            <span>{pkg.destinations?.join(' — ')}</span>
                                        </div>

                                        <p className="text-slate-400 text-lg leading-relaxed line-clamp-2 font-medium max-w-2xl">
                                            {pkg.description}
                                        </p>
                                    </div>

                                    <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Investment Level</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                                    ₹{pkg.totalCost?.toLocaleString('en-IN')}
                                                </span>
                                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Incl. GST</span>
                                            </div>
                                        </div>
                                        
                                        <Button asChild className="w-full sm:w-auto bg-primary hover:bg-white hover:text-background text-background rounded-full font-black uppercase tracking-widest text-[12px] h-16 px-12 shadow-2xl shadow-primary/20 transition-all active:scale-95 group/btn">
                                            <Link href={`/tour-packages/${pkg.id}`} className="flex items-center justify-center gap-4">
                                                Initialize Journey <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-2" />
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

            {/* Elite Badge Footer */}
            <div className="mt-20 p-12 border border-white/5 rounded-[3rem] bg-white/[0.02] text-center space-y-6">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 border border-primary/20 text-primary">
                    <ShieldCheck className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-black uppercase tracking-widest">Harrier Protocol Verified</h4>
                <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                    Every itinerary listed above has been field-tested by our mountaineering team and audited against global safety standards.
                </p>
            </div>
        </div>
      </section>
    </div>
  );
}
