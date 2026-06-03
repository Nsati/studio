'use client';
import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { HotelCard } from '@/components/hotel/HotelCard';
import Loading from './loading';
import { SearchFilters } from './SearchFilters';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { Slider } from '@/components/ui/slider';

function SearchResults({ filters }: { filters: any }) {
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

  const { data: hotelsData, isLoading } = useCollection<Hotel>(hotelsQuery);

  const filteredHotels = useMemo(() => {
    if (!hotelsData) return [];
    
    return hotelsData.filter(hotel => {
      const price = hotel.minPrice || 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
      if (filters.ratings.length > 0 && !filters.ratings.includes(Math.floor(hotel.rating))) return false;
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every((a: string) => 
          hotel.amenities.map(h => h.toLowerCase()).includes(a.toLowerCase())
        );
        if (!hasAllAmenities) return false;
      }
      return true;
    });
  }, [hotelsData, filters]);
  
  if (isLoading) {
      return (
        <div className="flex-1">
             <div className="grid grid-cols-1 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="rounded-sm overflow-hidden border-border/10 bg-white h-[240px]">
                        <Skeleton className="h-full w-full opacity-50" />
                    </Card>
                ))}
             </div>
        </div>
      )
  }

  return (
    <div className="flex-1">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 text-left">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-none text-foreground uppercase font-heading">
                    {city && city !== 'All' ? city : 'Uttarakhand'}
                </h1>
                <p className="text-slate-500 font-bold text-sm">
                    {filteredHotels.length} elite properties found in node.
                </p>
            </div>
            
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-border/10 shadow-sm">
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mr-2">Sort Protocol</div>
                <select className="bg-transparent font-bold text-[10px] text-foreground uppercase tracking-widest focus:outline-none cursor-pointer">
                    <option>Recommended</option>
                    <option>Price: Low to High</option>
                    <option>Rating: Safety Peak</option>
                </select>
            </div>
        </div>

      {filteredHotels.length > 0 ? (
        <div className="grid grid-cols-1 gap-8">
          {filteredHotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 rounded-[3rem] border-2 border-dashed border-border bg-white text-center px-10">
          <SlidersHorizontal className="h-16 w-16 text-slate-200 mb-6" />
          <h3 className="text-xl font-bold tracking-tight text-slate-400 uppercase">No Nodes Detected</h3>
          <p className="text-slate-400 text-sm mt-2 font-medium">Try resetting your search parameters.</p>
        </div>
      )}
    </div>
  );
}

function SearchFiltersWrapper() {
  return (
    <Suspense fallback={<Skeleton className="h-20 w-full rounded-[2rem] bg-white shadow-xl" />}>
      <SearchFilters />
    </Suspense>
  );
}

export default function SearchPage() {
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const formatPrice = (val: number) => val.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });

  const toggleRating = (rating: number) => {
    setSelectedRatings(prev => 
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 100000]);
    setSelectedRatings([]);
    setSelectedAmenities([]);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
        {/* Compact Header Spacing */}
        <div className="relative z-10 bg-primary/5 border-y border-border/10 py-8 md:py-10">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="max-w-5xl mx-auto">
                    <SearchFiltersWrapper />
                </div>
            </div>
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl py-12 md:py-16 px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-16">
                {/* Filters Sidebar */}
                <aside className="hidden lg:block w-80 space-y-6 shrink-0">
                    <Card className="rounded-[2.5rem] border-border/10 bg-white shadow-apple-deep overflow-hidden">
                        <div className="p-10 space-y-12">
                            <div className="flex items-center justify-between border-b border-muted pb-6">
                                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">Filter Hub</h3>
                                <button onClick={clearFilters} className="text-[10px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-widest">
                                    Reset
                                </button>
                            </div>
                            
                            <div className="space-y-12">
                                <div className="space-y-8">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Budget per night</span>
                                    <div className="space-y-6 px-2">
                                        <Slider defaultValue={[0, 100000]} max={100000} step={5000} value={priceRange} onValueChange={setPriceRange} className="py-4" />
                                        <div className="flex justify-between text-[10px] font-bold text-foreground">
                                            <span>{formatPrice(priceRange[0])}</span>
                                            <span>{formatPrice(priceRange[1])}+</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Guest Rating</span>
                                    <div className="space-y-5">
                                        {[5, 4, 3].map(star => (
                                            <div key={star} className="flex items-center gap-4 cursor-pointer group" onClick={() => toggleRating(star)}>
                                                <div className={cn("h-6 w-6 rounded-lg border transition-all flex items-center justify-center", selectedRatings.includes(star) ? "border-primary bg-primary" : "border-muted group-hover:border-primary/50 bg-muted/30")}>
                                                    {selectedRatings.includes(star) && <Check className="h-3.5 w-3.5 text-white stroke-[4]" />}
                                                </div>
                                                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{star} Tier & Above</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Facilities</span>
                                    <div className="space-y-5">
                                        {['WiFi', 'Spa', 'Pool', 'Mountain View', 'Parking', 'Restaurant'].map(item => (
                                            <div key={item} className="flex items-center gap-4 cursor-pointer group" onClick={() => toggleAmenity(item)}>
                                                <div className={cn("h-6 w-6 rounded-lg border transition-all flex items-center justify-center", selectedAmenities.includes(item) ? "border-primary bg-primary" : "border-muted group-hover:border-primary/50 bg-muted/30")}>
                                                    {selectedAmenities.includes(item) && <Check className="h-3.5 w-3.5 text-white stroke-[4]" />}
                                                </div>
                                                <span className={cn("text-sm font-bold transition-colors capitalize", selectedAmenities.includes(item) ? "text-primary" : "text-foreground group-hover:text-primary")}>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-muted">
                                <div className="p-6 bg-primary/5 rounded-3xl flex items-start gap-4">
                                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">Verified Himalayan Protocol applied to all results.</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </aside>

                <Suspense fallback={<Loading />}>
                    <SearchResults filters={{ priceRange, ratings: selectedRatings, amenities: selectedAmenities }} />
                </Suspense>
            </div>
        </div>
    </div>
  );
}
