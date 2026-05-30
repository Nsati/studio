
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
      {/* Dynamic Sub-Header */}
      <div className="bg-[#f5f5f5] py-4 border-b border-black/5">
        <div className="container mx-auto px-4">
          <Link href="/tour-packages" className="flex items-center gap-2 text-xs text-[#006ce4] font-black uppercase tracking-widest hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to itineraries
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-10">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-700 text-white rounded-none border-0 font-black uppercase tracking-widest text-[9px] px-3 py-1">UTTARAKHAND EXCLUSIVE</Badge>
                <Badge variant="outline" className="rounded-none border-black/20 font-black text-[9px] px-3 py-1">{pkg.duration}</Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#1a1a1a] leading-[0.9]">{pkg.title}</h1>
              <div className="flex items-center gap-4 text-sm text-[#006ce4] font-black underline decoration-2 underline-offset-8 uppercase tracking-widest">
                <MapPin className="h-4 w-4 text-[#003580]" />
                {pkg.destinations.join(' — ')}
              </div>
            </div>

            <div className="relative aspect-video rounded-none overflow-hidden shadow-2xl group">
              <Image src={getImageUrl(pkg.image)} alt={pkg.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 text-white text-[10px] font-black uppercase tracking-widest">
                <Clock className="h-3 w-3 text-accent" /> Starts from: {pkg.travelDate || 'Flexible Dates'}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
               {[
                 { icon: Users, label: 'Capacity', val: `${pkg.persons} Pax` },
                 { icon: Bed, label: 'Lodging', val: `${pkg.rooms} Rooms` },
                 { icon: Car, label: 'Vehicle', val: pkg.cabType },
                 { icon: Info, label: 'GST Slab', val: `${pkg.gst}% Included` }
               ].map((item, i) => (
                 <div key={i} className="p-6 bg-[#f0f6ff] border border-black/5 flex flex-col items-center text-center gap-2">
                    <item.icon className="h-5 w-5 text-[#003580]" />
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{item.label}</span>
                    <span className="text-xs font-black text-[#1a1a1a]">{item.val}</span>
                 </div>
               ))}
            </div>

            <Tabs defaultValue="itinerary" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-10">
                <TabsTrigger value="itinerary" className="rounded-none border-b-4 border-transparent data-[state=active]:border-[#003580] data-[state=active]:bg-transparent px-0 py-6 font-black uppercase text-[10px] tracking-[0.2em]">Journey Timeline</TabsTrigger>
                <TabsTrigger value="hotels" className="rounded-none border-b-4 border-transparent data-[state=active]:border-[#003580] data-[state=active]:bg-transparent px-0 py-6 font-black uppercase text-[10px] tracking-[0.2em]">Verified Stays</TabsTrigger>
                <TabsTrigger value="policies" className="rounded-none border-b-4 border-transparent data-[state=active]:border-[#003580] data-[state=active]:bg-transparent px-0 py-6 font-black uppercase text-[10px] tracking-[0.2em]">Policies & Legal</TabsTrigger>
              </TabsList>

              <TabsContent value="itinerary" className="pt-12">
                <div className="space-y-16">
                  {pkg.itinerary.map((day, idx) => (
                    <div key={idx} className="relative pl-12">
                      <div className="absolute left-0 top-0 bottom-[-64px] w-0.5 bg-[#003580]/10 ml-[13px] last:bg-transparent" />
                      <div className="absolute left-0 top-0 h-7 w-7 rounded-full bg-[#003580] text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                        {day.day}
                      </div>
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <h3 className="text-2xl font-black tracking-tight">{day.title}</h3>
                           <div className="flex gap-2">
                             {day.distance && <Badge variant="secondary" className="rounded-none font-black text-[9px] uppercase tracking-widest px-3 py-1 bg-white border border-black/5"><MapPin className="h-3 w-3 mr-2 text-primary" /> {day.distance}</Badge>}
                             {day.travelTime && <Badge variant="secondary" className="rounded-none font-black text-[9px] uppercase tracking-widest px-3 py-1 bg-white border border-black/5"><Clock className="h-3 w-3 mr-2 text-primary" /> {day.travelTime}</Badge>}
                           </div>
                        </div>
                        <p className="text-base text-muted-foreground leading-relaxed font-medium">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="hotels" className="pt-12 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {pkg.hotels?.map((h, i) => (
                      <Card key={i} className="rounded-none border-black/5 shadow-apple-deep overflow-hidden">
                        <CardHeader className="bg-muted/30 p-6 border-b">
                           <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                             <MapPin className="h-3.5 w-3.5" /> {h.city}
                           </div>
                           <CardTitle className="text-lg font-black mt-2">{h.hotelName}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                           <div className="flex justify-between items-center py-2 border-b border-black/5">
                             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Star Rating</span>
                             <Badge className="bg-[#febb02] text-black font-black text-[9px] rounded-none px-2 py-0.5">{h.category}</Badge>
                           </div>
                           <div className="flex justify-between items-center py-2 border-b border-black/5">
                             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Accommodation</span>
                             <span className="text-xs font-bold">{h.roomType}</span>
                           </div>
                           <div className="flex justify-between items-center py-2">
                             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Boarding</span>
                             <span className="text-xs font-bold">{h.mealPlan}</span>
                           </div>
                        </CardContent>
                      </Card>
                   ))}
                </div>
              </TabsContent>

              <TabsContent value="policies" className="pt-12 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                       <h4 className="text-[11px] font-black uppercase text-green-700 tracking-[0.3em] flex items-center gap-3"><CheckCircle2 className="h-5 w-5" /> Inclusions</h4>
                       <ul className="space-y-3">
                          {pkg.inclusions.map((item, i) => <li key={i} className="text-sm font-bold text-[#1a1a1a] flex gap-3"><span className="text-green-700">•</span> {item}</li>)}
                       </ul>
                    </div>
                    <div className="space-y-6">
                       <h4 className="text-[11px] font-black uppercase text-red-700 tracking-[0.3em] flex items-center gap-3"><XCircle className="h-5 w-5" /> Exclusions</h4>
                       <ul className="space-y-3">
                          {pkg.exclusions.map((item, i) => <li key={i} className="text-sm font-medium text-muted-foreground flex gap-3"><span className="text-red-700">•</span> {item}</li>)}
                       </ul>
                    </div>
                 </div>
                 
                 <Separator />
                 
                 <div className="space-y-8">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Detailed Policies</h4>
                    <div className="grid gap-6">
                       {[
                         { title: 'TCS & Taxes (Govt)', val: pkg.policies.tcs, color: 'border-blue-500' },
                         { title: 'Cancellation Schedule', val: pkg.policies.cancellation, color: 'border-red-500' },
                         { title: 'Payment Milestones', val: pkg.policies.payment, color: 'border-[#003580]' },
                         { title: 'Full Terms & Conditions', val: pkg.policies.terms, color: 'border-amber-500' }
                       ].map((p, i) => (
                         <div key={i} className={`bg-[#f9f9f9] p-8 border-l-8 ${p.color} shadow-sm`}>
                            <p className="text-[10px] font-black uppercase text-slate-900 mb-3 tracking-widest">{p.title}</p>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed">{p.val}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Pricing Sticky Sidebar */}
          <div className="space-y-6">
            <Card className="rounded-none border-border sticky top-24 shadow-2xl overflow-hidden">
              <CardHeader className="bg-[#003580] text-white p-8 space-y-2">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Complete Package</span>
                    <Badge className="bg-[#febb02] text-[#003580] border-0 rounded-none font-black text-[10px] px-3 py-1">BEST VALUE</Badge>
                 </div>
                 <CardTitle className="text-4xl font-black tracking-tighter">
                   ₹{pkg.totalCost.toLocaleString('en-IN')}
                 </CardTitle>
                 <p className="text-[9px] font-bold opacity-60 uppercase tracking-[0.2em]">Net Cost incl. {pkg.gst}% GST + Transport</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-700 font-black text-sm shadow-inner">A</div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-[#1a1a1a] tracking-widest">Instant Quotation</p>
                          <p className="text-[10px] font-bold text-muted-foreground">Certified Rate Sheet</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-black text-sm shadow-inner">B</div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-[#1a1a1a] tracking-widest">Himalayan Verified</p>
                          <p className="text-[10px] font-bold text-muted-foreground">Pahadi Hospitality Ready</p>
                       </div>
                    </div>
                 </div>

                 <Separator />

                 <div className="p-6 bg-amber-50 border border-amber-100 space-y-3">
                    <div className="flex items-center gap-2 text-amber-800 font-black uppercase text-[10px] tracking-widest">
                      <Info className="h-3.5 w-3.5" /> Booking Support
                    </div>
                    <p className="text-[11px] font-medium text-amber-900/80 leading-relaxed">
                      Customization for extra PAX or premium car upgrades? Reach our Himalayan Concierge at: <span className="font-black text-[#003580]">nsati09@gmail.com</span>
                    </p>
                 </div>

                 <Button className="w-full h-16 rounded-none font-black text-base bg-[#006ce4] hover:bg-[#005bb8] transition-all shadow-xl active:scale-95 group">
                   Reserve Experience <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                 </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
