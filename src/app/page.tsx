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
import { SearchFilters } from './search/SearchFilters';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen font-sans selection:bg-accent selection:text-white">
      
      {/* 1. HERO SECTION WITH VIDEO BACKGROUND */}
      <section className="relative h-screen min-h-[700px] w-full flex items-center justify-center overflow-hidden">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover scale-105"
        >
          <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27dc3699705027c11f581056489814560950d11&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-background" />
        
        <div className="container relative z-10 px-6 text-center">
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto space-y-8">
            <Badge className="bg-white/10 backdrop-blur-md text-accent border border-white/20 px-6 py-2 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] mb-4">
              ⚡ India's Most Loved Uttarakhand Specialist | 10,000+ Happy Pilgrims
            </Badge>
            
            <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-[0.85] font-heading uppercase">
              Discover <span className="text-accent italic font-spiritual capitalize">Devbhoomi</span> <br/> The Sacred Himalayas
            </h1>
            
            <p className="mt-6 text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
              Curated Char Dham Yatra, weekend getaways, trekking expeditions, and luxury stays in Nainital, Rishikesh & more.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <Button asChild size="lg" className="h-16 px-10 rounded-full font-bold text-lg bg-accent hover:bg-white hover:text-primary transition-all shadow-2xl group">
                <Link href="/tour-packages" className="flex items-center gap-3">
                  🕉️ Plan Your Pilgrimage <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-full font-bold text-lg border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm">
                <Link href="/search">🏕️ Explore Adventures</Link>
              </Button>
            </div>

            <div className="pt-12">
              <Suspense fallback={<div className="h-20 bg-white/10 rounded-full animate-pulse" />}>
                <div className="max-w-3xl mx-auto bg-white p-2 rounded-full shadow-2xl flex items-center overflow-hidden">
                  <div className="flex-1 px-6 text-left">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Where in Uttarakhand?</p>
                    <p className="text-slate-800 font-bold truncate">Kedarnath, Rishikesh, Auli...</p>
                  </div>
                  <Button asChild className="bg-primary hover:bg-accent rounded-full h-12 px-8 shrink-0">
                    <Link href="/search">Search Hub <ChevronRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </Suspense>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. UTTARAKHAND IN NUMBERS + PHOTO STRIP */}
      <section className="py-24 bg-white relative z-20 -mt-20">
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
                className="bg-background p-8 rounded-3xl border border-muted text-center space-y-2 hover:shadow-xl transition-all group"
              >
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-3xl font-bold tracking-tighter text-primary">{stat.val}</h4>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                <p className="text-xs font-medium text-slate-500">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="overflow-hidden py-4">
             <div className="flex gap-6 animate-marquee whitespace-nowrap">
                {[1,2,3,4,5,6,7,8].map((i) => (
                  <div key={i} className="relative w-64 h-48 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 group">
                    <Image 
                      src={`https://picsum.photos/seed/guest-moment-${i}/400/300`} 
                      alt="Guest Travel" 
                      fill 
                      unoptimized={true}
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full flex items-center gap-1.5 shadow-sm">
                      <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                      <span className="text-[10px] font-bold">{Math.floor(Math.random() * 500) + 100}</span>
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
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-accent font-bold uppercase tracking-[0.3em] text-[10px]">
                <Trophy className="h-4 w-4" /> Iconic Experiences
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-primary font-heading uppercase">Divine Nodes</h2>
              <p className="text-slate-500 font-medium">From sacred shrines to adventure hubs — find your perfect escape.</p>
            </div>
            <Button variant="link" asChild className="text-accent font-bold uppercase tracking-widest text-xs group">
              <Link href="/search" className="flex items-center">View All 25+ Destinations <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Kedarnath', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800', badge: 'Spiritual', desc: 'High-altitude Jyotirlinga' },
              { name: 'Rishikesh', img: 'https://images.unsplash.com/photo-1544735749-2e924378a839?auto=format&fit=crop&q=80&w=800', badge: 'Yoga & Rafting', desc: 'The Adventure Capital' },
              { name: 'Auli', img: 'https://images.unsplash.com/photo-1625219973832-1594916a048a?auto=format&fit=crop&q=80&w=800', badge: 'Winter Sports', desc: 'Ski Slopes of India' },
              { name: 'Nainital', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800', badge: 'Family Retreat', desc: 'The Lake District' }
            ].map((node, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                <Link href={`/search?city=${node.name}`}>
                  <Card className="group relative aspect-[3/4] overflow-hidden rounded-[2.5rem] border-0 shadow-2xl saffron-glow cursor-pointer">
                    <Image src={node.img} alt={node.name} fill unoptimized={true} className="object-cover transition-transform duration-2000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-accent text-accent-foreground border-0 font-bold text-[9px] px-4 py-1.5 tracking-widest rounded-full">{node.badge}</Badge>
                    </div>
                    <div className="absolute bottom-8 left-8 right-8 space-y-1">
                      <h3 className="text-3xl font-bold text-white tracking-tighter uppercase font-heading">{node.name}</h3>
                      <p className="text-white/70 text-xs font-medium">{node.desc}</p>
                      <div className="pt-4">
                         <span className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">Explore Node <ArrowRight className="h-3 w-3" /></span>
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
        <div className="container px-6 text-center space-y-12">
           <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-center gap-3 text-accent font-bold uppercase tracking-[0.3em] text-[10px]">
                <Video className="h-4 w-4" /> Visual Intelligence
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-primary font-heading uppercase leading-tight">Experience Uttarakhand Through Our Lens</h2>
           </div>
           
           <div className="relative aspect-video max-w-5xl mx-auto rounded-[3rem] overflow-hidden shadow-apple-deep group">
              <iframe 
                className="w-full h-full" 
                src="https://www.youtube.com/embed/S2Z790Q-t_A?autoplay=0&controls=0&mute=1&loop=1" 
                title="Uttarakhand Travel Film"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:opacity-0 transition-opacity pointer-events-none">
                 <div className="h-20 w-20 bg-accent text-white rounded-full flex items-center justify-center shadow-2xl scale-110">
                    <Play className="h-8 w-8 fill-current" />
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-12">
              <div className="flex items-center gap-6 p-6 bg-background rounded-3xl border border-muted hover:shadow-xl cursor-pointer group">
                 <div className="relative h-20 w-32 rounded-xl overflow-hidden shrink-0">
                    <Image src="https://images.unsplash.com/photo-1544735749-2e924378a839?auto=format&fit=crop&q=80&w=200" alt="Rafting" fill unoptimized={true} className="object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Play size={16} color="white" /></div>
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-bold text-primary">Rafting in Rishikesh</p>
                    <p className="text-[10px] font-medium text-slate-500">by Rajesh & Group</p>
                 </div>
              </div>
              <div className="flex items-center gap-6 p-6 bg-background rounded-3xl border border-muted hover:shadow-xl cursor-pointer group">
                 <div className="relative h-20 w-32 rounded-xl overflow-hidden shrink-0">
                    <Image src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=200" alt="Kedarnath" fill unoptimized={true} className="object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Play size={16} color="white" /></div>
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-bold text-primary">Kedarnath Yatra</p>
                    <p className="text-[10px] font-medium text-slate-500">by Priya Family</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 5. CUSTOMER REVIEWS SECTION */}
      <section className="py-32 bg-background overflow-hidden">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-8">
            <div className="space-y-3">
               <div className="flex items-center gap-3 text-accent font-bold uppercase tracking-[0.3em] text-[10px]">
                  <MessageSquare className="h-4 w-4" /> Guest Protocols
               </div>
               <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-primary font-heading uppercase">What Our Travelers Say</h2>
            </div>
            <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-3xl shadow-xl border border-muted">
               <div className="flex text-amber-400"><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /></div>
               <div className="h-8 w-px bg-muted" />
               <p className="text-sm font-bold text-primary">4.9 | 980+ Reviews</p>
            </div>
          </div>

          <Carousel className="w-full">
            <CarouselContent className="-ml-8">
              {[
                { name: 'Meera Sharma', city: 'Delhi', text: 'The Char Dham package was seamless. They managed everything — permits, helicopter booking, even oxygen cylinders. Highly recommend!', type: 'Char Dham Yatra', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=400' },
                { name: 'Amit Gupta', city: 'Mumbai', text: 'Rishikesh rafting and camping was mind-blowing. The local guides are so knowledgeable and caring. Best adventure trip ever.', type: 'Adventure', img: 'https://images.unsplash.com/photo-1544735749-2e924378a839?auto=format&fit=crop&q=80&w=400' },
                { name: 'Rohan Joshi', city: 'Pune', text: 'Spent 5 days in Auli. The hotel views were exactly as promised. The transport was reliable even in heavy snow conditions.', type: 'Winter Escape', img: 'https://images.unsplash.com/photo-1625219973832-1594916a048a?auto=format&fit=crop&q=80&w=400' },
              ].map((review, i) => (
                <CarouselItem key={i} className="pl-8 md:basis-1/2 lg:basis-1/3">
                  <Card className="rounded-[2.5rem] border-0 shadow-apple-deep overflow-hidden h-full">
                    <CardContent className="p-10 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-muted border-2 border-accent/20 overflow-hidden shrink-0">
                          <Image src={`https://i.pravatar.cc/150?u=${i}`} alt={review.name} width={56} height={56} className="object-cover" />
                        </div>
                        <div>
                           <p className="font-bold text-primary">{review.name}</p>
                           <p className="text-[10px] font-black uppercase text-slate-400">{review.city}</p>
                        </div>
                      </div>
                      <div className="flex text-amber-400 gap-1"><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /></div>
                      <p className="text-slate-600 font-medium leading-relaxed italic">&quot;{review.text}&quot;</p>
                      <div className="flex justify-between items-center pt-4 border-t border-muted">
                        <Badge variant="outline" className="rounded-full text-[9px] font-bold uppercase tracking-widest">{review.type}</Badge>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-green-600 uppercase"><CheckCircle2 className="h-3.5 w-3.5" /> Verified Guest</div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-12">
               <CarouselPrevious className="static translate-y-0 h-12 w-12 border-primary text-primary" />
               <CarouselNext className="static translate-y-0 h-12 w-12 bg-primary text-white" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* 6. WHY CHOOSE US (USP SECTION) */}
      <section className="py-32 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Image src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920" fill alt="Texture" className="object-cover" unoptimized={true} />
        </div>
        <div className="container px-6 relative z-10">
          <div className="text-center mb-20 space-y-4">
             <div className="flex items-center justify-center gap-3 text-accent font-bold uppercase tracking-[0.3em] text-[10px]">
                <ShieldCheck className="h-4 w-4" /> Integrity Report
             </div>
             <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white font-heading uppercase">Why Northern Harrier?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
             {[
               { title: 'Local Experts', desc: 'Guides born and brought up in Garhwal & Kumaon peaks.', icon: MapPin },
               { title: 'Best Stays', desc: 'Handpicked hotels, homestays, and high-altitude camps.', icon: Trophy },
               { title: 'Reliable Nodes', desc: 'Premium tempo travellers & rugged SUVs for hill nodes.', icon: Users },
               { title: '24/7 Support', desc: 'Dedicated helpline active even in the most remote areas.', icon: MessageSquare }
             ].map((usp, i) => (
               <div key={i} className="space-y-6 text-center md:text-left">
                  <div className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center mb-6">
                    <usp.icon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight uppercase">{usp.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed font-medium">{usp.desc}</p>
               </div>
             ))}
          </div>
          
          <div className="mt-24 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="flex items-center gap-6">
                <div className="h-20 w-20 bg-accent text-primary rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl saffron-glow">NH</div>
                <div className="space-y-1">
                   <p className="text-lg font-bold uppercase tracking-tight">Official Partner</p>
                   <p className="text-[10px] font-black uppercase text-accent tracking-[0.3em]">Uttarakhand Tourism Council</p>
                </div>
             </div>
             <div className="flex gap-10 items-center grayscale opacity-50">
                <span className="font-black text-2xl tracking-tighter">RAZORPAY</span>
                <span className="font-black text-2xl italic tracking-tighter">UPI</span>
                <span className="font-black text-2xl tracking-tighter">VISA</span>
             </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA BANNER */}
      <section className="py-48 relative overflow-hidden bg-white">
        <div className="container px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-12">
                <motion.div {...fadeInUp} className="space-y-6">
                    <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-primary leading-[0.9] font-heading uppercase">
                        Initialize Your <br className="hidden md:block"/> <span className="text-accent italic font-spiritual capitalize">Sacred Voyage</span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-500 font-medium tracking-wide max-w-2xl mx-auto">
                        Ready to experience the magic of Devbhoomi? Talk to our Uttarakhand experts today for a free custom itinerary.
                    </p>
                </motion.div>
                
                <div className="flex flex-col items-center gap-8">
                    <Button asChild size="lg" className="h-20 px-16 rounded-full font-bold text-xl bg-accent hover:bg-primary hover:text-white transition-all shadow-2xl saffron-glow group">
                        <Link href="/contact" className="flex items-center gap-4">
                            🙏 Request a Free Quote <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                        </Link>
                    </Button>
                    <div className="flex flex-wrap items-center justify-center gap-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Instant Confirmation</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Best Price Guarantee</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Free Cancellation</span>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* REMOVED DUPLICATE WHATSAPP BUTTON - NOW MANAGED IN layout.tsx */}
    </div>
  );
}
