
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { Card, CardTitle, CardHeader, CardFooter, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Star, Info, Package, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function PackageSkeleton() {
    return (
        <Card className="overflow-hidden border-border/10 bg-white rounded-[2.5rem] h-full shadow-lg animate-pulse">
            <div className="h-56 w-full bg-muted" />
            <div className="p-8 space-y-4">
                <div className="h-6 w-3/4 bg-muted rounded" />
                <div className="h-4 w-1/2 bg-muted rounded" />
                <div className="h-12 w-full bg-muted rounded-full mt-6" />
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
    <div className="bg-background min-h-screen pb-32 font-sans selection:bg-accent selection:text-white">
      {/* Header Section */}
      <section className="relative h-[50vh] min-h-[450px] flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920"
          alt="Expedition Banner"
          fill
          className="object-cover brightness-[0.4]"
          priority
        />
        <div className="container relative z-10 px-6 text-center space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Badge className="bg-accent text-accent-foreground border-0 px-8 py-2 rounded-full font-black uppercase tracking-[0.4em] text-[10px] mb-6 shadow-2xl saffron-glow">
                    GLOBAL EXPEDITION GRID
                </Badge>
                <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85] font-heading drop-shadow-2xl">
                    Active <br/> <span className="text-accent italic font-spiritual capitalize">Expeditions</span>
                </h1>
            </motion.div>
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
                            <Card className="group flex flex-col h-full overflow-hidden border-black/5 bg-white rounded-[2.5rem] hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 shadow-apple-deep">
                                {/* Image Header */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                                    <Image
                                        src={getImageUrl(pkg.image)}
                                        alt={pkg.title}
                                        fill
                                        className="object-cover transition-transform duration-2000 group-hover:scale-110"
                                        unoptimized={true}
                                    />
                                    <div className="absolute top-6 left-6">
                                        <Badge className="bg-primary/90 backdrop-blur-md text-white border-0 font-black uppercase text-[8px] tracking-widest px-5 py-2.5 rounded-full shadow-xl">
                                            ELITE VERIFIED
                                        </Badge>
                                    </div>
                                </div>

                                {/* Content */}
                                <CardHeader className="p-8 space-y-4 flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                                            <Clock className="h-4 w-4" /> {pkg.duration}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-amber-500 font-black text-xs">
                                            <Star className="h-4 w-4 fill-current" /> 4.9
                                        </div>
                                    </div>

                                    <CardTitle className="text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug uppercase font-heading">
                                        <Link href={`/tour-packages/${pkg.id}`}>{pkg.title}</Link>
                                    </CardTitle>

                                    <div className="flex items-start gap-2 text-slate-400 font-bold text-[10px] line-clamp-1 uppercase tracking-widest leading-relaxed">
                                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                                        <span>{pkg.destinations?.join(' — ')}</span>
                                    </div>
                                </CardHeader>

                                {/* Footer - Redesigned for Alignment */}
                                <CardFooter className="p-8 pt-0 flex flex-col gap-6">
                                    <div className="h-px w-full bg-slate-100" />
                                    <div className="flex items-center justify-between gap-4 w-full">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Starting from</span>
                                            <span className="text-2xl font-black text-primary tracking-tighter">
                                                ₹{pkg.totalCost?.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        
                                        <Button asChild className="bg-accent hover:bg-primary text-accent-foreground hover:text-white rounded-full font-black text-[10px] tracking-widest uppercase px-8 h-12 shadow-xl transition-all active:scale-95 saffron-glow">
                                            <a href="tel:+916399902725" className="flex items-center justify-center gap-2">
                                                <Phone className="h-3.5 w-3.5" /> CALL
                                            </a>
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-40 text-center border-2 border-dashed border-border/20 rounded-[3rem] bg-white shadow-inner">
                        <Package className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-300 uppercase tracking-[0.2em]">No Active Expeditions</h3>
                    </div>
                )}
            </div>
            
            {/* Custom Support Banner */}
            <div className="mt-20 flex items-center justify-center">
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="bg-white px-12 py-8 rounded-[3rem] border border-black/5 flex flex-col md:flex-row items-center gap-8 shadow-apple-deep max-w-4xl w-full"
                >
                    <div className="p-5 bg-primary/10 rounded-[2rem]">
                        <Info className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <p className="text-sm font-black text-foreground uppercase tracking-widest">Custom Itinerary Required?</p>
                        <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tight">Build your own nodes with our Himalayan specialists.</p>
                    </div>
                    <Button variant="link" className="text-primary font-black uppercase tracking-[0.2em] text-[10px] hover:text-accent border-b-2 border-primary/10 hover:border-accent pb-1 h-auto">CONCIERGE DESK</Button>
                 </motion.div>
            </div>
        </div>
      </section>
    </div>
  );
}
