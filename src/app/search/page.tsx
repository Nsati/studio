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
             <div className="grid grid-cols-1 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="rounded-sm overflow-hidden border-black/5 h-[240px]">
                        <Skeleton className="h-full w-full" />
                    </Card>
                ))}
             </div>
        </div>
      )
  }

  return (
    <div className="flex-1">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#003580]">
                    <Compass className="h-4 w-4" /> Operational Archive: {city && city !== 'All' ? city : 'Northern Grid'}
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">
                    {city && city !== 'All' ? city : 'Uttarakhand'}
                </h1>
                <p className="text-slate-500 font-bold text-sm">
                    {filteredHotels.length} elite properties found in your target zone.
                </p>
            </div>
            
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-sm border border-black/10">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mr-2">Sort Protocol</div>
                <select className="bg-transparent font-black text-[9px] uppercase tracking-widest focus:outline-none cursor-pointer">
                    <option>Recommended</option>
                    <option>Price: Low to High</option>
                    <option>Rating: Safety Peak</option>
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
        <div className="flex flex-col items-center justify-center h-96 rounded-sm border-2 border-dashed border-black/5 bg-slate-50 text-center px-10">
          <SlidersHorizontal className="h-16 w-16 text-slate-200 mb-6" />
          <h3 className="text-xl font-black tracking-tight text-slate-900">Zero Nodes Detected</h3>
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
    <div className="min-h-screen bg-[#f5f5f5]">
        <div className="bg-[#003580] py-12">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <SearchFilters />
            </div>
        </div>

        <div className="container mx-auto max-w-7xl py-12 px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <aside className="hidden lg:block w-72 space-y-6 shrink-0">
                    <Card className="rounded-sm border-black/10 shadow-none">
                        <div className="p-6 space-y-8">
                            <div className="flex items-center justify-between border-b border-black/5 pb-4">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">Filter By:</h3>
                                <button 
                                    onClick={clearFilters}
                                    className="text-[10px] font-black text-[#006ce4] hover:underline uppercase tracking-widest"
                                >
                                    Reset
                                </button>
                            </div>
                            
                            <div className="space-y-10">
                                {/* Price Range */}
                                <div className="space-y-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">Your budget (per night)</span>
                                    <div className="space-y-4 px-2">
                                        <Slider 
                                            defaultValue={[0, 100000]} 
                                            max={100000} 
                                            step={5000} 
                                            value={priceRange}
                                            onValueChange={setPriceRange}
                                            className="py-4"
                                        />
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                                            <span>{formatPrice(priceRange[0])}</span>
                                            <span>{formatPrice(priceRange[1])}+</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Star Rating */}
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">Guest Rating</span>
                                    <div className="space-y-3">
                                        {[5, 4, 3].map(star => (
                                            <div 
                                                key={star} 
                                                className="flex items-center gap-3 cursor-pointer group"
                                                onClick={() => toggleRating(star)}
                                            >
                                                <div className={cn(
                                                    "h-5 w-5 rounded-sm border transition-all flex items-center justify-center",
                                                    selectedRatings.includes(star) ? "border-[#003580] bg-[#003580]" : "border-black/20 group-hover:border-[#003580]"
                                                )}>
                                                    {selectedRatings.includes(star) && <Check className="h-3.5 w-3.5 text-white stroke-[4]" />}
                                                </div>
                                                <span className="text-xs font-bold text-[#1a1a1a]">{star} Tier & Above</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">Facilities</span>
                                    <div className="space-y-3">
                                        {['WiFi', 'Spa', 'Pool', 'Mountain-View', 'Parking', 'Restaurant'].map(item => (
                                            <div 
                                                key={item} 
                                                className="flex items-center gap-3 cursor-pointer group"
                                                onClick={() => toggleAmenity(item)}
                                            >
                                                <div className={cn(
                                                    "h-5 w-5 rounded-sm border transition-all flex items-center justify-center",
                                                    selectedAmenities.includes(item) ? "border-[#003580] bg-[#003580]" : "border-black/20 group-hover:border-[#003580]"
                                                )}>
                                                    {selectedAmenities.includes(item) && <Check className="h-3.5 w-3.5 text-white stroke-[4]" />}
                                                </div>
                                                <span className={cn(
                                                    "text-xs font-bold transition-colors capitalize",
                                                    selectedAmenities.includes(item) ? "text-[#1a1a1a]" : "text-slate-600 group-hover:text-[#1a1a1a]"
                                                )}>{item.replace('-', ' ')}</span>
                                            </div>
                                        ))}
                                    </div>
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
