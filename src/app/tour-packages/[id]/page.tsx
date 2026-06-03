
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
        <div className="h-16 w-2/3 bg-muted rounded-full" />
        <div className="h-[500px] w-full bg-muted rounded-[3rem]" />
      </div>
    );
  }

  if (!pkg) return notFound();

  const getImageUrl = (img: string) => {
    if (!img) return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200';
    let url = img.trim();
    return url.startsWith('http') ? url : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200';
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white pb-32 font-sans">
      
      {/* Sub-Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-border/10 py-6 sticky top-[72px] z-40">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/tour-packages" className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.4em] text-primary hover:text-accent transition-all group">
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-3" /> Back to Journeys
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-full font-bold text-[10px] px-6 py-2.5 uppercase tracking-widest">
              Verified Expedition Node
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
          
          {/* Left Column: Core Narrative */}
          <div className="lg:col-span-2 space-y-20">
            
            {/* Editorial Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <div className="flex flex-wrap gap-4">
                <Badge className="bg-accent text-accent-foreground rounded-full border-0 font-bold uppercase tracking-[0.4em] text-[11px] px-8 py-3.5 shadow-xl saffron-glow">ULTIMATE HIMALAYAN SERIES</Badge>
                <Badge variant="outline" className="rounded-full border-border text-slate-500 font-bold text-[11px] px-8 py-3.5 uppercase tracking-widest">{pkg.duration}</Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-bold text-foreground tracking-tighter leading-[0.8] uppercase font-heading">
                {pkg.title}
              </h1>
              <div className="flex items-center gap-8 text-xl text-primary font-bold uppercase tracking-[0.4em] border-l-8 border-primary pl-12">
                <MapPin className="h-8 w-8" />
                {pkg.destinations.join(' — ')}
              </div>
            </motion.div>

            {/* Visual Centerpiece */}
            <div className="relative aspect-[21/9] rounded-[4.5rem] overflow-hidden shadow-apple-deep border border-border/10 group bg-muted luxury-shadow">
              <Image src={getImageUrl(pkg.image)} alt={pkg.title} fill priority className="object-cover transition-transform duration-3000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-12 left-12 z-10 flex items-center gap-6 bg-white/95 backdrop-blur-2xl px-10 py-6 border border-border/10 rounded-[2.5rem] text-foreground shadow-2xl">
                <Calendar className="h-7 w-7 text-primary" />
                <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Scheduled For</span>
                    <span className="text-xl font-bold uppercase">{pkg.travelDate || 'Custom Dates Available'}</span>
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
                 <div key={i} className="p-10 bg-white border border-border/10 flex flex-col items-center text-center gap-6 rounded-[3rem] hover:shadow-xl transition-all group shadow-sm">
                    <item.icon className="h-10 w-10 text-primary transition-transform group-hover:scale-110" />
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.4em]">{item.label}</p>
                        <p className="text-lg font-bold text-foreground">{item.val}</p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Journey Details Tabs */}
            <Tabs defaultValue="itinerary" className="w-full">
              <TabsList className="w-full justify-start border-b border-border/10 rounded-none h-auto p-0 bg-transparent gap-16 overflow-x-auto scrollbar-hide">
                <TabsTrigger value="itinerary" className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-8 font-bold uppercase text-[12px] tracking-[0.4em] text-slate-400 data-[state=active]:text-foreground">Itinerary</TabsTrigger>
                <TabsTrigger value="hotels" className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-8 font-bold uppercase text-[12px] tracking-[0.4em] text-slate-400 data-[state=active]:text-foreground">Stay Nodes</TabsTrigger>
                <TabsTrigger value="policies" className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-8 font-bold uppercase text-[12px] tracking-[0.4em] text-slate-400 data-[state=active]:text-foreground">Policies</TabsTrigger>
              </TabsList>

              <TabsContent value="itinerary" className="pt-20 space-y-20">
                  {pkg.itinerary.map((day, idx) => (
                    <div key={idx} className="relative pl-24">
                      <div className="absolute left-[39px] top-0 bottom-[-80px] w-px bg-muted last:bg-transparent" />
                      <div className="absolute left-0 top-0 h-[80px] w-[80px] rounded-full bg-white border border-border/10 text-primary flex items-center justify-center text-2xl font-bold shadow-xl ring-8 ring-background">
                        {day.day}
                      </div>
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                           <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground uppercase leading-none font-heading">{day.title}</h3>
                           <div className="flex gap-4">
                             {day.distance && <Badge variant="secondary" className="rounded-full font-bold text-[10px] uppercase tracking-widest px-6 py-2 bg-muted text-slate-500 border-0"><MapPin className="h-3.5 w-3.5 mr-2 text-primary" /> {day.distance}</Badge>}
                           </div>
                        </div>
                        <p className="text-xl text-slate-600 leading-relaxed font-medium">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="hotels" className="pt-20 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {pkg.hotels?.map((h, i) => (
                      <Card key={i} className="rounded-[3rem] border-border/10 bg-white shadow-apple overflow-hidden group hover:shadow-2xl transition-all duration-700">
                        <CardHeader className="bg-muted/10 p-10 border-b border-border/5">
                           <div className="flex items-center gap-4 text-[11px] font-bold text-primary uppercase tracking-[0.4em] mb-4">
                             <MapPin className="h-4 w-4" /> {h.city}
                           </div>
                           <CardTitle className="text-3xl font-bold text-foreground leading-tight font-heading">{h.hotelName}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-6">
                           <div className="flex justify-between items-center py-4 border-b border-muted">
                             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Rating</span>
                             <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 fill-accent text-accent" />
                                <span className="text-sm font-bold text-foreground">{h.category}</span>
                             </div>
                           </div>
                           <div className="flex justify-between items-center py-4">
                             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Room</span>
                             <span className="text-sm font-bold text-foreground uppercase tracking-widest">{h.roomType}</span>
                           </div>
                        </CardContent>
                      </Card>
                   ))}
                </div>
              </TabsContent>

              <TabsContent value="policies" className="pt-20 space-y-16">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-10">
                       <h4 className="text-[12px] font-bold uppercase text-green-600 tracking-[0.5em] flex items-center gap-4"><CheckCircle2 className="h-8 w-8" /> Inclusions</h4>
                       <ul className="space-y-6">
                          {pkg.inclusions.map((item, i) => <li key={i} className="text-base font-bold text-slate-600 flex gap-4"><span className="text-primary">•</span> {item}</li>)}
                       </ul>
                    </div>
                    <div className="space-y-10">
                       <h4 className="text-[12px] font-bold uppercase text-red-600 tracking-[0.5em] flex items-center gap-4"><XCircle className="h-8 w-8" /> Exclusions</h4>
                       <ul className="space-y-6">
                          {pkg.exclusions.map((item, i) => <li key={i} className="text-base font-medium text-slate-400 flex gap-4"><span>•</span> {item}</li>)}
                       </ul>
                    </div>
                 </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Pricing Sidebar */}
          <div className="space-y-8">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[4rem] border-border/10 bg-white sticky top-[180px] shadow-apple-deep overflow-hidden border-t-8 border-primary"
            >
              <div className="bg-primary text-primary-foreground p-12 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-80">Package Value</span>
                    <Badge className="bg-accent text-accent-foreground border-0 rounded-full font-bold text-[10px] px-6 py-1.5 tracking-widest">PLATINUM</Badge>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold tracking-tighter">
                        ₹{pkg.totalCost.toLocaleString('en-IN')}
                    </span>
                 </div>
                 <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">
                   Net Price incl. {pkg.gst}% GST
                 </p>
              </div>

              <CardContent className="p-12 space-y-12">
                 <div className="space-y-10">
                    <div className="flex items-center gap-8 group">
                       <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-primary font-bold text-xl group-hover:bg-primary group-hover:text-white transition-all">01</div>
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-foreground uppercase tracking-widest">Instant Sync</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Cloud Voucher</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-8 group">
                       <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-primary font-bold text-xl group-hover:bg-primary group-hover:text-white transition-all">02</div>
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-foreground uppercase tracking-widest">Guardian Watch</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Live Safety Feed</p>
                       </div>
                    </div>
                 </div>

                 <Separator />

                 <Button asChild className="w-full h-24 rounded-full font-bold text-xl bg-accent hover:bg-accent/90 text-accent-foreground transition-all shadow-xl saffron-glow group active:scale-95">
                   <Link href="/contact" className="flex items-center justify-center gap-4">
                        Initialize Journey <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                   </Link>
                 </Button>

                 <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Best Rate Guaranteed for Devbhoomi
                 </p>
              </CardContent>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
