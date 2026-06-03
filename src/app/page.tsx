
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
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen font-sans selection:bg-accent selection:text-white">
      
      {/* 1. HERO SECTION WITH TEMPLE BACKGROUND */}
      <section className="relative h-screen min-h-[750px] w-full flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.pexels.com/photos/18636614/pexels-photo-18636614.jpeg"
          alt="Devbhoomi Uttarakhand Temple"
          fill
          priority
          className="object-cover scale-105"
          unoptimized
        />
        {/* Deeper gradient for superior text readability on mobile and desktop */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background/90" />
        
        <div className="container relative z-10 px-6 text-center">
          <motion.div {...fadeInUp} className="max-w-5xl mx-auto space-y-8">
            <Badge className="bg-accent/90 backdrop-blur-sm text-accent-foreground border-0 px-8 py-3 rounded-full font-black uppercase tracking-[0.2em] text-[10px] mb-4 shadow-2xl saffron-glow animate-in fade-in zoom-in duration-1000">
              ⚡ INDIA'S MOST LOVED UTTARAKHAND SPECIALIST | 10,000+ HAPPY PILGRIMS
            </Badge>
            
            <div className="space-y-4">
                <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.8] font-heading uppercase drop-shadow-2xl">
                    DISCOVER <br className="hidden md:block" /> <span className="text-accent italic font-spiritual capitalize drop-shadow-none">Devbhoomi</span>
                </h1>
                <p className="text-2xl md:text-4xl font-bold text-white/90 tracking-[0.2em] uppercase font-heading">
                    THE SACRED HIMALAYAS
                </p>
            </div>
            
            <p className="mt-8 text-lg md:text-2xl text-white/80 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Curated Char Dham Yatra, weekend getaways, trekking expeditions, and luxury stays in Nainital, Rishikesh & more.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
              <Button asChild size="lg" className="h-20 px-12 rounded-full font-black text-xl bg-accent hover:bg-white hover:text-primary transition-all shadow-2xl group active:scale-95">
                <Link href="/tour-packages" className="flex items-center gap-4">
                  🕉️ PLAN YOUR PILGRIMAGE <ArrowRight className="ml-1 h-6 w-6 transition-transform group-hover:translate-x-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-20 px-12 rounded-full font-black text-xl border-2 border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm transition-all">
                <Link href="/search">🏕️ EXPLORE ADVENTURES</Link>
              </Button>
            </div>

            <div className="pt-16 max-w-4xl mx-auto">
              <Suspense fallback={<div className="h-20 bg-white/10 rounded-full animate-pulse" />}>
                <div className="bg-white/95 backdrop-blur-md p-3 rounded-full shadow-3xl flex items-center overflow-hidden border border-white/20">
                  <div className="flex-1 px-8 text-left hidden sm:block">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Node</p>
                    <p className="text-slate-800 font-black text-lg truncate">Where in Devbhoomi?</p>
                  </div>
                  <Button asChild className="bg-primary hover:bg-accent rounded-full h-14 px-12 shrink-0 font-black text-sm uppercase tracking-widest">
                    <Link href="/search">INITIALIZE SEARCH <ChevronRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </Suspense>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. UTTARAKHAND IN NUMBERS + PHOTO STRIP */}
      <section className="py-24 bg-white relative z-20 -mt-20 rounded-t-[4rem]">
        <div className="container px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              { label: 'Pilgrimage Sites', val: '15+', sub: 'Char Dham, Panch Kedar', icon: Mountain },
              { label: 'Trekking Routes', val: '50+', sub: 'Roof of India Trails', icon: Compass },
              { label: 'Guest Reviews', val: '4.9/5', sub: '980+ Verified Stories', icon: Star },
              { label: 'Photos Shared', val: '2000+', sub: 'Real Guest Moments', icon: Video },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                {...fadeInUp} 
                transition={{ delay: i * 0.1 }}
                className="bg-background p-8 rounded-[2.5rem] border border-muted text-center space-y-2 hover:shadow-2xl transition-all group"
              >
                <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-7 w-7 text-primary" />
                </div>
                <h4 className="text-4xl font-black tracking-tighter text-primary uppercase font-heading">{stat.val}</h4>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                <p className="text-xs font-bold text-slate-500">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="overflow-hidden py-8">
             <div className="flex gap-8 animate-marquee whitespace-nowrap">
                {[
                  "https://images.pexels.com/photos/12321669/pexels-photo-12321669.jpeg?auto=compress&cs=tinysrgb&w=600",
                  "https://images.pexels.com/photos/16090413/pexels-photo-16090413.jpeg?auto=compress&cs=tinysrgb&w=600",
                  "https://images.pexels.com/photos/4143599/pexels-photo-4143599.jpeg?auto=compress&cs=tinysrgb&w=600",
                  "https://images.pexels.com/photos/14149541/pexels-photo-14149541.jpeg?auto=compress&cs=tinysrgb&w=600",
                  "https://images.pexels.com/photos/37618361/pexels-photo-37618361.jpeg?auto=compress&cs=tinysrgb&w=600",
                  "https://images.pexels.com/photos/12321669/pexels-photo-12321669.jpeg?auto=compress&cs=tinysrgb&w=600"
                ].map((url, i) => (
                  <div key={i} className="relative w-72 h-56 rounded-3xl overflow-hidden shadow-xl flex-shrink-0 group border border-black/5">
                    <Image 
                      src={url} 
                      alt="Uttarakhand Guest Moment" 
                      fill 
                      unoptimized={true}
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                      <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                      <span className="text-[10px] font-black">{Math.floor(Math.random() * 500) + 100}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED DESTINATIONS GRID */}
      <section className="py-32 bg-background">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-accent font-black uppercase tracking-[0.4em] text-[10px]">
                <Trophy className="h-4 w-4" /> Iconic Node Access
              </div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-primary font-heading uppercase leading-none">Divine Hubs</h2>
              <p className="text-slate-500 font-bold text-lg">From sacred peaks to high-adventure ghats.</p>
            </div>
            <Button variant="link" asChild className="text-accent font-black uppercase tracking-widest text-xs group">
              <Link href="/search" className="flex items-center gap-2">View Global Grid <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { name: 'Kedarnath', img: 'https://images.pexels.com/photos/16090413/pexels-photo-16090413.jpeg?auto=compress&cs=tinysrgb&w=800', badge: 'Spiritual Peak', desc: 'High-altitude Jyotirlinga' },
              { name: 'Rishikesh', img: 'https://images.pexels.com/photos/37618361/pexels-photo-37618361.jpeg?auto=compress&cs=tinysrgb&w=800', badge: 'Yoga & Raft', desc: 'The Adventure Capital' },
              { name: 'Auli', img: 'https://images.pexels.com/photos/14149541/pexels-photo-14149541.jpeg?auto=compress&cs=tinysrgb&w=800', badge: 'Ski Node', desc: 'Snow Slopes of India' },
              { name: 'Nainital', img: 'https://images.pexels.com/photos/4143599/pexels-photo-4143599.jpeg?auto=compress&cs=tinysrgb&w=800', badge: 'Family Retreat', desc: 'The Lake District' }
            ].map((node, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                <Link href={`/search?city=${node.name}`}>
                  <Card className="group relative aspect-[3/4.5] overflow-hidden rounded-[3rem] border-0 shadow-3xl cursor-pointer bg-muted">
                    <Image src={node.img} alt={node.name} fill unoptimized={true} className="object-cover transition-transform duration-2000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-transparent to-transparent opacity-70" />
                    <div className="absolute top-8 left-8">
                      <Badge className="bg-accent text-accent-foreground border-0 font-black text-[9px] px-5 py-2 tracking-widest rounded-full shadow-xl uppercase">{node.badge}</Badge>
                    </div>
                    <div className="absolute bottom-10 left-10 right-10 space-y-2">
                      <h3 className="text-4xl font-black text-white tracking-tighter uppercase font-heading">{node.name}</h3>
                      <p className="text-white/80 text-xs font-bold uppercase tracking-widest">{node.desc}</p>
                      <div className="pt-6">
                         <span className="text-[10px] font-black uppercase text-accent tracking-[0.3em] flex items-center gap-3 group-hover:translate-x-3 transition-transform">Initalize Node <ArrowRight className="h-4 w-4" /></span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. VIDEO SHOWREEL SECTION */}
      <section className="py-32 bg-white">
        <div className="container px-6 text-center space-y-16">
           <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-center gap-3 text-accent font-black uppercase tracking-[0.4em] text-[10px]">
                <Video className="h-4 w-4" /> Visual Intelligence Log
              </div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-primary font-heading uppercase leading-[0.9]">Experience Devbhoomi Through Our Lens</h2>
           </div>
           
           <div className="relative aspect-video max-w-6xl mx-auto rounded-[4rem] overflow-hidden shadow-apple-deep group border-8 border-background luxury-shadow bg-slate-900">
              <iframe 
                className="w-full h-full" 
                src="https://www.youtube.com/embed/S2Z790Q-t_A?autoplay=0&controls=1&mute=0&loop=1" 
                title="Uttarakhand Travel Film"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
              <div className="flex items-center gap-8 p-8 bg-background rounded-[2.5rem] border border-muted hover:shadow-2xl cursor-pointer group transition-all">
                 <div className="relative h-24 w-40 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                    <Image src="https://images.pexels.com/photos/37618361/pexels-photo-37618361.jpeg?auto=compress&cs=tinysrgb&w=200" alt="Rafting" fill unoptimized={true} className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all"><Play size={20} color="white" fill="white" /></div>
                 </div>
                 <div className="text-left">
                    <p className="text-lg font-black text-primary uppercase tracking-tight">Rafting Protocol</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ganga Rapids, Rishikesh</p>
                 </div>
              </div>
              <div className="flex items-center gap-8 p-8 bg-background rounded-[2.5rem] border border-muted hover:shadow-2xl cursor-pointer group transition-all">
                 <div className="relative h-24 w-40 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                    <Image src="https://images.pexels.com/photos/16090413/pexels-photo-16090413.jpeg?auto=compress&cs=tinysrgb&w=200" alt="Kedarnath" fill unoptimized={true} className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all"><Play size={20} color="white" fill="white" /></div>
                 </div>
                 <div className="text-left">
                    <p className="text-lg font-black text-primary uppercase tracking-tight">Temple Sync</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Kedarnath Sanctuary</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 5. CUSTOMER REVIEWS SECTION */}
      <section className="py-32 bg-background overflow-hidden">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-10">
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-accent font-black uppercase tracking-[0.4em] text-[10px]">
                  <MessageSquare className="h-4 w-4" /> Guest Protocols
               </div>
               <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-primary font-heading uppercase leading-none">The Traveler <br/> Network</h2>
            </div>
            <div className="flex items-center gap-6 bg-white px-10 py-6 rounded-[2.5rem] shadow-3xl border border-muted">
               <div className="flex text-amber-400 gap-1"><Star size={24} fill="currentColor" /><Star size={24} fill="currentColor" /><Star size={24} fill="currentColor" /><Star size={24} fill="currentColor" /><Star size={24} fill="currentColor" /></div>
               <div className="h-10 w-px bg-muted" />
               <p className="text-base font-black text-primary uppercase tracking-widest">4.9 Average</p>
            </div>
          </div>

          <Carousel className="w-full">
            <CarouselContent className="-ml-10">
              {[
                { name: 'Meera Sharma', city: 'Delhi', text: 'The Char Dham package was seamless. They managed everything — permits, helicopter booking, even oxygen cylinders. Highly recommend!', type: 'Char Dham Yatra' },
                { name: 'Amit Gupta', city: 'Mumbai', text: 'Rishikesh rafting and camping was mind-blowing. The local guides are so knowledgeable and caring. Best adventure trip ever.', type: 'Adventure' },
                { name: 'Rohan Joshi', city: 'Pune', text: 'Spent 5 days in Auli. The hotel views were exactly as promised. The transport was reliable even in heavy snow conditions.', type: 'Winter Escape' },
              ].map((review, i) => (
                <CarouselItem key={i} className="pl-10 md:basis-1/2 lg:basis-1/3">
                  <Card className="rounded-[3rem] border-0 shadow-apple-deep overflow-hidden h-full group hover:shadow-3xl transition-all duration-700">
                    <CardContent className="p-12 space-y-8">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-full bg-muted border-2 border-accent/20 overflow-hidden shrink-0 shadow-xl">
                          <Image src={`https://i.pravatar.cc/150?u=${i}`} alt={review.name} width={64} height={64} className="object-cover" />
                        </div>
                        <div>
                           <p className="font-black text-primary uppercase tracking-tight text-lg">{review.name}</p>
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">{review.city}</p>
                        </div>
                      </div>
                      <p className="text-slate-600 font-bold text-lg leading-relaxed italic">&quot;{review.text}&quot;</p>
                      <div className="flex justify-between items-center pt-8 border-t border-muted">
                        <Badge variant="outline" className="rounded-full text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 border-primary/20">{review.type}</Badge>
                        <div className="flex items-center gap-2 text-[9px] font-black text-green-600 uppercase tracking-widest"><CheckCircle2 className="h-4 w-4" /> Verified Node</div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-6 mt-16">
               <CarouselPrevious className="static translate-y-0 h-14 w-14 border-primary text-primary hover:bg-primary hover:text-white" />
               <CarouselNext className="static translate-y-0 h-14 w-14 bg-primary text-white hover:bg-accent hover:border-accent" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* 6. WHY CHOOSE US (USP SECTION) */}
      <section className="py-32 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none grayscale">
            <Image src="https://images.pexels.com/photos/14149541/pexels-photo-14149541.jpeg?auto=compress&cs=tinysrgb&w=1920" fill alt="Texture" className="object-cover" unoptimized={true} />
        </div>
        <div className="container px-6 relative z-10">
          <div className="text-center mb-24 space-y-6">
             <div className="flex items-center justify-center gap-3 text-accent font-black uppercase tracking-[0.4em] text-[10px]">
                <ShieldCheck className="h-5 w-5" /> Integrity Protocol
             </div>
             <h2 className="text-4xl md:text-8xl font-black tracking-tighter text-white font-heading uppercase leading-none">Elite Himalayan Specialists</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
             {[
               { title: 'Local Expertise', desc: 'Agents born and raised in high-altitude Garhwal & Kumaon peaks.', icon: MapPin },
               { title: 'Premium Stays', desc: 'Handpicked elite resorts, authentic homestays, and verified camps.', icon: Trophy },
               { title: 'Rugged Logistics', desc: 'Premium tempo travellers & heavy-duty SUVs for safe mountain transit.', icon: Users },
               { title: 'Node Support', desc: 'Dedicated 24/7 helpline active even in the deepest Himalayan valleys.', icon: MessageSquare }
             ].map((usp, i) => (
               <div key={i} className="space-y-8 text-center md:text-left group">
                  <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:bg-accent group-hover:text-primary transition-all shadow-xl">
                    <usp.icon className="h-10 w-10 text-accent group-hover:text-primary transition-all" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight uppercase font-heading">{usp.title}</h3>
                  <p className="text-white/60 text-base leading-relaxed font-bold uppercase tracking-widest">{usp.desc}</p>
               </div>
             ))}
          </div>
          
          <div className="mt-32 pt-16 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-12">
             <div className="flex items-center gap-10">
                <div className="h-24 w-24 bg-accent text-primary rounded-full flex items-center justify-center text-3xl font-black shadow-2xl">NH</div>
                <div className="space-y-1">
                   <p className="text-2xl font-black uppercase tracking-tighter">Official Partner</p>
                   <p className="text-[11px] font-black uppercase text-accent tracking-[0.5em]">Uttarakhand Tourism Liaison</p>
                </div>
             </div>
             <div className="flex gap-12 items-center grayscale opacity-40 text-white font-black text-2xl tracking-tighter uppercase">
                <span>RAZORPAY</span>
                <span>UPI Node</span>
                <span>Visa Elite</span>
             </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA BANNER */}
      <section className="py-56 relative overflow-hidden bg-white">
        <div className="container px-6 text-center">
            <div className="max-w-5xl mx-auto space-y-16">
                <motion.div {...fadeInUp} className="space-y-8">
                    <h2 className="text-5xl md:text-[10rem] font-black tracking-tighter text-primary leading-[0.8] font-heading uppercase">
                        INITIALIZE <br className="hidden md:block"/> <span className="text-accent italic font-spiritual capitalize">SACRED VOYAGE</span>
                    </h2>
                    <p className="text-xl md:text-3xl text-slate-500 font-bold tracking-tight max-w-3xl mx-auto uppercase">
                        Ready to experience the magic of Devbhoomi? Talk to our specialists today for a free custom itinerary.
                    </p>
                </motion.div>
                
                <div className="flex flex-col items-center gap-12">
                    <Button asChild size="lg" className="h-24 px-20 rounded-full font-black text-2xl bg-accent hover:bg-primary hover:text-white transition-all shadow-3xl saffron-glow group active:scale-95">
                        <Link href="/contact" className="flex items-center gap-6">
                            🙏 REQUEST A FREE QUOTE <ArrowRight className="h-8 w-8 transition-transform group-hover:translate-x-3" />
                        </Link>
                    </Button>
                    <div className="flex flex-wrap items-center justify-center gap-10 text-[11px] font-black uppercase text-slate-400 tracking-[0.4em]">
                        <span className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-600" /> INSTANT SYNC</span>
                        <span className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-600" /> BEST RATE DATA</span>
                        <span className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-600" /> FREE ABORT</span>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}

