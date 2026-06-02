
'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { 
  Calendar, MapPin, IndianRupee, Clock, ArrowLeft, 
  CheckCircle2, XCircle, Info, ChevronRight, Users, Bed, Car, Star, ShieldCheck, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

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
        <div className="h-12 w-2/3 bg-white/5 rounded-full" />
        <div className="h-[500px] w-full bg-white/5 rounded-[3rem]" />
      </div>
    );
  }

  if (!pkg) return notFound();

  const getImageUrl = (img: string) => {
    if (!img) return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200';
    return img.startsWith('http') ? img : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200';
  };

  return (
    <div className="min-h-screen bg-background text-white pb-32">
      {/* Navigation Sub-Header */}
      <div className="bg-white/5 border-b border-white/5 py-6 sticky top-[72px] z-40 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <Link href="/tour-packages" className="inline-flex items-center gap-3 text-[10px] text-primary font-black uppercase tracking-[0.4em] hover:text-white transition-all group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-2" /> Back to Collection
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-primary text-background rounded-full border-0 font-black uppercase tracking-[0.2em] text-[9px] px-5 py-1.5">UTTARAKHAND EXCLUSIVE</Badge>
                <Badge variant="outline" className="rounded-full border-white/20 text-white font-black text-[9px] px-5 py-1.5 uppercase tracking-widest">{pkg.duration}</Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">{pkg.title}</h1>
              <div className="flex items-center gap-4 text-sm text-primary font-black underline decoration-2 underline-offset-8 uppercase tracking-[0.2em]">
                <MapPin className="h-5 w-5" />
                {pkg.destinations.join(' — ')}
              </div>
            </div>

            <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
              <Image src={getImageUrl(pkg.image)} alt={pkg.title} fill className="object-cover" priority />
              <div className="absolute bottom-10 left-10 z-10 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
                <Clock className="h-4 w-4 text-primary" /> Tentative Start: {pkg.travelDate || 'Flexible Window'}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { icon: Users, label: 'Capacity', val: `${pkg.persons} Pax` },
                 { icon: Bed, label: 'Lodging', val: `${pkg.rooms} Units` },
                 { icon: Car, label: 'Fleet', val: pkg.cabType },
                 { icon: Info, label: 'Tax Slab', val: `${pkg.gst}% GST` }
               ].map((item, i) => (
                 <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-3xl flex flex-col items-center text-center gap-3 hover:bg-white/[0.08] transition-all group">
                    <item.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    <div className="space-y-1">
                        <span className="block text-[8px] font-black uppercase text-slate-500 tracking-[0.3em]">{item.label}</span>
                        <span className="block text-xs font-black text-white">{item.val}</span>
                    </div>
                 </div>
               ))}
            </div>

            <Tabs defaultValue="itinerary" className="w-full">
              <TabsList className="w-full justify-start border-b border-white/10 rounded-none h-auto p-0 bg-transparent gap-10">
                <TabsTrigger value="itinerary" className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-slate-500 data-[state=active]:text-primary">Journey Roadmap</TabsTrigger>
                <TabsTrigger value="hotels" className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-slate-500 data-[state=active]:text-primary">Stays & Nodes</TabsTrigger>
                <TabsTrigger value="policies" className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-slate-500 data-[state=active]:text-primary">Compliance</TabsTrigger>
              </TabsList>

              <TabsContent value="itinerary" className="pt-16">
                <div className="space-y-20">
                  {pkg.itinerary.map((day, idx) => (
                    <div key={idx} className="relative pl-20">
                      <div className="absolute left-[34px] top-10 bottom-[-80px] w-px bg-white/10 last:bg-transparent" />
                      <div className="absolute left-0 top-0 h-[70px] w-[70px] rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-primary shadow-2xl">
                        {idx + 1}
                      </div>
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                           <h3 className="text-3xl font-black tracking-tight uppercase">{day.title}</h3>
                           <div className="flex flex-wrap gap-2">
                             {day.distance && <Badge className="rounded-full font-black text-[9px] uppercase tracking-widest px-5 py-2 bg-white/5 border border-white/5 text-primary"><MapPin className="h-3 w-3 mr-2" /> {day.distance}</Badge>}
                             {day.travelTime && <Badge className="rounded-full font-black text-[9px] uppercase tracking-widest px-5 py-2 bg-white/5 border border-white/5 text-primary"><Clock className="h-3 w-3 mr-2" /> {day.travelTime}</Badge>}
                           </div>
                        </div>
                        <p className="text-lg text-slate-400 leading-relaxed font-medium font-sans">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="hotels" className="pt-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {pkg.hotels?.map((h, i) => (
                      <Card key={i} className="rounded-[2.5rem] border-white/5 bg-white/5 overflow-hidden luxury-shadow">
                        <CardHeader className="bg-white/5 p-8 border-b border-white/5">
                           <div className="flex items-center gap-3 text-[9px] font-black text-primary uppercase tracking-[0.4em]">
                             <MapPin className="h-4 w-4" /> {h.city}
                           </div>
                           <CardTitle className="text-2xl font-black mt-3 uppercase tracking-tighter">{h.hotelName}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                           <div className="flex justify-between items-center py-3 border-b border-white/5">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Star Classification</span>
                             <Badge className="bg-primary text-background font-black text-[10px] rounded-full px-4 py-1">{h.category}</Badge>
                           </div>
                           <div className="flex justify-between items-center py-3 border-b border-white/5">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Configuration</span>
                             <span className="text-sm font-bold text-white">{h.roomType}</span>
                           </div>
                           <div className="flex justify-between items-center pt-3">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Meal Grid</span>
                             <span className="text-sm font-bold text-white">{h.mealPlan}</span>
                           </div>
                        </CardContent>
                      </Card>
                   ))}
                </div>
              </TabsContent>

              <TabsContent value="policies" className="pt-16 space-y-16">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <h4 className="text-xs font-black uppercase text-primary tracking-[0.4em] flex items-center gap-4"><CheckCircle2 className="h-6 w-6" /> Inclusions</h4>
                       <ul className="space-y-4">
                          {pkg.inclusions.map((item, i) => <li key={i} className="text-sm font-bold text-white flex gap-4"><Sparkles className="h-4 w-4 text-primary shrink-0" /> {item}</li>)}
                       </ul>
                    </div>
                    <div className="space-y-8">
                       <h4 className="text-xs font-black uppercase text-red-500 tracking-[0.4em] flex items-center gap-4"><XCircle className="h-6 w-6" /> Exclusions</h4>
                       <ul className="space-y-4">
                          {pkg.exclusions.map((item, i) => <li key={i} className="text-sm font-medium text-slate-400 flex gap-4"><span className="text-red-500 font-black">•</span> {item}</li>)}
                       </ul>
                    </div>
                 </div>
                 
                 <Separator className="bg-white/10" />
                 
                 <div className="space-y-10">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 text-center">Cloud Synchronization Policies</h4>
                    <div className="grid gap-6">
                       {[
                         { title: 'TCS & Regulatory Fees', val: pkg.policies.tcs, color: 'border-primary' },
                         { title: 'Purge & Cancellation', val: pkg.policies.cancellation, color: 'border-red-500' },
                         { title: 'Financial Milestones', val: pkg.policies.payment, color: 'border-blue-500' },
                         { title: 'Master Service Agreement', val: pkg.policies.terms, color: 'border-white/20' }
                       ].map((p, i) => (
                         <div key={i} className={`bg-white/5 p-10 border-l-4 ${p.color} rounded-r-3xl`}>
                            <p className="text-[9px] font-black uppercase text-primary mb-4 tracking-[0.3em]">{p.title}</p>
                            <p className="text-base font-medium text-slate-400 leading-relaxed font-sans">{p.val}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Pricing Sticky Sidebar */}
          <div className="space-y-6">
            <Card className="rounded-[3rem] border-white/5 bg-white/5 sticky top-32 luxury-shadow overflow-hidden backdrop-blur-2xl">
              <CardHeader className="bg-primary text-background p-10 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Elite Pricing</span>
                    <Badge className="bg-background text-primary border-0 rounded-full font-black text-[10px] px-4 py-1.5 uppercase tracking-widest">LIMITED ACCESS</Badge>
                 </div>
                 <CardTitle className="text-5xl font-black tracking-tighter">
                   ₹{pkg.totalCost.toLocaleString('en-IN')}
                 </CardTitle>
                 <p className="text-[9px] font-bold opacity-60 uppercase tracking-[0.3em]">Net Cost · {pkg.gst}% GST · Road Intel Incl.</p>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                 <div className="space-y-8">
                    <div className="flex items-center gap-6">
                       <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary font-black text-xl shadow-inner">01</div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Instant Quotation</p>
                          <p className="text-xs font-bold text-slate-400 mt-1 uppercase">Certified Rate Sheet</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary font-black text-xl shadow-inner">02</div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Mountain Verified</p>
                          <p className="text-xs font-bold text-slate-400 mt-1 uppercase">Liaison Dispatched</p>
                       </div>
                    </div>
                 </div>

                 <Separator className="bg-white/10" />

                 <div className="p-8 bg-primary/10 border border-primary/20 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-3 text-primary font-black uppercase text-[10px] tracking-[0.3em]">
                      <ShieldCheck className="h-4 w-4" /> Operational Support
                    </div>
                    <p className="text-xs font-medium text-slate-300 leading-relaxed italic">
                      Customization for PAX escalation or fleet upgrades? Contact our Himalayan Desk: <span className="font-black text-primary block mt-2">nsati09@gmail.com</span>
                    </p>
                 </div>

                 <Button className="w-full h-20 rounded-full font-black text-lg bg-primary hover:bg-primary/90 text-background transition-all shadow-2xl shadow-primary/20 active:scale-95 group/btn uppercase tracking-widest">
                   Initialize Booking <ChevronRight className="ml-3 h-6 w-6 transition-transform group-hover/btn:translate-x-2" />
                 </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
