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
import { SlidersHorizontal, MapPin, Star, Check, Compass } from 'lucide-react';
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
      // Price Filter
      const price = hotel.minPrice || 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;

      // Rating Filter
      if (filters.ratings.length > 0 && !filters.ratings.includes(Math.floor(hotel.rating))) return false;

      // Amenities Filter
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
             <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="rounded-[2.5rem] overflow-hidden border-black/5 aspect-[4/5]">
                        <Skeleton className="h-full w-full" />
                    </Card>
                ))}
             </div>
        </div>
      )
  }

  return (
    <div className="flex-1">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#2C5F8A]">
                    <Compass className="h-4 w-4" /> Operational Archive: {city && city !== 'All' ? city : 'Northern Grid'}
                </div>
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">
                    {city && city !== 'All' ? city : 'Uttarakhand'}
                </h1>
                <p className="text-slate-500 font-bold text-lg">
                    {filteredHotels.length} elite properties audited for the Harrier Protocol.
                </p>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-full border border-black/5">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mr-2">Sort Protocol</div>
                <select className="bg-transparent font-black text-[10px] uppercase tracking-widest focus:outline-none cursor-pointer">
                    <option>Recommended</option>
                    <option>Price: Ascending</option>
                    <option>Safety Peak</option>
                </select>
            </div>
        </div>

      {filteredHotels.length > 0 ? (
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
          {filteredHotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 rounded-[3.5rem] border-2 border-dashed border-black/5 bg-slate-50 text-center px-10">
          <SlidersHorizontal className="h-16 w-16 text-slate-200 mb-6" />
          <h3 className="text-2xl font-black tracking-tight text-slate-900">Zero Nodes Detected</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">No properties matched your current filter protocol. Try resetting your search parameters.</p>
        </div>
      )}
    </div>
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
        <div className="bg-slate-900 border-b border-white/5 py-24">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <SearchFilters />
            </div>
        </div>

        <div className="container mx-auto max-w-7xl py-24 px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-20">
                {/* Filters Sidebar */}
                <aside className="hidden lg:block w-72 space-y-12 shrink-0">
                    <div className="space-y-8">
                        <div className="flex items-center justify-between border-b border-black/5 pb-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Filter Protocol</h3>
                            <button 
                                onClick={clearFilters}
                                className="text-[9px] font-black text-[#2C5F8A] hover:underline uppercase tracking-widest"
                            >
                                Reset All
                            </button>
                        </div>
                        
                        <div className="space-y-12">
                            {/* Price Range */}
                            <div className="space-y-8">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Expedition Budget</span>
                                <div className="space-y-6 px-2">
                                    <Slider 
                                        defaultValue={[0, 100000]} 
                                        max={100000} 
                                        step={5000} 
                                        value={priceRange}
                                        onValueChange={setPriceRange}
                                        className="py-4"
                                    />
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-900">
                                        <span>{formatPrice(priceRange[0])}</span>
                                        <span>{formatPrice(priceRange[1])}+</span>
                                    </div>
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div className="space-y-6">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Audit Tier</span>
                                <div className="space-y-4">
                                    {[5, 4, 3].map(star => (
                                        <div 
                                            key={star} 
                                            className="flex items-center gap-4 cursor-pointer group"
                                            onClick={() => toggleRating(star)}
                                        >
                                            <div className={cn(
                                                "h-6 w-6 rounded-lg border-2 transition-all flex items-center justify-center",
                                                selectedRatings.includes(star) ? "border-slate-900 bg-slate-900" : "border-black/5 group-hover:border-slate-900"
                                            )}>
                                                {selectedRatings.includes(star) && <Check className="h-3.5 w-3.5 text-white stroke-[4]" />}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-black text-slate-900">{star} Tier Node</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="space-y-6">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">On-Site Logistics</span>
                                <div className="space-y-4">
                                    {['WiFi', 'Spa', 'Pool', 'Mountain-View', 'Parking', 'Restaurant'].map(item => (
                                        <div 
                                            key={item} 
                                            className="flex items-center gap-4 cursor-pointer group"
                                            onClick={() => toggleAmenity(item)}
                                        >
                                            <div className={cn(
                                                "h-6 w-6 rounded-lg border-2 transition-all flex items-center justify-center",
                                                selectedAmenities.includes(item) ? "border-slate-900 bg-slate-900" : "border-black/5 group-hover:border-slate-900"
                                            )}>
                                                {selectedAmenities.includes(item) && <Check className="h-3.5 w-3.5 text-white stroke-[4]" />}
                                            </div>
                                            <span className={cn(
                                                "text-sm font-bold transition-colors uppercase tracking-widest text-[11px]",
                                                selectedAmenities.includes(item) ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900"
                                            )}>{item.replace('-', ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <Suspense fallback={<Loading />}>
                    <SearchResults filters={{ priceRange, ratings: selectedRatings, amenities: selectedAmenities }} />
                </Suspense>
            </div>
        </div>
    </div>
  );
}
