'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { 
  Calendar, MapPin, IndianRupee, Clock, ArrowLeft, 
  CheckCircle2, XCircle, Info, ChevronRight, Users, Bed, Car, Hotel as HotelIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TourPackageDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();

  const packageRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'tourPackages', id);
  }, [firestore, id]);

  const { data: pkg, isLoading } = useDoc<TourPackage>(packageRef);

  if (isLoading) {
    return (
      <div className="container mx-auto p-12 space-y-8 animate-pulse">
        <div className="h-12 w-2/3 bg-muted rounded" />
        <div className="h-[400px] w-full bg-muted rounded" />
      </div>
    );
  }

  if (!pkg) return notFound();

  const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return PlaceHolderImages.find((p) => p.id === img)?.imageUrl || '';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#f5f5f5] py-4 border-b">
        <div className="container mx-auto px-4">
          <Link href="/tour-packages" className="flex items-center gap-2 text-sm text-[#006ce4] font-bold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to all packages
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-700 text-white rounded-none border-0 font-bold uppercase tracking-widest text-[10px]">Uttarakhand Special</Badge>
                <Badge variant="outline" className="rounded-none border-black/10 font-bold text-[10px]">{pkg.duration}</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#1a1a1a]">{pkg.title}</h1>
              <div className="flex items-center gap-3 text-sm text-[#006ce4] font-bold underline decoration-2 underline-offset-4">
                <MapPin className="h-4 w-4 text-[#003580]" />
                {pkg.destinations.join(' — ')}
              </div>
            </div>

            <div className="relative aspect-video rounded-sm overflow-hidden shadow-2xl">
              <Image src={getImageUrl(pkg.image)} alt={pkg.title} fill className="object-cover" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { icon: Clock, label: 'Duration', val: pkg.duration },
                 { icon: Users, label: 'Capacity', val: `${pkg.persons} Pax` },
                 { icon: Bed, label: 'Stays', val: `${pkg.rooms} Rooms` },
                 { icon: Car, label: 'Transport', val: pkg.cabType }
               ].map((item, i) => (
                 <div key={i} className="p-4 bg-[#f0f6ff] border border-black/5 flex flex-col items-center text-center gap-1">
                    <item.icon className="h-5 w-5 text-[#003580]" />
                    <span className="text-[10px] font-black uppercase text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-bold">{item.val}</span>
                 </div>
               ))}
            </div>

            <Tabs defaultValue="itinerary" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8">
                <TabsTrigger value="itinerary" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#003580] data-[state=active]:bg-transparent px-0 py-4 font-black uppercase text-[11px] tracking-widest">Day-wise Plan</TabsTrigger>
                <TabsTrigger value="hotels" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#003580] data-[state=active]:bg-transparent px-0 py-4 font-black uppercase text-[11px] tracking-widest">Hotel Info</TabsTrigger>
                <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#003580] data-[state=active]:bg-transparent px-0 py-4 font-black uppercase text-[11px] tracking-widest">Exclusions & More</TabsTrigger>
              </TabsList>

              <TabsContent value="itinerary" className="pt-8">
                <div className="space-y-12">
                  {pkg.itinerary.map((day, idx) => (
                    <div key={idx} className="relative pl-10">
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-[#003580]/20 ml-[11px]" />
                      <div className="absolute left-0 top-0 h-6 w-6 rounded-full bg-[#003580] text-white flex items-center justify-center text-[10px] font-black">
                        {day.day}
                      </div>
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <h3 className="text-xl font-black">{day.title}</h3>
                           <div className="flex gap-4">
                             {day.distance && <Badge variant="secondary" className="rounded-none font-bold text-[10px]"><MapPin className="h-3 w-3 mr-1" /> {day.distance} km</Badge>}
                             {day.travelTime && <Badge variant="secondary" className="rounded-none font-bold text-[10px]"><Clock className="h-3 w-3 mr-1" /> {day.travelTime}</Badge>}
                           </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="hotels" className="pt-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {pkg.hotels?.map((h, i) => (
                      <Card key={i} className="rounded-none border-black/5 shadow-sm">
                        <CardHeader className="bg-muted/30 p-4">
                           <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase">
                             <MapPin className="h-3 w-3" /> {h.city}
                           </div>
                           <CardTitle className="text-base font-bold">{h.hotelName}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                           <div className="flex justify-between text-[11px] font-bold">
                             <span className="text-muted-foreground uppercase">Category</span>
                             <span>{h.category}</span>
                           </div>
                           <div className="flex justify-between text-[11px] font-bold">
                             <span className="text-muted-foreground uppercase">Meal Plan</span>
                             <span>{h.mealPlan}</span>
                           </div>
                        </CardContent>
                      </Card>
                   ))}
                </div>
              </TabsContent>

              <TabsContent value="details" className="pt-8 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <h4 className="text-xs font-black uppercase text-green-700 tracking-widest flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Trip Inclusions</h4>
                       <ul className="space-y-2">
                          {pkg.inclusions.map((item, i) => <li key={i} className="text-sm font-bold text-[#1a1a1a] flex gap-2"><span>•</span> {item}</li>)}
                       </ul>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-xs font-black uppercase text-red-700 tracking-widest flex items-center gap-2"><XCircle className="h-4 w-4" /> Exclusions</h4>
                       <ul className="space-y-2">
                          {pkg.exclusions.map((item, i) => <li key={i} className="text-sm font-medium text-muted-foreground flex gap-2"><span>•</span> {item}</li>)}
                       </ul>
                    </div>
                 </div>
                 <Separator />
                 <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest">Important Policies</h4>
                    <div className="grid gap-4">
                       {[
                         { title: 'TCS & Taxes', val: pkg.policies.tcs },
                         { title: 'Cancellation', val: pkg.policies.cancellation },
                         { title: 'Payment', val: pkg.policies.payment }
                       ].map((p, i) => (
                         <div key={i} className="bg-[#f9f9f9] p-4 border-l-4 border-[#003580]">
                            <p className="text-[10px] font-black uppercase text-[#003580] mb-1">{p.title}</p>
                            <p className="text-sm font-medium">{p.val}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Pricing Sidebar */}
          <div className="space-y-6">
            <Card className="rounded-none border-border sticky top-24 shadow-2xl">
              <CardHeader className="bg-[#003580] text-white p-6">
                 <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Package Cost</span>
                    <Badge className="bg-[#febb02] text-[#003580] border-0 rounded-none font-black text-[9px]">BEST VALUE</Badge>
                 </div>
                 <CardTitle className="text-3xl font-black">
                   ₹{pkg.totalCost.toLocaleString()}
                 </CardTitle>
                 <p className="text-[10px] font-bold opacity-60 uppercase">Included {pkg.gst}% GST + Cab + Stays</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-700 font-black text-xs">A</div>
                       <div>
                          <p className="text-xs font-black uppercase text-[#1a1a1a]">Instant Booking</p>
                          <p className="text-[10px] font-bold text-muted-foreground">Verification in 24h</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-black text-xs">B</div>
                       <div>
                          <p className="text-xs font-black uppercase text-[#1a1a1a]">Verified Hosts</p>
                          <p className="text-[10px] font-bold text-muted-foreground">Certified by Tripzy</p>
                       </div>
                    </div>
                 </div>

                 <Separator />

                 <div className="p-4 bg-amber-50 border border-amber-100 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 font-black uppercase text-[10px]">
                      <Info className="h-3 w-3" /> Booking Assistance
                    </div>
                    <p className="text-[11px] font-medium text-amber-900/80 leading-relaxed">
                      Need a customized plan for more pax? Contact our destination experts at nsati09@gmail.com
                    </p>
                 </div>

                 <Button className="w-full h-14 rounded-none font-black text-base bg-[#006ce4] hover:bg-[#005bb8] transition-all">
                   Book This Experience <ChevronRight className="ml-2 h-5 w-5" />
                 </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}