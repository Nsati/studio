
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { Card, CardTitle, CardHeader, CardFooter } from '@/components/ui/card';
import { MapPin, Clock, Star, ArrowRight, Info, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function PackageSkeleton() {
    return (
        <Card className="overflow-hidden border-white/5 bg-white/[0.03] rounded-[2rem] h-full shadow-2xl animate-pulse">
            <div className="h-48 w-full bg-white/5" />
            <div className="p-8 space-y-4">
                <div className="h-6 w-3/4 bg-white/5 rounded" />
                <div className="h-4 w-1/2 bg-white/5 rounded" />
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
    if (!img) return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800';
    let url = img.trim();
    return url.startsWith('http') ? url : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800';
  };

  return (
    <div className="bg-background min-h-screen pb-32">
      {/* Header Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920"
          alt="Expedition Banner"
          fill
          className="object-cover brightness-[0.3]"
          priority
        />
        <div className="container relative z-10 px-6 text-center space-y-6">
            <Badge className="bg-primary/20 text-primary border border-primary/30 px-6 py-2 rounded-full font-black uppercase tracking-[0.4em] text-[10px] mb-4">
                Global Tour Grid
            </Badge>
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85]">
                Active <br/> <span className="text-primary italic font-heading font-light capitalize">Expeditions</span>
            </h1>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-24 px-6 relative z-20 -mt-20">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => <PackageSkeleton key={i} />)
                ) : packages && packages.length > 0 ? (
                    packages.map((pkg, i) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="h-full"
                        >
                            <Card className="group flex flex-col h-full overflow-hidden border border-white/5 bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 luxury-shadow">
                                {/* Image Header */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                                    <Image
                                        src={getImageUrl(pkg.image)}
                                        alt={pkg.title}
                                        fill
                                        className="object-cover transition-transform duration-2000 group-hover:scale-105"
                                    />
                                    <div className="absolute top-6 left-6">
                                        <Badge className="bg-primary text-background border-0 font-black uppercase text-[8px] tracking-widest px-4 py-2 rounded-full shadow-2xl">
                                            ELITE VERIFIED
                                        </Badge>
                                    </div>
                                </div>

                                {/* Content */}
                                <CardHeader className="p-8 space-y-6 flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                                            <Clock className="h-3.5 w-3.5" /> {pkg.duration}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                                            <Star className="h-3.5 w-3.5 text-primary fill-primary" /> 4.9
                                        </div>
                                    </div>

                                    <CardTitle className="text-2xl font-black tracking-tight text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug uppercase">
                                        <Link href={`/tour-packages/${pkg.id}`}>{pkg.title}</Link>
                                    </CardTitle>

                                    <div className="flex items-start gap-2 text-slate-400 font-medium text-xs line-clamp-2 uppercase tracking-widest leading-relaxed">
                                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                                        <span>{pkg.destinations?.join(' — ')}</span>
                                    </div>
                                </CardHeader>

                                {/* Footer */}
                                <CardFooter className="p-8 pt-0 flex flex-col gap-8">
                                    <div className="h-px w-full bg-white/5" />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Investment</p>
                                            <p className="text-3xl font-black text-white tracking-tighter">
                                                ₹{pkg.totalCost?.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        
                                        <Button asChild size="lg" className="bg-primary hover:bg-white text-background rounded-full font-black text-[10px] tracking-widest uppercase px-8 h-14 shadow-2xl shadow-primary/20 transition-all active:scale-95">
                                            <Link href={`/tour-packages/${pkg.id}`}>
                                                EXPLORE <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-40 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
                        <Package className="h-16 w-16 text-slate-700 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">No Active Expeditions Found</h3>
                    </div>
                )}
            </div>
            
            <div className="mt-20 flex items-center justify-center">
                 <div className="bg-white/[0.03] backdrop-blur-md px-12 py-6 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                    <div className="p-4 bg-primary/10 rounded-2xl">
                        <Info className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-sm font-black text-white uppercase tracking-widest">Custom Node Required?</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Build your own itinerary with our Himalayan specialists.</p>
                    </div>
                    <Button variant="link" className="text-primary font-black uppercase tracking-[0.2em] text-[10px] hover:text-white">CONCIERGE DESK</Button>
                 </div>
            </div>
        </div>
      </section>
    </div>
  );
}
