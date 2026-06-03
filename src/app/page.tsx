
'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Star, 
  ArrowRight, 
  Compass, 
  MapPin, 
  Play, 
  ShieldCheck, 
  Heart, 
  MessageSquare,
  Trophy,
  Users,
  Mountain,
  Video,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen font-sans selection:bg-accent selection:text-white">
      
      {/* 1. HERO SECTION - COMPACTED */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.pexels.com/photos/18636614/pexels-photo-18636614.jpeg"
          alt="Devbhoomi Uttarakhand Temple"
          fill
          priority
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-background" />
        
        <div className="container relative z-10 px-6 text-center">
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto space-y-6">
            <Badge className="bg-accent/90 backdrop-blur-sm text-accent-foreground border-0 px-5 py-2 rounded-full font-black uppercase tracking-widest text-[9px] mb-2 shadow-xl saffron-glow">
              ⚡ INDIA'S MOST LOVED UTTARAKHAND SPECIALIST
            </Badge>
            
            <div className="space-y-2">
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight font-heading uppercase">
                    DISCOVER <span className="text-accent italic font-spiritual capitalize">Devbhoomi</span>
                </h1>
                <p className="text-xl md:text-2xl font-bold text-white/90 tracking-widest uppercase font-heading">
                    THE SACRED HIMALAYAS
                </p>
            </div>
            
            <p className="mt-4 text-base md:text-lg text-white/80 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
              Curated Char Dham Yatra, weekend getaways, trekking expeditions, and luxury stays in Devbhoomi.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button asChild size="lg" className="h-14 px-8 rounded-full font-black text-sm bg-accent hover:bg-white hover:text-primary transition-all shadow-xl group">
                <Link href="/tour-packages" className="flex items-center gap-2">
                  PLAN YOUR PILGRIMAGE <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full font-black text-sm border-2 border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm transition-all">
                <Link href="/search">EXPLORE ADVENTURES</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS & PHOTO STRIP - COMPACTED */}
      <section className="py-16 bg-white relative z-20 -mt-12 rounded-t-[3rem]">
        <div className="container px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Pilgrimage Sites', val: '15+', icon: Mountain },
              { label: 'Trekking Routes', val: '50+', icon: Compass },
              { label: 'Guest Reviews', val: '4.9/5', icon: Star },
              { label: 'Photos Shared', val: '2000+', icon: Video },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                {...fadeInUp} 
                transition={{ delay: i * 0.1 }}
                className="bg-background p-6 rounded-3xl border border-muted text-center space-y-1 hover:shadow-lg transition-all group"
              >
                <div className="mx-auto w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="text-2xl font-black text-primary uppercase font-heading">{stat.val}</h4>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="overflow-hidden py-4">
             <div className="flex gap-4 animate-marquee whitespace-nowrap">
                {[
                  "https://images.pexels.com/photos/12321669/pexels-photo-12321669.jpeg?auto=compress&cs=tinysrgb&w=600",
                  "https://images.pexels.com/photos/16090413/pexels-photo-16090413.jpeg?auto=compress&cs=tinysrgb&w=600",
                  "https://images.pexels.com/photos/4143599/pexels-photo-4143599.jpeg?auto=compress&cs=tinysrgb&w=600",
                  "https://images.pexels.com/photos/14149541/pexels-photo-14149541.jpeg?auto=compress&cs=tinysrgb&w=600",
                  "https://images.pexels.com/photos/37618361/pexels-photo-37618361.jpeg?auto=compress&cs=tinysrgb&w=600",
                  "https://images.pexels.com/photos/12321669/pexels-photo-12321669.jpeg?auto=compress&cs=tinysrgb&w=600"
                ].map((url, i) => (
                  <div key={i} className="relative w-56 h-40 rounded-2xl overflow-hidden shadow-md flex-shrink-0 group border border-black/5">
                    <Image 
                      src={url} 
                      alt="Uttarakhand Guest Moment" 
                      fill 
                      unoptimized={true}
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED DESTINATIONS - COMPACTED */}
      <section className="py-20 bg-background">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-accent font-black uppercase tracking-widest text-[9px]">
                <Trophy className="h-3 w-3" /> Iconic Node Access
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-primary font-heading uppercase leading-none">Divine Hubs</h2>
            </div>
            <Button variant="link" asChild className="text-accent font-black uppercase tracking-widest text-[10px] group h-auto p-0">
              <Link href="/search" className="flex items-center gap-1">View All <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Kedarnath', img: 'https://images.pexels.com/photos/16090413/pexels-photo-16090413.jpeg?auto=compress&cs=tinysrgb&w=800', badge: 'Spiritual', desc: 'Jyotirlinga' },
              { name: 'Rishikesh', img: 'https://images.pexels.com/photos/37618361/pexels-photo-37618361.jpeg?auto=compress&cs=tinysrgb&w=800', badge: 'Adventure', desc: 'Yoga Capital' },
              { name: 'Auli', img: 'https://images.pexels.com/photos/14149541/pexels-photo-14149541.jpeg?auto=compress&cs=tinysrgb&w=800', badge: 'Ski Node', desc: 'Snow Slopes' },
              { name: 'Nainital', img: 'https://images.pexels.com/photos/4143599/pexels-photo-4143599.jpeg?auto=compress&cs=tinysrgb&w=800', badge: 'Family', desc: 'Lake District' }
            ].map((node, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                <Link href={`/search?city=${node.name}`}>
                  <Card className="group relative aspect-[3/4] overflow-hidden rounded-3xl border-0 shadow-lg cursor-pointer bg-muted">
                    <Image src={node.img} alt={node.name} fill unoptimized={true} className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-6 left-6 right-6 space-y-1">
                      <h3 className="text-2xl font-black text-white tracking-tighter uppercase font-heading">{node.name}</h3>
                      <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{node.desc}</p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. REVIEWS SECTION - COMPACTED */}
      <section className="py-20 bg-white">
        <div className="container px-6">
          <div className="text-center mb-12 space-y-2">
             <div className="flex items-center justify-center gap-2 text-accent font-black uppercase tracking-widest text-[9px]">
                <MessageSquare className="h-3 w-3" /> Guest Protocols
             </div>
             <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-primary font-heading uppercase">Traveler Network</h2>
          </div>

          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent className="-ml-6">
              {[
                { name: 'Meera Sharma', city: 'Delhi', text: 'The Char Dham package was seamless. Managed everything perfectly.', type: 'Char Dham' },
                { name: 'Amit Gupta', city: 'Mumbai', text: 'Rishikesh camping was mind-blowing. Local guides are experts.', type: 'Adventure' },
                { name: 'Rohan Joshi', city: 'Pune', text: 'Auli views were promised and delivered. Reliable transport.', type: 'Winter Escape' },
              ].map((review, i) => (
                <CarouselItem key={i} className="pl-6 md:basis-1/2 lg:basis-1/3">
                  <Card className="rounded-3xl border border-muted shadow-sm h-full group">
                    <CardContent className="p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted overflow-hidden shrink-0 border border-accent/20">
                          <Image src={`https://i.pravatar.cc/150?u=${i}`} alt={review.name} width={48} height={48} className="object-cover" />
                        </div>
                        <div>
                           <p className="font-black text-primary text-sm uppercase">{review.name}</p>
                           <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{review.city}</p>
                        </div>
                      </div>
                      <p className="text-slate-600 font-bold text-sm leading-relaxed italic">&quot;{review.text}&quot;</p>
                      <Badge variant="outline" className="rounded-full text-[8px] font-black uppercase tracking-widest px-3 py-1 border-primary/20">{review.type}</Badge>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-8">
               <CarouselPrevious className="static translate-y-0 h-10 w-10 border-primary text-primary" />
               <CarouselNext className="static translate-y-0 h-10 w-10 bg-primary text-white" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* 5. FINAL CTA BANNER - REFINED & COMPACTED */}
      <section className="py-24 relative overflow-hidden bg-background">
        <div className="container px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-10">
                <motion.div {...fadeInUp} className="space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-primary leading-tight font-heading uppercase">
                        INITIALIZE <span className="text-accent italic font-spiritual capitalize">SACRED VOYAGE</span>
                    </h2>
                    <p className="text-sm md:text-base text-slate-500 font-bold tracking-tight max-w-xl mx-auto uppercase leading-relaxed">
                        Ready to experience the magic of Devbhoomi? <br className="hidden md:block"/> Talk to our specialists today for a free custom itinerary.
                    </p>
                </motion.div>
                
                <div className="flex flex-col items-center gap-8">
                    <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-base bg-accent hover:bg-primary hover:text-white transition-all shadow-xl saffron-glow group active:scale-95">
                        <Link href="/contact" className="flex items-center gap-3">
                            🙏 REQUEST A FREE QUOTE <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> INSTANT SYNC</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> BEST RATE DATA</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> FREE ABORT</span>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
