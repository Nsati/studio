'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowRight, 
  Mountain, 
  Compass, 
  Sparkles, 
  Search,
  ChevronRight,
  Wifi,
  Calendar,
  Users,
  MapPin,
  Star,
  Quote,
  CheckCircle2,
  Phone,
  MessageCircle,
  Clock,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Northern Harrier Elite Landing Page.
 * Premium Dark Navy + Gold aesthetic for luxury Himalayan expeditions.
 */

export default function LandingPage() {
  const featuredExpeditions = [
    { 
      id: 'kedarnath-luxury', 
      name: 'Sacred Kedarnath Yatra', 
      duration: '4N/5D', 
      price: '45,000', 
      difficulty: 'Moderate',
      image: 'https://images.unsplash.com/photo-1693153318626-682ef3712136?auto=format&fit=crop&q=80&w=800' 
    },
    { 
      id: 'auli-ski-expedition', 
      name: 'Auli Winter Expedition', 
      duration: '5N/6D', 
      price: '38,000', 
      difficulty: 'Adventure',
      image: 'https://images.unsplash.com/photo-1515442597003-a25e0a78dae9?auto=format&fit=crop&q=80&w=800' 
    },
    { 
      id: 'valley-of-flowers', 
      name: 'Valley of Flowers Trek', 
      duration: '6N/7D', 
      price: '32,500', 
      difficulty: 'Active',
      image: 'https://images.unsplash.com/photo-1724118136076-5b0921aa529c?auto=format&fit=crop&q=80&w=800' 
    }
  ];

  const stats = [
    { label: 'Happy Travelers', value: '5000+' },
    { label: 'Expeditions', value: '150+' },
    { label: 'Destinations', value: '25+' },
    { label: 'Satisfaction', value: '98%' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary selection:text-background">
      
      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/916399902725" 
        target="_blank" 
        className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all group animate-bounce"
      >
        <MessageCircle className="h-7 w-7" />
        <span className="absolute right-full mr-4 bg-white text-black px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
          Concierge Support
        </span>
      </a>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] w-full flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920" 
          alt="Cinematic Himalayas" 
          fill 
          priority
          unoptimized={true}
          className="object-cover brightness-[0.4]" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        
        <div className="container relative z-10 px-6 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 glass-card px-6 py-2 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
              <ShieldCheck className="h-4 w-4" /> Elite Himalayan Standards
            </div>
            <h1 className="text-5xl md:text-[8rem] text-white font-black leading-[0.8] uppercase tracking-tighter">
              Explore the <br /> <span className="text-primary italic font-heading font-light lowercase">Sacred</span> Himalayas
            </h1>
            <p className="text-lg md:text-2xl text-white/60 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight">
              Curated Pilgrimages, Luxury Expeditions, and Unforgettable Mountain Journeys. <br className="hidden md:block"/>
              Experience the Devbhumi like never before.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-6xl mx-auto w-full"
          >
            <div className="glass-card p-2 rounded-[2rem] shadow-2xl flex flex-col lg:flex-row gap-2">
                <div className="flex-1 bg-white/5 h-20 flex items-center px-8 gap-4 rounded-2xl group border border-white/5 hover:border-primary/30 transition-all">
                    <MapPin className="h-6 w-6 text-primary" />
                    <div className="flex flex-col items-start flex-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Destination</span>
                        <input className="bg-transparent w-full font-black text-white focus:outline-none placeholder:text-white/20" placeholder="Where to?" />
                    </div>
                </div>
                <div className="flex-1 bg-white/5 h-20 flex items-center px-8 gap-4 rounded-2xl group border border-white/5 hover:border-primary/30 transition-all">
                    <Calendar className="h-6 w-6 text-primary" />
                    <div className="flex flex-col items-start flex-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Travel Date</span>
                        <span className="font-black text-white/40">Select Date</span>
                    </div>
                </div>
                <div className="flex-[0.7] bg-white/5 h-20 flex items-center px-8 gap-4 rounded-2xl group border border-white/5 hover:border-primary/30 transition-all">
                    <Users className="h-6 w-6 text-primary" />
                    <div className="flex flex-col items-start flex-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Travelers</span>
                        <span className="font-black text-white">2 Guests</span>
                    </div>
                </div>
                <Button asChild className="h-20 bg-primary hover:bg-primary/90 text-background rounded-2xl px-12 text-xl font-black shadow-lg transition-transform active:scale-95">
                    <Link href="/search">Search Expeditions</Link>
                </Button>
            </div>
            
            <div className="flex justify-center gap-8 mt-8">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Verified Safety
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Luxury Transport
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Elite Guides
                </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Discover</span>
            <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </section>

      {/* Featured Expeditions */}
      <section className="py-32 container px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border border-primary/20 font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] text-[10px]">Curated Journeys</Badge>
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase leading-[0.9]">Featured <br/><span className="text-primary italic font-heading font-light lowercase">Expeditions</span></h2>
            </div>
            <Button asChild variant="outline" className="h-14 rounded-full px-8 border-primary/20 hover:bg-primary hover:text-background font-black uppercase tracking-widest text-xs">
                <Link href="/tour-packages">View All Journeys <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredExpeditions.map((tour, i) => (
            <motion.div
                key={tour.id}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.5 }}
                className="group relative"
            >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/5">
                    <Image 
                        src={tour.image} 
                        alt={tour.name} 
                        fill 
                        className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                    
                    <div className="absolute top-8 left-8 flex flex-col gap-2">
                        <Badge className="bg-primary text-background border-0 font-black px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest shadow-xl">
                            {tour.duration}
                        </Badge>
                        <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-black px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                            {tour.difficulty}
                        </Badge>
                    </div>

                    <div className="absolute bottom-10 left-10 right-10 space-y-4">
                        <h3 className="text-3xl text-white font-black tracking-tight leading-none uppercase">{tour.name}</h3>
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div>
                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">starting from</p>
                                <p className="text-2xl font-black text-white">₹{tour.price}</p>
                            </div>
                            <Button asChild className="h-12 w-12 rounded-full p-0 bg-primary text-background hover:scale-110 transition-all shadow-xl">
                                <Link href={`/tour-packages/${tour.id}`}><ChevronRight className="h-6 w-6" /></Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-32 bg-slate-900/50">
        <div className="container px-6">
            <div className="max-w-4xl mx-auto text-center mb-24 space-y-6">
                <Badge className="bg-primary text-background font-black uppercase tracking-[0.4em] px-8 py-2 rounded-full text-[10px]">The Harrier Standard</Badge>
                <h2 className="text-6xl md:text-[5rem] font-black text-white tracking-tighter leading-[0.85] uppercase">Engineered For <br/><span className="text-primary italic font-heading font-light lowercase">Excellence</span></h2>
                <p className="text-xl text-white/40 font-medium leading-relaxed max-w-2xl mx-auto">Beyond just travel. We curate elite experiences with verified safety and world-class hospitality.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { icon: ShieldCheck, title: "Verified Safety", desc: "Every route and property strictly audited for mountain safety protocols." },
                    { icon: Award, title: "Elite Hospitality", desc: "Handpicked luxury properties offering the finest Himalayan comfort." },
                    { icon: Compass, title: "Expert Guides", desc: "Professional mountaineers and local scholars leading every expedition." },
                    { icon: Clock, title: "24/7 Concierge", desc: "Round-the-clock live support for weather, roads, and personalized needs." },
                    { icon: Wifi, title: "High-Speed Access", desc: "Selected properties with verified high-speed connectivity even in remote hills." },
                    { icon: Users, title: "Local Intel", desc: "Deep-rooted connections ensuring the most authentic Himalayan insights." }
                ].map((item, i) => (
                    <div key={i} className="group p-10 glass-card rounded-[2.5rem] hover:bg-primary transition-all duration-700 hover:-translate-y-2">
                        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-background transition-colors">
                            <item.icon className="h-8 w-8 text-primary group-hover:text-primary" />
                        </div>
                        <h4 className="text-xl font-black uppercase tracking-widest mb-4 group-hover:text-background leading-tight">{item.title}</h4>
                        <p className="text-sm text-white/40 group-hover:text-background/60 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-32 container px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-5 pointer-events-none">
            <Mountain className="h-full w-full text-primary" strokeWidth={0.1} />
        </div>
        
        <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/3 space-y-8">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] text-[10px]">The Process</Badge>
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase leading-[0.9]">Your Path <br/> To The <span className="text-primary italic font-heading font-light lowercase">Peaks</span></h2>
                <p className="text-white/40 font-medium text-lg leading-relaxed">A seamless, expert-led consultation process from initial dream to final descent.</p>
                <Button className="h-16 px-10 rounded-full bg-primary text-background font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                    Start Consultation
                </Button>
            </div>

            <div className="flex-1 space-y-12">
                {[
                    { step: '01', title: 'Choose Expedition', desc: 'Select from our curated list of elite Himalayan journeys or request a custom itinerary.' },
                    { step: '02', title: 'Expert Consultation', desc: 'Connect with our scholars and mountaineers to refine your journey details.' },
                    { step: '03', title: 'Secure Booking', desc: 'Reserve your spot via our hardened payment gateway with flexible split-pay options.' },
                    { step: '04', title: 'Live Expeditions', desc: 'Travel with elite support, real-time safety alerts, and premium hospitality.' }
                ].map((item, i) => (
                    <div key={i} className="flex gap-8 group">
                        <div className="text-4xl font-black text-primary/20 group-hover:text-primary transition-colors leading-none">{item.step}</div>
                        <div className="space-y-2 pb-12 border-l-2 border-white/5 pl-8 group-last:border-0 relative">
                            <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-primary group-hover:scale-150 transition-transform" />
                            <h4 className="text-2xl font-black text-white uppercase tracking-tight">{item.title}</h4>
                            <p className="text-white/40 text-sm font-medium leading-relaxed max-w-md">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Masonry Destinations */}
      <section className="py-32 bg-slate-900/50">
        <div className="container px-6">
            <div className="text-center mb-24 space-y-6">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] text-[10px]">Prime Locations</Badge>
                <h2 className="text-5xl md:text-8xl font-black text-white uppercase leading-[0.85] tracking-tighter">Iconic <span className="text-primary italic font-heading font-light lowercase">Destinations</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { name: 'Kedarnath', size: 'md:col-span-2 md:row-span-2', img: 'https://images.unsplash.com/photo-1693153318626-682ef3712136?auto=format&fit=crop&q=80&w=800' },
                    { name: 'Badrinath', size: 'md:col-span-2', img: 'https://images.unsplash.com/photo-1724118136076-5b0921aa529c?auto=format&fit=crop&q=80&w=800' },
                    { name: 'Munsiyari', size: 'md:col-span-1', img: 'https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&q=80&w=800' },
                    { name: 'Valley of Flowers', size: 'md:col-span-1', img: 'https://images.unsplash.com/photo-1515442597003-a25e0a78dae9?auto=format&fit=crop&q=80&w=800' }
                ].map((dest, i) => (
                    <div key={i} className={cn("relative overflow-hidden rounded-[2.5rem] group min-h-[300px]", dest.size)}>
                        <Image 
                            src={dest.img} 
                            alt={dest.name} 
                            fill 
                            className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-10 left-10">
                            <h4 className="text-3xl text-white font-black uppercase tracking-tighter">{dest.name}</h4>
                            <Button variant="link" className="p-0 h-auto text-primary font-black uppercase tracking-widest text-[10px] mt-2 group-hover:translate-x-2 transition-transform">
                                Explore <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-24 border-y border-white/5">
        <div className="container px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                {stats.map((stat, i) => (
                    <div key={i} className="text-center space-y-2">
                        <p className="text-5xl md:text-7xl font-black text-primary tracking-tighter">{stat.value}</p>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 container px-6">
        <div className="max-w-5xl mx-auto glass-card rounded-[3rem] p-12 md:p-24 relative overflow-hidden">
            <Quote className="absolute -top-10 -left-10 h-64 w-64 text-primary/5 pointer-events-none" />
            <div className="relative z-10 text-center space-y-10">
                <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-primary text-primary" />)}
                </div>
                <h3 className="text-2xl md:text-4xl font-heading font-light italic text-white/90 leading-relaxed">
                    "Northern Harrier doesn't just plan a trip; they orchestrate a spiritual symphony. The attention to detail and verified safety protocols in Kedarnath were world-class."
                </h3>
                <div className="flex flex-col items-center gap-4">
                    <div className="h-20 w-20 rounded-full border-2 border-primary p-1">
                        <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" alt="Client" width={80} height={80} className="rounded-full object-cover h-full w-full" />
                    </div>
                    <div>
                        <p className="text-lg font-black text-white uppercase tracking-widest">Rahul Deshmukh</p>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Himalayan Explorer</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 container px-6">
        <div className="relative rounded-[4rem] overflow-hidden bg-primary p-16 md:p-32 text-center space-y-12 luxury-shadow">
            <Image 
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1920" 
              alt="Final CTA" 
              fill 
              className="object-cover brightness-[0.2]" 
            />
            <div className="relative z-10 space-y-8">
                <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85]">Ready For Your <br/> Next <span className="text-primary italic font-heading font-light lowercase">Expedition?</span></h2>
                <p className="text-xl text-white/60 font-medium max-w-2xl mx-auto">Join the elite club of Himalayan explorers. Book your consultation today.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                    <Button className="h-16 px-12 rounded-full bg-white text-background font-black text-lg transition-transform hover:scale-105">
                        Reserve Your Spot
                    </Button>
                    <Button variant="outline" className="h-16 px-12 rounded-full border-white/20 text-white hover:bg-white/10 font-black text-lg">
                        Talk To Expert
                    </Button>
                </div>
            </div>
        </div>
      </section>

    </div>
  );
}