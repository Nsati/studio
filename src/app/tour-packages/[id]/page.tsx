
'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { 
  Calendar, MapPin, Clock, ArrowLeft, 
  CheckCircle2, XCircle, Info, ChevronRight, Users, Bed, Car, Star, Sparkles, Receipt
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
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] -left-[10%] w-[700px] h-[700px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] -right-[5%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      {/* Sub-Header / Navigation */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-white/5 py-6 sticky top-[72px] z-40">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/tour-packages" className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.5em] text-primary hover:text-white transition-all group">
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-3" /> Back to Journal
          </Link>
          <div className="flex items-center gap-4">
            <Badge className="bg-primary/20 text-primary border border-primary/30 rounded-full font-black text-[10px] px-6 py-2 uppercase tracking-widest">
              Verified Expedition Node
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-20">
            {/* Header Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <div className="flex flex-wrap gap-4">
                <Badge className="bg-primary text-background rounded-full border-0 font-black uppercase tracking-[0.3em] text-[11px] px-8 py-3 shadow-2xl shadow-primary/20">ULTIMATE HIMALAYAN SERIES</Badge>
                <Badge variant="outline" className="rounded-full border-white/20 text-white/60 font-black text-[11px] px-8 py-3 uppercase tracking-widest">{pkg.duration}</Badge>
              </div>
              <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter text-white leading-[0.85] uppercase">
                {pkg.title}
              </h1>
              <div className="flex items-center gap-6 text-lg text-primary font-black uppercase tracking-[0.4em] border-l-8 border-primary pl-10">
                <MapPin className="h-7 w-7" />
                {pkg.destinations.join(' — ')}
              </div>
            </motion.div>

            {/* Visual Hero Card */}
            <div className="relative aspect-[21/9] rounded-[4rem] overflow-hidden shadow-apple-deep border border-white/10 group bg-slate-900">
              <Image src={getImageUrl(pkg.image)} alt={pkg.title} fill priority className="object-cover transition-transform duration-3000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-12 left-12 z-10 flex items-center gap-4 bg-background/50 backdrop-blur-xl px-10 py-5 border border-white/10 rounded-[2rem] text-white">
                <Clock className="h-6 w-6 text-primary" />
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expedition Window</span>
                    <span className="text-lg font-black uppercase">{pkg.travelDate || 'Flexible Dates Available'}</span>
                </div>
              </div>
            </div>

            {/* Key Vitals Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { icon: Users, label: 'Capacity', val: `${pkg.persons} Explorers` },
                 { icon: Bed, label: 'Lodging', val: `${pkg.rooms} Luxury Units` },
                 { icon: Car, label: 'Transport', val: pkg.cabType },
                 { icon: Receipt, label: 'Taxation', val: `${pkg.gst}% Included` }
               ].map((item, i) => (
                 <div key={i} className="p-10 bg-white/5 border border-white/5 flex flex-col items-center text-center gap-5 rounded-[3rem] hover:bg-white/[0.08] transition-all hover:border-primary/20 group">
                    <item.icon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">{item.label}</p>
                        <p className="text-base font-black text-white">{item.val}</p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Journey Tabs */}
            <Tabs defaultValue="itinerary" className="w-full">
              <TabsList className="w-full justify-start border-b border-white/10 rounded-none h-auto p-0 bg-transparent gap-16 overflow-x-auto scrollbar-hide">
                <TabsTrigger value="itinerary" className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-8 font-black uppercase text-[12px] tracking-[0.4em] text-slate-500 data-[state=active]:text-white">The Expedition Plan</TabsTrigger>
                <TabsTrigger value="hotels" className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-8 font-black uppercase text-[12px] tracking-[0.4em] text-slate-500 data-[state=active]:text-white">Handpicked Stays</TabsTrigger>
                <TabsTrigger value="policies" className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-8 font-black uppercase text-[12px] tracking-[0.4em] text-slate-500 data-[state=active]:text-white">Operational Protocol</TabsTrigger>
              </TabsList>

              {/* Itinerary Timeline */}
              <TabsContent value="itinerary" className="pt-24 space-y-24">
                  {pkg.itinerary.map((day, idx) => (
                    <div key={idx} className="relative pl-24">
                      <div className="absolute left-[41px] top-0 bottom-[-96px] w-px bg-white/10 last:bg-transparent" />
                      <div className="absolute left-0 top-0 h-[84px] w-[84px] rounded-full bg-slate-900 border border-white/10 text-primary flex items-center justify-center text-2xl font-black shadow-2xl backdrop-blur-md ring-8 ring-background">
                        {day.day}
                      </div>
                      <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                           <h3 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">{day.title}</h3>
                           <div className="flex gap-4">
                             {day.distance && <Badge variant="secondary" className="rounded-full font-black text-[10px] uppercase tracking-widest px-6 py-2 bg-white/5 text-slate-300 border border-white/10"><MapPin className="h-4 w-4 mr-2 text-primary" /> {day.distance}</Badge>}
                             {day.travelTime && <Badge variant="secondary" className="rounded-full font-black text-[10px] uppercase tracking-widest px-6 py-2 bg-white/5 text-slate-300 border border-white/10"><Clock className="h-4 w-4 mr-2 text-primary" /> {day.travelTime}</Badge>}
                           </div>
                        </div>
                        <p className="text-xl text-slate-400 leading-relaxed font-medium max-w-4xl">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </TabsContent>

              {/* Hotels Section */}
              <TabsContent value="hotels" className="pt-24 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {pkg.hotels?.map((h, i) => (
                      <Card key={i} className="rounded-[3rem] border-white/10 bg-white/5 shadow-apple-deep overflow-hidden group hover:border-primary/40 transition-all duration-700">
                        <CardHeader className="bg-white/5 p-12 border-b border-white/10">
                           <div className="flex items-center gap-3 text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-4">
                             <MapPin className="h-5 w-5" /> {h.city}
                           </div>
                           <CardTitle className="text-3xl font-black text-white leading-tight">{h.hotelName}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-12 space-y-8">
                           <div className="flex justify-between items-center py-5 border-b border-white/10">
                             <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Elite Tier</span>
                             <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span className="text-sm font-black text-white">{h.category}</span>
                             </div>
                           </div>
                           <div className="flex justify-between items-center py-5 border-b border-white/10">
                             <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Unit Type</span>
                             <span className="text-sm font-black text-white uppercase tracking-widest">{h.roomType}</span>
                           </div>
                           <div className="flex justify-between items-center py-5">
                             <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Boarding</span>
                             <span className="text-sm font-black text-white uppercase tracking-widest">{h.mealPlan}</span>
                           </div>
                        </CardContent>
                      </Card>
                   ))}
                </div>
              </TabsContent>

              {/* Legal & Policies */}
              <TabsContent value="policies" className="pt-24 space-y-24">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                    <div className="space-y-10">
                       <h4 className="text-[12px] font-black uppercase text-green-400 tracking-[0.5em] flex items-center gap-5"><CheckCircle2 className="h-8 w-8" /> Standard Inclusions</h4>
                       <ul className="space-y-6">
                          {pkg.inclusions.map((item, i) => <li key={i} className="text-base font-bold text-slate-200 flex gap-5"><span className="text-primary text-xl">•</span> {item}</li>)}
                       </ul>
                    </div>
                    <div className="space-y-10">
                       <h4 className="text-[12px] font-black uppercase text-red-400 tracking-[0.5em] flex items-center gap-5"><XCircle className="h-8 w-8" /> Expedition Exclusions</h4>
                       <ul className="space-y-6">
                          {pkg.exclusions.map((item, i) => <li key={i} className="text-base font-medium text-slate-400 flex gap-5"><span className="text-red-400 text-xl">•</span> {item}</li>)}
                       </ul>
                    </div>
                 </div>
                 
                 <Separator className="bg-white/10" />
                 
                 <div className="space-y-12">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500">Legal Protocols</h4>
                    <div className="grid gap-8">
                       {[
                         { title: 'TCS & Govt Compliance', val: pkg.policies.tcs, color: 'bg-blue-600' },
                         { title: 'Cancellation Schedule', val: pkg.policies.cancellation, color: 'bg-red-600' },
                         { title: 'Financial Milestones', val: pkg.policies.payment, color: 'bg-primary' },
                         { title: 'Terms of Sovereignty', val: pkg.policies.terms, color: 'bg-amber-600' }
                       ].map((p, i) => (
                         <div key={i} className="bg-white/5 p-12 border-l border-white/10 rounded-[2.5rem] relative overflow-hidden group hover:bg-white/[0.08] transition-all duration-500">
                            <div className={`absolute left-0 top-0 bottom-0 w-2 ${p.color}`} />
                            <p className="text-[11px] font-black uppercase text-primary mb-5 tracking-[0.4em]">{p.title}</p>
                            <p className="text-lg font-medium text-slate-300 leading-relaxed">{p.val}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Pricing & Booking Sidebar */}
          <div className="space-y-10">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[4rem] border-white/10 bg-white/5 backdrop-blur-3xl sticky top-[180px] shadow-apple-deep overflow-hidden luxury-shadow border-t border-white/20"
            >
              <div className="bg-primary text-background p-12 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-60">Expedition Cost</span>
                    <Badge className="bg-background text-primary border-0 rounded-full font-black text-[10px] px-6 py-1.5 tracking-[0.2em]">PLATINUM NODE</Badge>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black tracking-tighter">
                        ₹{pkg.totalCost.toLocaleString('en-IN')}
                    </span>
                 </div>
                 <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em] leading-relaxed">
                   Net Investment incl. {pkg.gst}% GST + Private Dedicated Transport
                 </p>
              </div>

              <CardContent className="p-12 space-y-12">
                 <div className="space-y-10">
                    <div className="flex items-center gap-8 group">
                       <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-2xl transition-all group-hover:bg-primary group-hover:text-background shadow-2xl">A</div>
                       <div className="space-y-1">
                          <p className="text-[12px] font-black uppercase text-white tracking-widest">Instant Sync</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cloud Confirmation</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-8 group">
                       <div className="h-16 w-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-2xl transition-all group-hover:bg-white group-hover:text-background shadow-2xl">B</div>
                       <div className="space-y-1">
                          <p className="text-[12px] font-black uppercase text-white tracking-widest">Satellite Watch</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Safety Monitoring</p>
                       </div>
                    </div>
                 </div>

                 <Separator className="bg-white/10" />

                 <div className="p-10 bg-primary/10 border border-primary/20 rounded-[3rem] space-y-5 text-center">
                    <div className="flex items-center justify-center gap-4 text-primary font-black uppercase text-[11px] tracking-[0.4em]">
                      <Sparkles className="h-5 w-5" /> Elite Liaison
                    </div>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed px-2">
                      Request bespoke itinerary modifications or group elite pricing through our concierge desk.
                    </p>
                    <a href="mailto:expeditions@northernharrier.com" className="font-black text-primary block mt-4 text-lg hover:underline transition-all">
                        Concierge Desk
                    </a>
                 </div>

                 <Button asChild className="w-full h-24 rounded-full font-black text-xl bg-primary hover:bg-white hover:text-background transition-all shadow-apple-deep group active:scale-95">
                   <Link href="/contact" className="flex items-center justify-center">
                        Initialize Expedition <ChevronRight className="ml-4 h-7 w-7 transition-transform group-hover:translate-x-3" />
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
