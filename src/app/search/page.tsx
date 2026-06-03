'use client';
import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
                    <Card key={i} className="rounded-sm overflow-hidden border-white/5 bg-card h-[240px]">
                        <Skeleton className="h-full w-full opacity-10" />
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
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none text-white uppercase">
                    {city && city !== 'All' ? city : 'Uttarakhand'}
                </h1>
                <p className="text-slate-100 font-bold text-sm">
                    {filteredHotels.length} elite properties found.
                </p>
            </div>
            
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-sm border border-white/10">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white mr-2">Sort Protocol</div>
                <select className="bg-transparent font-black text-[9px] text-white uppercase tracking-widest focus:outline-none cursor-pointer">
                    <option className="bg-[#0f172a]">Recommended</option>
                    <option className="bg-[#0f172a]">Price: Low to High</option>
                    <option className="bg-[#0f172a]">Rating: Safety Peak</option>
                </select>
            </div>
        </div>

      {filteredHotels.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredHotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 text-center px-10">
          <SlidersHorizontal className="h-16 w-16 text-white/20 mb-6" />
          <h3 className="text-xl font-black tracking-tight text-white uppercase">No Nodes Detected</h3>
          <p className="text-slate-100 text-sm mt-2 font-medium">Try resetting your search parameters.</p>
        </div>
      )}
    </div>
  );
}

function SearchFiltersWrapper() {
  return (
    <Suspense fallback={<Skeleton className="h-24 w-full rounded-[2.5rem] bg-white/5" />}>
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
    <div className="min-h-screen bg-background">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-[10%] -right-[5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 bg-primary/10 border-y border-white/5 py-12 md:py-16">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <SearchFiltersWrapper />
            </div>
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl py-12 md:py-20 px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Filters Sidebar */}
                <aside className="hidden lg:block w-72 space-y-6 shrink-0">
                    <Card className="rounded-[2rem] border-white/10 bg-card shadow-2xl overflow-hidden">
                        <div className="p-8 space-y-10">
                            <div className="flex items-center justify-between border-b border-white/5 pb-5">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Filter By</h3>
                                <button onClick={clearFilters} className="text-[10px] font-black text-primary hover:text-white transition-colors uppercase tracking-widest">
                                    Reset
                                </button>
                            </div>
                            
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white block">Budget / Night</span>
                                    <div className="space-y-4 px-2">
                                        <Slider defaultValue={[0, 100000]} max={100000} step={5000} value={priceRange} onValueChange={setPriceRange} className="py-4" />
                                        <div className="flex justify-between text-[10px] font-bold text-white">
                                            <span>{formatPrice(priceRange[0])}</span>
                                            <span>{formatPrice(priceRange[1])}+</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white block">Guest Rating</span>
                                    <div className="space-y-4">
                                        {[5, 4, 3].map(star => (
                                            <div key={star} className="flex items-center gap-4 cursor-pointer group" onClick={() => toggleRating(star)}>
                                                <div className={cn("h-5 w-5 rounded-md border transition-all flex items-center justify-center", selectedRatings.includes(star) ? "border-primary bg-primary" : "border-white/20 group-hover:border-primary/50")}>
                                                    {selectedRatings.includes(star) && <Check className="h-3 w-3 text-background stroke-[4]" />}
                                                </div>
                                                <span className="text-xs font-bold text-white group-hover:text-primary transition-colors">{star} Tier & Above</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white block">Facilities</span>
                                    <div className="space-y-4">
                                        {['WiFi', 'Spa', 'Pool', 'Mountain View', 'Parking', 'Restaurant'].map(item => (
                                            <div key={item} className="flex items-center gap-4 cursor-pointer group" onClick={() => toggleAmenity(item)}>
                                                <div className={cn("h-5 w-5 rounded-md border transition-all flex items-center justify-center", selectedAmenities.includes(item) ? "border-primary bg-primary" : "border-white/20 group-hover:border-primary/50")}>
                                                    {selectedAmenities.includes(item) && <Check className="h-3 w-3 text-background stroke-[4]" />}
                                                </div>
                                                <span className={cn("text-xs font-bold transition-colors capitalize", selectedAmenities.includes(item) ? "text-primary" : "text-white group-hover:text-primary")}>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <div className="p-4 bg-primary/5 rounded-2xl flex items-center gap-3">
                                    <Info className="h-4 w-4 text-primary shrink-0" />
                                    <p className="text-[9px] font-bold text-white/80 leading-relaxed uppercase tracking-wider">Elite standard protocols applied.</p>
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