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
  Search,
  ChevronRight,
  Wifi,
  Calendar,
  Users,
  MapPin,
  Star,
  Quote,
  CheckCircle2,
  MessageCircle,
  Clock,
  Award,
  Rocket,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Northern Harrier Elite Landing Page.
 * Redesigned with premium agency aesthetics: Animated backgrounds, 
 * glassmorphism, and smooth scroll-triggered interactions.
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
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-white selection:bg-primary selection:text-background overflow-x-hidden">
      
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animate-bounce" style={{ animationDuration: '8s' }} />
      </div>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/916399902725" 
        target="_blank" 
        className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all group active:scale-95"
      >
        <MessageCircle className="h-7 w-7" />
        <span className="absolute right-full mr-4 bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all shadow-xl -translate-x-2 group-hover:translate-x-0">
          Concierge Support
        </span>
      </a>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20">
        <div className="absolute inset-0 z-[-1]">
          <Image 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920" 
            alt="Cinematic Himalayas" 
            fill 
            priority
            unoptimized={true}
            className="object-cover brightness-[0.3]" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/80 via-transparent to-[#0f172a]" />
        </div>
        
        <div className="container relative z-10 px-6 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-6 py-2 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.4em]">
              🚀 Elite Himalayan Standards
            </div>
            <h1 className="text-5xl md:text-[7rem] font-black leading-[0.9] uppercase tracking-tighter text-white">
              Explore the <br /> <span className="text-primary italic font-heading font-light lowercase">Sacred</span> Himalayas
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
              Transform your journey into a spiritual expedition. We build luxury digital booking experiences for the northern frontier.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="h-16 px-10 rounded-full bg-primary text-background font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                <Link href="/tour-packages"><Rocket className="mr-2 h-5 w-5" /> View Our Work</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-full border-white/20 text-white hover:bg-white/5 font-black text-lg hover:scale-105 transition-all">
                <Link href="/contact"><Phone className="mr-2 h-5 w-5" /> Let's Talk</Link>
              </Button>
            </div>
          </motion.div>

          {/* Floating Search Hub */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-w-5xl mx-auto w-full"
          >
            <div className="bg-white/5 backdrop-blur-2xl p-2 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col lg:flex-row gap-2">
                <div className="flex-1 bg-white/5 h-20 flex items-center px-8 gap-4 rounded-2xl group border border-transparent hover:border-primary/30 transition-all cursor-text">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div className="flex flex-col items-start flex-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Target Zone</span>
                        <input className="bg-transparent w-full font-bold text-white focus:outline-none placeholder:text-white/20 text-sm" placeholder="Search Uttarakhand..." />
                    </div>
                </div>
                <div className="flex-1 bg-white/5 h-20 flex items-center px-8 gap-4 rounded-2xl group border border-transparent hover:border-primary/30 transition-all cursor-pointer">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div className="flex flex-col items-start flex-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Launch Date</span>
                        <span className="font-bold text-white/40 text-sm">Select Window</span>
                    </div>
                </div>
                <Button asChild className="h-20 bg-primary hover:bg-primary/90 text-background rounded-2xl px-12 text-lg font-black shadow-lg transition-all active:scale-95">
                    <Link href="/search">Execute Search</Link>
                </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 animate-bounce">
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Discovery</span>
            <ChevronRight className="h-4 w-4 rotate-90" />
        </div>
      </section>

      {/* Statistics Strip */}
      <section className="py-20 border-y border-white/5 relative z-10">
        <div className="container px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                {stats.map((stat, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="text-center space-y-2"
                    >
                        <p className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-white tracking-tighter">{stat.value}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{stat.label}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* Services: What We Do */}
      <section className="py-32 container px-6 relative z-10" id="services">
        <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">What We Do</h2>
            <p className="text-slate-500 font-bold max-w-xl mx-auto">End-to-end Himalayan solutions tailored to elite traveler standards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
                { icon: ShieldCheck, title: "Verified Safety", desc: "Every route and stay is audited against our strict Himalayan protocol." },
                { icon: Award, title: "Handpicked Stays", desc: "We only list properties that define local hospitality and comfort." },
                { icon: Compass, title: "Elite Guides", desc: "Professional mountaineers and scholars lead every expedition." },
                { icon: Wifi, title: "Remote Comms", desc: "Satellite verified connectivity even in high-altitude zones." },
                { icon: Users, title: "Custom Flows", desc: "Personalized itineraries built for families, solo trekkers, or spiritual seekers." },
                { icon: Clock, title: "24/7 Watch", desc: "Active monitoring of weather and road status for your peace of mind." }
            ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="group p-10 bg-white/5 border border-white/5 rounded-[2rem] relative overflow-hidden transition-all duration-500 hover:bg-white/[0.08] hover:border-primary/20"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                    <div className="h-14 w-14 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
                        <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <h4 className="text-xl font-black uppercase tracking-widest mb-4 leading-tight">{item.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium group-hover:text-slate-400">{item.desc}</p>
                </motion.div>
            ))}
        </div>
      </section>

      {/* Portfolio: Featured Work */}
      <section className="py-32 bg-slate-900/50 relative z-10" id="portfolio">
        <div className="container px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                <div className="space-y-4">
                    <h2 className="text-5xl md:text-7xl font-black uppercase leading-[0.9]">Our <br/><span className="text-primary italic font-heading font-light lowercase">Work</span></h2>
                    <p className="text-slate-500 font-bold">Selected expeditions we're proud to have engineered</p>
                </div>
                <Button asChild variant="outline" className="h-14 rounded-full px-8 border-white/10 hover:bg-primary hover:text-background font-black uppercase tracking-widest text-xs">
                    <Link href="/tour-packages">Explore All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredExpeditions.map((tour, i) => (
                <motion.div
                    key={tour.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative h-[450px] rounded-[2rem] overflow-hidden cursor-pointer"
                >
                    <Image 
                        src={tour.image} 
                        alt={tour.name} 
                        fill 
                        className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-dark/90 flex flex-col items-center justify-center p-8 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <h3 className="text-3xl font-black uppercase tracking-tighter text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{tour.name}</h3>
                        <p className="text-white/80 font-bold mt-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{tour.duration} • {tour.difficulty}</p>
                        <Button asChild className="mt-8 rounded-full h-12 px-8 bg-white text-primary font-black hover:bg-white/90">
                           <Link href={`/tour-packages/${tour.id}`}>View Itinerary</Link>
                        </Button>
                    </div>

                    <div className="absolute bottom-8 left-8 group-hover:opacity-0 transition-opacity">
                        <Badge className="bg-primary text-background font-black px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest mb-3">Featured</Badge>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-white drop-shadow-lg">{tour.name}</h3>
                    </div>
                </motion.div>
              ))}
            </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 container px-6 relative z-10" id="testimonials">
        <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Client Stories</h2>
            <p className="text-slate-500 font-bold">What our explorers say about Northern Harrier</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
                { name: "Rahul Jain", role: "CEO, TechStart", initial: "RJ", text: "Working with Northern Harrier was a game-changer. Their attention to mountain safety and luxury detail in Kedarnath was beyond world-class." },
                { name: "Anita Sharma", role: "Founder, StyleHub", initial: "AS", text: "The most seamless Himalayan booking experience I've ever had. Their real-time road and weather alerts saved our family vacation." },
                { name: "Vikram Kapoor", role: "Director, Innovate Inc", initial: "VK", text: "Expert guides, elite stays, and a constant human connection. They understood our vision for a sacred retreat and executed it perfectly." }
            ].map((test, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-12 rounded-[2.5rem] relative">
                    <Quote className="h-12 w-12 text-primary opacity-20 absolute top-10 left-10" />
                    <p className="text-slate-400 font-medium leading-relaxed italic mb-8 relative z-10">"{test.text}"</p>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-black text-white">{test.initial}</div>
                        <div>
                            <p className="font-black text-sm uppercase">{test.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{test.role}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 container px-6 text-center relative z-10" id="contact">
        <div className="max-w-4xl mx-auto space-y-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
                <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">Ready to Start <br/> Your <span className="text-primary">Project?</span></h2>
                <p className="text-xl text-slate-400 font-medium max-w-lg mx-auto">Let's create something amazing together. Connect with our Himalayan experts today.</p>
            </motion.div>
            <Button asChild size="lg" className="h-20 px-16 rounded-full bg-primary text-background font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
                <Link href="/contact"><Rocket className="mr-3 h-6 w-6" /> Start an Expedition</Link>
            </Button>
        </div>
      </section>

    </div>
  );
}
