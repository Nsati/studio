
'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { 
  Calendar, MapPin, ArrowLeft, 
  CheckCircle2, XCircle, Users, Bed, Car, Star, Receipt, Phone, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

/**
 * @fileOverview Professional Tour Package Detail View.
 * Call to Book buttons updated with primary branding and better visibility.
 */

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
        <div className="h-10 w-1/2 bg-muted rounded-full" />
        <div className="h-[400px] w-full bg-muted rounded-2xl" />
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
    <div className="min-h-screen bg-background text-foreground pb-24 font-sans">
      
      <div className="container mx-auto px-4 md:px-6 pt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          
          {/* Left Column: Core Itinerary & Details */}
          <div className="lg:col-span-2 space-y-12">
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-accent text-accent-foreground rounded-full border-0 font-bold uppercase tracking-widest text-[9px] px-4 py-1 shadow-md">PLATINUM SERIES</Badge>
                <Badge variant="outline" className="rounded-full border-border/20 text-slate-500 font-bold text-[9px] px-4 py-1 uppercase tracking-widest">{pkg.duration}</Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight uppercase font-heading">
                {pkg.title}
              </h1>
              <div className="flex items-center gap-4 text-base md:text-lg text-primary font-bold uppercase tracking-widest border-l-4 border-primary pl-6">
                <MapPin className="h-5 w-5 text-accent" />
                {pkg.destinations.join(' • ')}
              </div>
            </motion.div>

            <div className="relative aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-xl border border-border/5 bg-muted">
              <Image 
                src={getImageUrl(pkg.image)} 
                alt={pkg.title} 
                fill 
                priority 
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-10 flex items-center gap-4 bg-white/95 backdrop-blur-md px-6 py-4 border border-border/10 rounded-xl text-foreground shadow-lg">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Scheduled Date</span>
                    <span className="text-sm font-bold uppercase">{pkg.travelDate || 'Available on Request'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
               {[
                 { icon: Users, label: 'PAX Count', val: `${pkg.persons} Adults` },
                 { icon: Bed, label: 'Accommodation', val: `${pkg.rooms} Rooms` },
                 { icon: Car, label: 'Transport', val: pkg.cabType },
                 { icon: Receipt, label: 'GST Schema', val: `${pkg.gst}% Incl.` }
               ].map((item, i) => (
                 <div key={i} className="p-6 bg-white border border-border/5 flex flex-col items-center text-center gap-3 rounded-2xl hover:shadow-md transition-all group shadow-sm">
                    <item.icon className="h-6 w-6 text-primary" />
                    <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{item.label}</p>
                        <p className="text-sm font-bold text-foreground">{item.val}</p>
                    </div>
                 </div>
               ))}
            </div>

            <Tabs defaultValue="itinerary" className="w-full">
              <TabsList className="w-full justify-start border-b border-border/5 rounded-none h-auto p-0 bg-transparent gap-8 md:gap-12 overflow-x-auto scrollbar-hide">
                <TabsTrigger value="itinerary" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 font-bold uppercase text-[10px] tracking-widest text-slate-400 data-[state=active]:text-foreground">Itinerary</TabsTrigger>
                <TabsTrigger value="hotels" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 font-bold uppercase text-[10px] tracking-widest text-slate-400 data-[state=active]:text-foreground">Stay Nodes</TabsTrigger>
                <TabsTrigger value="policies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 font-bold uppercase text-[10px] tracking-widest text-slate-400 data-[state=active]:text-foreground">Policies</TabsTrigger>
              </TabsList>

              <TabsContent value="itinerary" className="pt-10 space-y-10">
                  {pkg.itinerary.map((day, idx) => (
                    <div key={idx} className="relative pl-16 md:pl-20">
                      <div className="absolute left-[23px] md:left-[27px] top-0 bottom-[-40px] w-0.5 bg-muted last:bg-transparent" />
                      <div className="absolute left-0 top-0 h-[48px] w-[48px] md:h-[56px] md:w-[56px] rounded-full bg-white border border-border/10 text-primary flex items-center justify-center text-lg md:text-xl font-black shadow-md ring-4 ring-background">
                        {day.day}
                      </div>
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                           <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground uppercase leading-none font-heading">{day.title}</h3>
                           {day.distance && (
                             <Badge variant="secondary" className="w-fit rounded-full font-bold text-[9px] uppercase tracking-widest px-3 py-1 bg-muted text-slate-500 border-0">
                               <MapPin className="h-3 w-3 mr-1.5 text-primary" /> {day.distance}
                             </Badge>
                           )}
                        </div>
                        <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="hotels" className="pt-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {pkg.hotels?.map((h, i) => (
                      <Card key={i} className="rounded-2xl border-border/5 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
                        <CardHeader className="bg-muted/10 p-6 border-b border-border/5">
                           <div className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-widest mb-2">
                             <MapPin className="h-3 w-3" /> {h.city}
                           </div>
                           <CardTitle className="text-lg font-bold text-foreground leading-tight font-heading">{h.hotelName}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 text-xs font-medium">
                           <div className="flex justify-between items-center py-2 border-b border-muted/30">
                             <span className="text-slate-400 uppercase tracking-widest">Trust Rating</span>
                             <div className="flex items-center gap-1.5">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="font-bold text-foreground">{h.category}</span>
                             </div>
                           </div>
                           <div className="flex justify-between items-center py-2">
                             <span className="text-slate-400 uppercase tracking-widest">Inventory</span>
                             <span className="font-bold text-foreground uppercase">{h.roomType}</span>
                           </div>
                        </CardContent>
                      </Card>
                   ))}
                </div>
              </TabsContent>

              <TabsContent value="policies" className="pt-10 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black uppercase text-green-600 tracking-widest flex items-center gap-3">
                         <CheckCircle2 className="h-6 w-6" /> Package Inclusions
                       </h4>
                       <ul className="space-y-4">
                          {pkg.inclusions.map((item, i) => (
                            <li key={i} className="text-sm font-bold text-slate-600 flex gap-3">
                              <span className="text-primary text-lg leading-none">•</span> {item}
                            </li>
                          ))}
                       </ul>
                    </div>
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest flex items-center gap-3">
                         <XCircle className="h-6 w-6" /> Exclusions
                       </h4>
                       <ul className="space-y-4">
                          {pkg.exclusions.map((item, i) => (
                            <li key={i} className="text-sm font-medium text-slate-400 flex gap-3">
                              <span className="text-lg leading-none">•</span> {item}
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Pricing Sidebar */}
          <div className="space-y-8">
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-border/10 bg-white sticky top-[100px] shadow-2xl overflow-hidden border-t-4 border-accent"
            >
              <div className="bg-primary text-primary-foreground p-8 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Sync Price Protocol</span>
                    <Badge className="bg-accent text-accent-foreground border-0 rounded-full font-bold text-[8px] px-3 py-1 tracking-widest">ELITE</Badge>
                 </div>
                 <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tighter">
                        ₹{pkg.totalCost.toLocaleString('en-IN')}
                    </span>
                 </div>
                 <p className="text-[8px] font-bold opacity-70 uppercase tracking-widest">
                   Net Investment incl. {pkg.gst}% Tax Schema
                 </p>
              </div>

              <CardContent className="p-8 space-y-8">
                 <div className="space-y-6">
                    <div className="flex items-center gap-5 group">
                       <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-primary font-black text-sm group-hover:bg-primary group-hover:text-white transition-all">01</div>
                       <div className="space-y-0.5">
                          <p className="text-xs font-black text-foreground uppercase tracking-widest">Instant Booking</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Secure Cloud Gateway</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-5 group">
                       <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-primary font-black text-sm group-hover:bg-primary group-hover:text-white transition-all">02</div>
                       <div className="space-y-0.5">
                          <p className="text-xs font-black text-foreground uppercase tracking-widest">24/7 Ground Ops</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Regional Support Nodes</p>
                       </div>
                    </div>
                 </div>

                 <Separator />

                 <div className="space-y-3">
                    <Button asChild className="w-full h-14 rounded-xl font-black text-xs bg-accent hover:bg-accent/90 text-accent-foreground transition-all shadow-xl group uppercase tracking-widest saffron-glow">
                        <a href="tel:+916399902725" className="flex items-center justify-center gap-3">
                            <Phone className="h-4 w-4" /> CALL TO BOOK
                        </a>
                    </Button>
                    <Button asChild variant="outline" className="w-full h-14 rounded-xl font-black text-xs border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 transition-all group uppercase tracking-widest">
                        <a href="https://wa.me/916399902725" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                            <MessageCircle className="h-4 w-4" /> WhatsApp Chat
                        </a>
                    </Button>
                 </div>

                 <div className="flex flex-col items-center gap-2">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Best Rate Certified for Uttarakhand</p>
                    <div className="flex gap-4 grayscale opacity-30 h-4">
                        <span className="text-[10px] font-black tracking-tighter uppercase">UPI</span>
                        <span className="text-[10px] font-black tracking-tighter uppercase">VISA</span>
                        <span className="text-[10px] font-black tracking-tighter uppercase">GPAY</span>
                    </div>
                 </div>
              </CardContent>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
