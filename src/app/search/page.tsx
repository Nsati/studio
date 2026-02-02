'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { HotelCard } from '@/components/hotel/HotelCard';
import Loading from './loading';
import { SearchFilters } from './SearchFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, SlidersHorizontal, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

function SearchResults() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const city = searchParams.get('city');

  const hotelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;

    let q = query(collection(firestore, 'hotels'));

    if (city && city !== 'All') {
      q = query(q, where('city', '==', city));
    }
    
    return q;
  }, [firestore, city]);

  const { data: hotels, isLoading } = useCollection<Hotel>(hotelsQuery);
  
  if (isLoading) {
      return (
        <div className="flex-1">
             <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="rounded-[2rem] overflow-hidden border-black/5">
                        <Skeleton className="h-64 w-full" />
                        <div className="p-6 space-y-3">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </Card>
                ))}
             </div>
        </div>
      )
  }

  return (
    <div className="flex-1">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">
                    <MapPin className="h-3 w-3" /> Browsing Curated Stays
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                    {city && city !== 'All' ? city : 'Uttarakhand'}
                </h1>
                <p className="text-muted-foreground font-medium text-sm mt-1">
                    {hotels ? `${hotels.length} luxury properties matched your vibe.` : 'Finding properties...'}
                </p>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">Sort by</div>
                <select className="bg-transparent font-bold text-sm focus:outline-none border-b-2 border-black/10 pb-1 cursor-pointer">
                    <option>Recommended</option>
                    <option>Price: Low to High</option>
                    <option>Top Rated</option>
                </select>
            </div>
        </div>

      {hotels && hotels.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 rounded-[3rem] border-2 border-dashed border-black/5 bg-muted/20 text-center px-10">
          <SlidersHorizontal className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-black tracking-tight">No results found</h3>
          <p className="text-muted-foreground text-sm mt-2 font-medium">Try adjusting your filters or browsing a different location.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const formatPrice = (val: number) => val.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-background">
        <div className="bg-white border-b border-black/5 py-10">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <SearchFilters />
            </div>
        </div>

        <div className="container mx-auto max-w-7xl py-12 px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-16">
                {/* Filters Sidebar - Desktop Only */}
                <aside className="hidden lg:block w-72 space-y-10 shrink-0">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-widest">Filters</h3>
                            <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Clear All</button>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price Range</Label>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>{formatPrice(2000)}</span>
                                        <span>{formatPrice(50000)}+</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full w-1/2 bg-primary" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Star Rating</Label>
                                <div className="space-y-3">
                                    {[5, 4, 3].map(star => (
                                        <label key={star} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="h-5 w-5 rounded border-2 border-black/10 group-hover:border-primary transition-colors flex items-center justify-center">
                                                {star === 5 && <div className="h-2.5 w-2.5 bg-primary rounded-sm" />}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {Array.from({length: star}).map((_, i) => <Star key={i} className="h-3 w-3 fill-accent text-accent" />)}
                                                <span className="text-sm font-bold ml-1">{star} Stars</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amenities</Label>
                                <div className="space-y-3">
                                    {['WiFi', 'Spa', 'Pool', 'Mountain View'].map(item => (
                                        <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="h-5 w-5 rounded border-2 border-black/10 group-hover:border-primary transition-colors" />
                                            <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <Suspense fallback={<Loading />}>
                    <SearchResults />
                </Suspense>
            </div>
        </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={cn("block", className)}>{children}</span>
}
