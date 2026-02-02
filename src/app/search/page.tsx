'use client';
import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { HotelCard } from '@/components/hotel/HotelCard';
import Loading from './loading';
import { SearchFilters } from './SearchFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, MapPin, Star, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

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
                    {filteredHotels.length} luxury properties matched your vibe.
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

      {filteredHotels.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredHotels.map((hotel) => (
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
  const [priceRange, setPriceRange] = useState([0, 50000]);
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
    setPriceRange([0, 50000]);
    setSelectedRatings([]);
    setSelectedAmenities([]);
  };

  return (
    <div className="min-h-screen bg-background">
        <div className="bg-white border-b border-black/5 py-10">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <SearchFilters />
            </div>
        </div>

        <div className="container mx-auto max-w-7xl py-12 px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-16">
                {/* Filters Sidebar */}
                <aside className="hidden lg:block w-72 space-y-10 shrink-0">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-widest">Filters</h3>
                            <button 
                                onClick={clearFilters}
                                className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                            >
                                Clear All
                            </button>
                        </div>
                        
                        <div className="space-y-10">
                            {/* Price Range */}
                            <div className="space-y-6">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price Range</Label>
                                <div className="space-y-4 px-2">
                                    <Slider 
                                        defaultValue={[0, 50000]} 
                                        max={50000} 
                                        step={1000} 
                                        value={priceRange}
                                        onValueChange={setPriceRange}
                                        className="py-4"
                                    />
                                    <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
                                        <span>{formatPrice(priceRange[0])}</span>
                                        <span>{formatPrice(priceRange[1])}+</span>
                                    </div>
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Star Rating</Label>
                                <div className="space-y-3">
                                    {[5, 4, 3].map(star => (
                                        <div 
                                            key={star} 
                                            className="flex items-center gap-3 cursor-pointer group"
                                            onClick={() => toggleRating(star)}
                                        >
                                            <div className={cn(
                                                "h-5 w-5 rounded border-2 transition-all flex items-center justify-center",
                                                selectedRatings.includes(star) ? "border-primary bg-primary" : "border-black/10 group-hover:border-primary"
                                            )}>
                                                {selectedRatings.includes(star) && <Check className="h-3 w-3 text-white stroke-[4]" />}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {Array.from({length: star}).map((_, i) => <Star key={i} className="h-3 w-3 fill-accent text-accent" />)}
                                                <span className="text-sm font-bold ml-1">{star} Stars</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amenities</Label>
                                <div className="space-y-3">
                                    {['WiFi', 'Spa', 'Pool', 'Mountain-View', 'Parking', 'Restaurant'].map(item => (
                                        <div 
                                            key={item} 
                                            className="flex items-center gap-3 cursor-pointer group"
                                            onClick={() => toggleAmenity(item)}
                                        >
                                            <div className={cn(
                                                "h-5 w-5 rounded border-2 transition-all flex items-center justify-center",
                                                selectedAmenities.includes(item) ? "border-primary bg-primary" : "border-black/10 group-hover:border-primary"
                                            )}>
                                                {selectedAmenities.includes(item) && <Check className="h-3 w-3 text-white stroke-[4]" />}
                                            </div>
                                            <span className={cn(
                                                "text-sm font-bold transition-colors",
                                                selectedAmenities.includes(item) ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
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

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={cn("block", className)}>{children}</span>
}
