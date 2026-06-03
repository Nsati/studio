'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { Card, CardTitle, CardHeader, CardFooter } from '@/components/ui/card';
import { MapPin, Clock, Star, ArrowRight, ChevronRight, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function PackageSkeleton() {
    return (
        <Card className="overflow-hidden border border-slate-100 bg-white rounded-2xl h-full shadow-sm">
            <Skeleton className="h-48 w-full" />
            <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between items-center mt-6">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-10 w-32" />
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
    if (!img) return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800';
    let url = img.trim();
    return url.startsWith('http') ? url : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800';
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen pb-32">
      {/* Search Header Strip */}
      <section className="bg-white border-b pt-32 pb-12">
        <div className="container px-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Himalayan Vacations</h1>
            <p className="text-slate-500 font-medium">Personalize your journey with over {packages?.length || 0} expert-crafted itineraries.</p>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                            <Card className="group flex flex-col h-full overflow-hidden border border-slate-100 bg-white rounded-2xl hover:shadow-xl transition-all duration-300">
                                {/* Image Header */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                    <Image
                                        src={getImageUrl(pkg.image)}
                                        alt={pkg.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-primary text-white border-0 font-black uppercase text-[8px] tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
                                            BESTSELLER
                                        </Badge>
                                    </div>
                                </div>

                                {/* Content */}
                                <CardHeader className="p-6 space-y-4 flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-widest">
                                            <Clock className="h-3.5 w-3.5" /> {pkg.duration}
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-400 font-bold text-xs">
                                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> 4.9
                                        </div>
                                    </div>

                                    <CardTitle className="text-xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                        <Link href={`/tour-packages/${pkg.id}`}>{pkg.title}</Link>
                                    </CardTitle>

                                    <div className="flex items-start gap-1.5 text-slate-500 font-medium text-sm line-clamp-2">
                                        <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                        <span>{pkg.destinations?.join(' • ')}</span>
                                    </div>
                                </CardHeader>

                                {/* Footer */}
                                <CardFooter className="p-6 pt-0 flex flex-col gap-6">
                                    <div className="h-px w-full bg-slate-50" />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Starts from</p>
                                            <p className="text-2xl font-black text-slate-900">
                                                ₹{pkg.totalCost?.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        
                                        <Button asChild size="sm" className="bg-primary hover:bg-blue-700 text-white rounded-xl font-bold px-6 shadow-md shadow-blue-100 transition-all active:scale-95">
                                            <Link href={`/tour-packages/${pkg.id}`}>
                                                Explore <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center border-2 border-dashed rounded-3xl bg-white">
                        <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">No Expeditions Found</h3>
                    </div>
                )}
            </div>
            
            <div className="mt-16 flex items-center justify-center">
                 <div className="bg-white px-8 py-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <Info className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Can't find what you are looking for?</p>
                        <p className="text-xs text-slate-500 font-medium">Build your own itinerary with our travel specialists.</p>
                    </div>
                    <Button variant="link" className="text-primary font-bold">Customize Trip</Button>
                 </div>
            </div>
        </div>
      </section>
    </div>
  );
}
