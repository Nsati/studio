'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { Card, CardTitle, CardHeader, CardFooter } from '@/components/ui/card';
import { MapPin, Sparkles, Clock, Star, ArrowRight, Compass, ShieldCheck, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function PackageSkeleton() {
    return (
        <Card className="overflow-hidden border border-white/10 bg-white/5 rounded-[2.5rem] h-full">
            <Skeleton className="h-56 w-full opacity-10" />
            <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4 opacity-10" />
                <Skeleton className="h-4 w-1/2 opacity-10" />
                <div className="flex justify-between items-center mt-6">
                    <Skeleton className="h-8 w-24 opacity-10" />
                    <Skeleton className="h-10 w-32 opacity-10" />
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
      <section className="relative py-20 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/20 to-background z-10" />
            <Image 
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920" 
                alt="Mountains" 
                fill 
                priority
                className="object-cover opacity-30 grayscale"
            />
        </div>
        
        <div className="container relative z-20 mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-3 bg-primary/20 border border-primary/30 px-6 py-2 rounded-full text-primary font-black uppercase tracking-[0.4em] text-[9px] mb-4">
                <Sparkles className="h-3.5 w-3.5" /> Elite Expedition Portfolio
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight uppercase text-white">
              Sacred <span className="text-primary italic font-heading font-light lowercase">Journeys</span>
            </h1>
            <p className="text-base md:text-lg text-slate-300 font-medium max-w-xl mx-auto leading-relaxed tracking-tight opacity-80">
              Vetted Himalayan routes engineered for discovery, safety, and cultural depth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Symmetric Medium Grid */}
      <section className="py-16 px-6 relative z-10">
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
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="h-full"
                        >
                            <Card className="group flex flex-col h-full overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:bg-white/[0.06]">
                                {/* Image Header */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                                    <Image
                                        src={getImageUrl(pkg.image)}
                                        alt={pkg.title}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90"
                                        decoding="async"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute top-5 left-5">
                                        <Badge className="bg-primary text-background border-0 font-black uppercase text-[8px] tracking-[0.2em] px-4 py-1.5 rounded-full shadow-2xl">
                                            ELITE NODE
                                        </Badge>
                                    </div>
                                </div>

                                {/* Content Details */}
                                <CardHeader className="p-8 space-y-4 flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                                            <Clock className="h-3.5 w-3.5" /> {pkg.duration}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                                            <Star className="h-3 w-3 text-primary fill-primary" /> 5.0
                                        </div>
                                    </div>

                                    <CardTitle className="text-xl md:text-2xl font-black tracking-tight text-white uppercase leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        <Link href={`/tour-packages/${pkg.id}`}>{pkg.title}</Link>
                                    </CardTitle>

                                    <div className="flex items-start gap-2.5 text-slate-300 font-bold text-xs leading-relaxed line-clamp-2">
                                        <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        <span>{pkg.destinations?.join(' — ')}</span>
                                    </div>
                                </CardHeader>

                                {/* Footer Strip */}
                                <CardFooter className="p-8 pt-0 flex flex-col gap-6">
                                    <div className="h-px w-full bg-white/5" />
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Investment</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-2xl font-black text-white tracking-tighter">
                                                    ₹{pkg.totalCost?.toLocaleString('en-IN')}
                                                </span>
                                                <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">NET</span>
                                            </div>
                                        </div>
                                        
                                        <Button asChild size="sm" className="bg-primary hover:bg-white hover:text-background text-background rounded-full font-black uppercase tracking-widest text-[9px] h-10 px-6 shadow-xl shadow-primary/20 transition-all active:scale-95 group/btn">
                                            <Link href={`/tour-packages/${pkg.id}`} className="flex items-center gap-2">
                                                Details <ChevronRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center border-2 border-dashed border-white/10 rounded-[3rem] bg-white/[0.02]">
                        <Compass className="h-12 w-12 mx-auto text-white/10 mb-6" />
                        <h3 className="text-xl font-black tracking-tight text-white uppercase">No Expeditions Found</h3>
                        <p className="text-slate-400 font-medium mt-2 max-w-xs mx-auto text-xs leading-relaxed">
                            Our team is currently vetting new Himalayan routes.
                        </p>
                    </div>
                )}
            </div>

            {/* Verification Badge */}
            <div className="mt-16 p-8 border border-white/5 rounded-[2.5rem] bg-white/[0.01] text-center space-y-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 border border-primary/20 text-primary">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-[0.2em]">Harrier Protocol Verified</h4>
                <p className="text-slate-400 text-[10px] leading-relaxed font-medium uppercase tracking-widest opacity-60">
                    Field-tested by mountaineers • Audited for Safety • Guaranteed Hospitality
                </p>
            </div>
        </div>
      </section>
    </div>
  );
}
