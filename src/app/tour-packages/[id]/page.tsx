
'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { 
  Calendar, MapPin, Clock, ArrowLeft, 
  CheckCircle2, XCircle, Info, ChevronRight, Users, Bed, Car, Star, Sparkles
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
      <div className="container mx-auto p-24 space-y-12 animate-pulse">
        <div className="h-16 w-2/3 bg-white/5 rounded-full" />
        <div className="h-[500px] w-full bg-white/5 rounded-[3rem]" />
      </div>
    );
  }

  if (!pkg) return notFound();

  const getImageUrl = (img: string) => {
    if (!img) return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200';
    let url = img.trim();
    if (url.includes('pexels.com/photo/')) {
        const parts = url.split('/');
        const idPart = parts.find(p => p.match(/^\d+$/)) || parts[parts.length - 2];
        if (idPart && idPart.match(/^\d+$/)) {
            return `https://images.pexels.com/photos/${idPart}/pexels-photo-${idPart}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
        }
    }
    return url.startsWith('http') ? url : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200';
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-background">
      {/* Sub-Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/5 py-5 sticky top-[72px] z-40">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/tour-packages" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:text-white transition-all group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-2" /> Back to Collection
          </Link>
          <Badge className="bg-primary/20 text-primary border border-primary/30 rounded-full font-black text-[9px] px-4 py-1.5 uppercase tracking-widest">
            Expedition Node: ACTIVE
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Content Column */}
          <div className="lg:col-span-2 space-y-16">
            <div className="space-y-8">
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-primary text-background rounded-full border-0 font-black uppercase tracking-[0.2em] text-[10px] px-5 py-2 shadow-xl shadow-primary/20">HIMALAYAN EXCLUSIVE</Badge>
                <Badge variant="outline" className="rounded-full border-white/20 text-white font-black text-[10px] px-5 py-2 uppercase tracking-widest">{pkg.duration}</Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.85] uppercase">{pkg.title}</h1>
              <div className="flex items-center gap-4 text-sm text-primary font-black uppercase tracking-[0.3em] border-l-4 border-primary pl-6">
                <MapPin className="h-5 w-5" />
                {pkg.destinations.join(' — ')}
              </div>
            </div>

            <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 gold-edge group">
              <Image src={getImageUrl(pkg.image)} alt={pkg.title} fill className="object-cover transition-transform duration-3000 group-hover:scale-105 opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 z-10 flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.3em]">
                <Clock className="h-4 w-4 text-primary" /> Begins: {pkg.travelDate || 'Flexible Dates'}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { icon: Users, label: 'Capacity', val: `${pkg.persons} Pax` },
                 { icon: Bed, label: 'Lodging', val: `${pkg.rooms} Units` },
                 { icon: Car, label: 'Transport', val: pkg.cabType },
                 { icon: Info, label: 'Tax Slab', val: `${pkg.gst}% Included` }
               ].map((item, i) => (
                 <div key={i} className="p-8 bg-white/5 border border-white/5 flex flex-col items-center text-center gap-3 rounded-[2rem] hover:bg-white/[0.08] transition-all">
                    <item.icon className="h-6 w-6 text-primary" />
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em]">{item.label}</p>
                        <p className="text-sm font-black text-white">{item.val}</p>
                    </div>
                 </div>
               ))}
            </div>

            <Tabs defaultValue="itinerary" className="w-full">
              <TabsList className="w-full justify-start border-b border-white/5 rounded-none h-auto p-0 bg-transparent gap-12 overflow-x-auto scrollbar-hide">
                <TabsTrigger value="itinerary" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-slate-500 data-[state=active]:text-white">The Journey</TabsTrigger>
                <TabsTrigger value="hotels" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-slate-500 data-[state=active]:text-white">Elite Stays</TabsTrigger>
                <TabsTrigger value="policies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-slate-500 data-[state=active]:text-white">Legal Node</TabsTrigger>
              </TabsList>

              <TabsContent value="itinerary" className="pt-16 space-y-20">
                  {pkg.itinerary.map((day, idx) => (
                    <div key={idx} className="relative pl-20">
                      <div className="absolute left-[33px] top-0 bottom-[-80px] w-px bg-white/10 last:bg-transparent" />
                      <div className="absolute left-0 top-0 h-[68px] w-[68px] rounded-full bg-white/5 border border-white/10 text-primary flex items-center justify-center text-xl font-black shadow-2xl backdrop-blur-md">
                        {day.day}
                      </div>
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                           <h3 className="text-3xl font-black tracking-tighter text-white uppercase">{day.title}</h3>
                           <div className="flex gap-3">
                             {day.distance && <Badge variant="secondary" className="rounded-full font-black text-[9px] uppercase tracking-widest px-4 py-1.5 bg-white/5 text-slate-300 border border-white/5"><MapPin className="h-3 w-3 mr-2 text-primary" /> {day.distance}</Badge>}
                             {day.travelTime && <Badge variant="secondary" className="rounded-full font-black text-[9px] uppercase tracking-widest px-4 py-1.5 bg-white/5 text-slate-300 border border-white/5"><Clock className="h-3 w-3 mr-2 text-primary" /> {day.travelTime}</Badge>}
                           </div>
                        </div>
                        <p className="text-lg text-slate-400 leading-relaxed font-medium max-w-3xl">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="hotels" className="pt-16 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {pkg.hotels?.map((h, i) => (
                      <Card key={i} className="rounded-[2.5rem] border-white/5 bg-white/5 shadow-2xl overflow-hidden group hover:border-primary/20 transition-all">
                        <CardHeader className="bg-white/5 p-10 border-b border-white/5">
                           <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">
                             <MapPin className="h-4 w-4" /> {h.city}
                           </div>
                           <CardTitle className="text-2xl font-black text-white">{h.hotelName}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-6">
                           <div className="flex justify-between items-center py-4 border-b border-white/5">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Tier Level</span>
                             <div className="flex items-center gap-1.5">
                                <Star className="h-3 w-3 fill-primary text-primary" />
                                <span className="text-xs font-black text-white">{h.category}</span>
                             </div>
                           </div>
                           <div className="flex justify-between items-center py-4 border-b border-white/5">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Accommodation</span>
                             <span className="text-xs font-bold text-white uppercase tracking-widest">{h.roomType}</span>
                           </div>
                           <div className="flex justify-between items-center py-4">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Boarding</span>
                             <span className="text-xs font-bold text-white uppercase tracking-widest">{h.mealPlan}</span>
                           </div>
                        </CardContent>
                      </Card>
                   ))}
                </div>
              </TabsContent>

              <TabsContent value="policies" className="pt-16 space-y-20">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-8">
                       <h4 className="text-[11px] font-black uppercase text-green-400 tracking-[0.4em] flex items-center gap-4"><CheckCircle2 className="h-6 w-6" /> Expeditions Inclusions</h4>
                       <ul className="space-y-5">
                          {pkg.inclusions.map((item, i) => <li key={i} className="text-sm font-bold text-slate-200 flex gap-4"><span className="text-primary">•</span> {item}</li>)}
                       </ul>
                    </div>
                    <div className="space-y-8">
                       <h4 className="text-[11px] font-black uppercase text-red-400 tracking-[0.4em] flex items-center gap-4"><XCircle className="h-6 w-6" /> Restricted Exclusions</h4>
                       <ul className="space-y-5">
                          {pkg.exclusions.map((item, i) => <li key={i} className="text-sm font-medium text-slate-400 flex gap-4"><span className="text-red-400">•</span> {item}</li>)}
                       </ul>
                    </div>
                 </div>
                 
                 <Separator className="bg-white/5" />
                 
                 <div className="space-y-10">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500">Legal Protocols</h4>
                    <div className="grid gap-6">
                       {[
                         { title: 'TCS & Govt Compliance', val: pkg.policies.tcs, color: 'bg-blue-500' },
                         { title: 'Cancellation Schedule', val: pkg.policies.cancellation, color: 'bg-red-500' },
                         { title: 'Financial Milestones', val: pkg.policies.payment, color: 'bg-primary' },
                         { title: 'Terms of Sovereignty', val: pkg.policies.terms, color: 'bg-amber-500' }
                       ].map((p, i) => (
                         <div key={i} className="bg-white/5 p-10 border-l border-white/10 rounded-2xl relative overflow-hidden group hover:bg-white/[0.08] transition-all">
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${p.color}`} />
                            <p className="text-[10px] font-black uppercase text-primary mb-4 tracking-[0.3em]">{p.title}</p>
                            <p className="text-base font-medium text-slate-400 leading-relaxed">{p.val}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Pricing Sidebar */}
          <div className="space-y-8">
            <Card className="rounded-[3rem] border-white/10 bg-white/5 backdrop-blur-3xl sticky top-[160px] shadow-2xl overflow-hidden luxury-shadow">
              <CardHeader className="bg-primary text-background p-10 space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Elite Access</span>
                    <Badge className="bg-background text-primary border-0 rounded-full font-black text-[10px] px-4 py-1 tracking-widest">LIMITED</Badge>
                 </div>
                 <CardTitle className="text-5xl font-black tracking-tighter">
                   ₹{pkg.totalCost.toLocaleString('en-IN')}
                 </CardTitle>
                 <p className="text-[9px] font-bold opacity-60 uppercase tracking-[0.3em]">Net cost incl. {pkg.gst}% GST + Private transport</p>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                 <div className="space-y-8">
                    <div className="flex items-center gap-6 group">
                       <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg transition-all group-hover:bg-primary group-hover:text-background shadow-xl shadow-primary/5">A</div>
                       <div className="space-y-0.5">
                          <p className="text-[11px] font-black uppercase text-white tracking-widest">Instant Booking</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cloud Confirmation</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6 group">
                       <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-lg transition-all group-hover:bg-white group-hover:text-background shadow-xl">B</div>
                       <div className="space-y-0.5">
                          <p className="text-[11px] font-black uppercase text-white tracking-widest">Premium Safety</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Satellite Monitored</p>
                       </div>
                    </div>
                 </div>

                 <Separator className="bg-white/5" />

                 <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-3 text-primary font-black uppercase text-[11px] tracking-widest">
                      <Sparkles className="h-4 w-4" /> Concierge Support
                    </div>
                    <p className="text-xs font-medium text-slate-300 leading-relaxed">
                      Need custom upgrades or extra travelers? Reach our Himalayan Elite Desk: <span className="font-black text-primary block mt-2 text-sm">nsati09@gmail.com</span>
                    </p>
                 </div>

                 <Button className="w-full h-20 rounded-full font-black text-lg bg-primary hover:bg-primary/90 text-background transition-all shadow-2xl shadow-primary/20 group active:scale-95">
                   Start Expedition <ChevronRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                 </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
