'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { 
  Calendar, MapPin, Clock, ArrowLeft, 
  CheckCircle2, XCircle, ChevronRight, Users, Bed, Car, Star, Sparkles, Receipt
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
    <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-background pb-32">
      
      {/* Sub-Header */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-white/5 py-8 sticky top-[72px] z-40">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/tour-packages" className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.5em] text-primary hover:text-white transition-all group">
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-3" /> Back to Journeys
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Badge className="bg-primary/20 text-primary border border-primary/30 rounded-full font-black text-[10px] px-6 py-2.5 uppercase tracking-widest">
              Verified Expedition Node
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
          
          {/* Left Column: Core Narrative */}
          <div className="lg:col-span-2 space-y-24">
            
            {/* Editorial Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <div className="flex flex-wrap gap-4">
                <Badge className="bg-primary text-background rounded-full border-0 font-black uppercase tracking-[0.4em] text-[11px] px-8 py-3.5 shadow-2xl shadow-primary/20">ULTIMATE HIMALAYAN SERIES</Badge>
                <Badge variant="outline" className="rounded-full border-white/20 text-white/60 font-black text-[11px] px-8 py-3.5 uppercase tracking-widest">{pkg.duration}</Badge>
              </div>
              <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter text-white leading-[0.8] uppercase">
                {pkg.title}
              </h1>
              <div className="flex items-center gap-8 text-xl text-primary font-black uppercase tracking-[0.5em] border-l-8 border-primary pl-12">
                <MapPin className="h-8 w-8" />
                {pkg.destinations.join(' — ')}
              </div>
            </motion.div>

            {/* Visual Centerpiece */}
            <div className="relative aspect-[21/9] rounded-[4.5rem] overflow-hidden shadow-apple-deep border border-white/10 group bg-slate-900 luxury-shadow">
              <Image src={getImageUrl(pkg.image)} alt={pkg.title} fill priority className="object-cover transition-transform duration-3000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-16 left-16 z-10 flex items-center gap-6 bg-background/60 backdrop-blur-2xl px-12 py-6 border border-white/10 rounded-[2.5rem] text-white">
                <Calendar className="h-7 w-7 text-primary" />
                <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Scheduled For</span>
                    <span className="text-xl font-black uppercase">{pkg.travelDate || 'Custom Dates Available'}</span>
                </div>
              </div>
            </div>

            {/* Key Logistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[
                 { icon: Users, label: 'Explorer Count', val: `${pkg.persons} PAX` },
                 { icon: Bed, label: 'Luxury Stays', val: `${pkg.rooms} Units` },
                 { icon: Car, label: 'Transport Node', val: pkg.cabType },
                 { icon: Receipt, label: 'Tax Schema', val: `${pkg.gst}% Included` }
               ].map((item, i) => (
                 <div key={i} className="p-12 bg-white/[0.03] border border-white/5 flex flex-col items-center text-center gap-6 rounded-[3.5rem] hover:bg-white/[0.08] transition-all hover:border-primary/20 group">
                    <item.icon className="h-10 w-10 text-primary transition-transform group-hover:scale-110" />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">{item.label}</p>
                        <p className="text-lg font-black text-white">{item.val}</p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Comprehensive Journey Intel */}
            <Tabs defaultValue="itinerary" className="w-full">
              <TabsList className="w-full justify-start border-b border-white/10 rounded-none h-auto p-0 bg-transparent gap-20 overflow-x-auto scrollbar-hide">
                <TabsTrigger value="itinerary" className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-10 font-black uppercase text-[13px] tracking-[0.5em] text-slate-500 data-[state=active]:text-white">Day-Wise Log</TabsTrigger>
                <TabsTrigger value="hotels" className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-10 font-black uppercase text-[13px] tracking-[0.5em] text-slate-500 data-[state=active]:text-white">Stay Nodes</TabsTrigger>
                <TabsTrigger value="policies" className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-10 font-black uppercase text-[13px] tracking-[0.5em] text-slate-500 data-[state=active]:text-white">Compliance</TabsTrigger>
              </TabsList>

              <TabsContent value="itinerary" className="pt-24 space-y-24">
                  {pkg.itinerary.map((day, idx) => (
                    <div key={idx} className="relative pl-32">
                      <div className="absolute left-[47px] top-0 bottom-[-96px] w-px bg-white/10 last:bg-transparent" />
                      <div className="absolute left-0 top-0 h-[96px] w-[96px] rounded-full bg-slate-900 border border-white/10 text-primary flex items-center justify-center text-3xl font-black shadow-2xl backdrop-blur-md ring-8 ring-background">
                        {day.day}
                      </div>
                      <div className="space-y-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                           <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase leading-none">{day.title}</h3>
                           <div className="flex gap-6">
                             {day.distance && <Badge variant="secondary" className="rounded-full font-black text-[10px] uppercase tracking-widest px-8 py-3 bg-white/5 text-slate-300 border border-white/10"><MapPin className="h-4 w-4 mr-2 text-primary" /> {day.distance}</Badge>}
                             {day.travelTime && <Badge variant="secondary" className="rounded-full font-black text-[10px] uppercase tracking-widest px-8 py-3 bg-white/5 text-slate-300 border border-white/10"><Clock className="h-4 w-4 mr-2 text-primary" /> {day.travelTime}</Badge>}
                           </div>
                        </div>
                        <p className="text-2xl text-slate-400 leading-relaxed font-medium max-w-5xl">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="hotels" className="pt-24 space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   {pkg.hotels?.map((h, i) => (
                      <Card key={i} className="rounded-[3.5rem] border-white/10 bg-white/[0.03] luxury-shadow overflow-hidden group hover:border-primary/40 transition-all duration-700">
                        <CardHeader className="bg-white/[0.03] p-12 border-b border-white/5">
                           <div className="flex items-center gap-4 text-[12px] font-black text-primary uppercase tracking-[0.5em] mb-6">
                             <MapPin className="h-5 w-5" /> {h.city}
                           </div>
                           <CardTitle className="text-4xl font-black text-white leading-tight">{h.hotelName}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-12 space-y-10">
                           <div className="flex justify-between items-center py-6 border-b border-white/5">
                             <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em]">Rating Tier</span>
                             <div className="flex items-center gap-3">
                                <Star className="h-5 w-5 fill-primary text-primary" />
                                <span className="text-base font-black text-white">{h.category}</span>
                             </div>
                           </div>
                           <div className="flex justify-between items-center py-6 border-b border-white/5">
                             <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em]">Unit Type</span>
                             <span className="text-base font-black text-white uppercase tracking-widest">{h.roomType}</span>
                           </div>
                           <div className="flex justify-between items-center py-6">
                             <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em]">Boarding</span>
                             <span className="text-base font-black text-white uppercase tracking-widest">{h.mealPlan}</span>
                           </div>
                        </CardContent>
                      </Card>
                   ))}
                </div>
              </TabsContent>

              <TabsContent value="policies" className="pt-24 space-y-24">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                    <div className="space-y-12">
                       <h4 className="text-[13px] font-black uppercase text-green-400 tracking-[0.6em] flex items-center gap-6"><CheckCircle2 className="h-10 w-10" /> Guaranteed Inclusions</h4>
                       <ul className="space-y-8">
                          {pkg.inclusions.map((item, i) => <li key={i} className="text-lg font-bold text-slate-200 flex gap-6"><span className="text-primary text-2xl">•</span> {item}</li>)}
                       </ul>
                    </div>
                    <div className="space-y-12">
                       <h4 className="text-[13px] font-black uppercase text-red-400 tracking-[0.6em] flex items-center gap-6"><XCircle className="h-10 w-10" /> Important Exclusions</h4>
                       <ul className="space-y-8">
                          {pkg.exclusions.map((item, i) => <li key={i} className="text-lg font-medium text-slate-400 flex gap-6"><span className="text-red-400 text-2xl">•</span> {item}</li>)}
                       </ul>
                    </div>
                 </div>
                 
                 <Separator className="bg-white/5" />
                 
                 <div className="space-y-16">
                    <h4 className="text-[12px] font-black uppercase tracking-[0.8em] text-slate-600">Administrative Protocols</h4>
                    <div className="grid gap-10">
                       {[
                         { title: 'TCS & Statutory Norms', val: pkg.policies.tcs, color: 'bg-blue-600' },
                         { title: 'Cancellation Matrix', val: pkg.policies.cancellation, color: 'bg-red-600' },
                         { title: 'Financial Stages', val: pkg.policies.payment, color: 'bg-primary' },
                         { title: 'Master Terms', val: pkg.policies.terms, color: 'bg-amber-600' }
                       ].map((p, i) => (
                         <div key={i} className="bg-white/[0.02] p-16 border-l-4 border-white/5 rounded-[3rem] relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-500">
                            <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${p.color}`} />
                            <p className="text-[11px] font-black uppercase text-primary mb-6 tracking-[0.5em]">{p.title}</p>
                            <p className="text-xl font-medium text-slate-300 leading-relaxed">{p.val}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Investment & Booking Hub */}
          <div className="space-y-12">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[4.5rem] border-white/10 bg-white/[0.03] backdrop-blur-3xl sticky top-[180px] luxury-shadow overflow-hidden border-t border-white/20"
            >
              <div className="bg-primary text-background p-16 space-y-6">
                 <div className="flex justify-between items-center">
                    <span className="text-[12px] font-black uppercase tracking-[0.5em] opacity-60">Investment</span>
                    <Badge className="bg-background text-primary border-0 rounded-full font-black text-[11px] px-8 py-2 tracking-[0.3em]">PLATINUM HUB</Badge>
                 </div>
                 <div className="flex items-baseline gap-3">
                    <span className="text-7xl font-black tracking-tighter">
                        ₹{pkg.totalCost.toLocaleString('en-IN')}
                    </span>
                 </div>
                 <p className="text-[11px] font-black opacity-60 uppercase tracking-[0.4em] leading-relaxed">
                   Final Net Investment incl. {pkg.gst}% GST
                 </p>
              </div>

              <CardContent className="p-16 space-y-16">
                 <div className="space-y-12">
                    <div className="flex items-center gap-10 group">
                       <div className="h-20 w-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-3xl transition-all group-hover:bg-primary group-hover:text-background shadow-2xl">01</div>
                       <div className="space-y-2">
                          <p className="text-[13px] font-black uppercase text-white tracking-widest">Instant Sync</p>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cloud Vouchering</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-10 group">
                       <div className="h-20 w-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-3xl transition-all group-hover:bg-white group-hover:text-background shadow-2xl">02</div>
                       <div className="space-y-2">
                          <p className="text-[13px] font-black uppercase text-white tracking-widest">Guardian Watch</p>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Active Safety Feed</p>
                       </div>
                    </div>
                 </div>

                 <Separator className="bg-white/10" />

                 <div className="p-12 bg-primary/10 border border-primary/20 rounded-[3.5rem] space-y-6 text-center">
                    <div className="flex items-center justify-center gap-4 text-primary font-black uppercase text-[12px] tracking-[0.5em]">
                      <Sparkles className="h-6 w-6" /> Concierge Desk
                    </div>
                    <p className="text-base font-medium text-slate-300 leading-relaxed">
                      Custom modifications or corporate elite pricing available through our global concierge.
                    </p>
                    <a href="mailto:concierge@northernharrier.com" className="font-black text-primary block mt-6 text-2xl hover:underline transition-all underline-offset-8">
                        Connect Now
                    </a>
                 </div>

                 <Button asChild className="w-full h-28 rounded-full font-black text-2xl bg-primary hover:bg-white hover:text-background transition-all shadow-apple-deep group active:scale-95">
                   <Link href="/contact" className="flex items-center justify-center">
                        Initialize Journey <ChevronRight className="ml-6 h-8 w-8 transition-transform group-hover:translate-x-4" />
                   </Link>
                 </Button>
              </CardContent>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
