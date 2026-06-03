'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SearchFilters } from './search/SearchFilters';
import { 
  MapPin, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Users,
  Sparkles,
  Compass,
  Tent,
  Heart
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dummyCities } from '@/lib/dummy-data';

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen font-sans">
      
      {/* SECTION 1: Hero Section */}
      <section className="relative h-[95vh] min-h-[700px] w-full flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1920" 
          alt="Sacred Himalayas" 
          fill 
          priority
          className="object-cover brightness-[0.4] scale-105"
          data-ai-hint="himalayan mountains"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B4D2E]/60 via-transparent to-background" />
        
        <div className="container relative z-10 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="space-y-4"
            >
              <Badge className="bg-accent text-accent-foreground border-0 px-6 py-1.5 rounded-full font-bold uppercase tracking-[0.3em] text-[10px] mb-4 saffron-glow">
                Explore Devbhoomi Uttarakhand
              </Badge>
              <h1 className="text-5xl md:text-[6rem] font-bold text-white tracking-tighter leading-[0.9] font-heading">
                Where Nature <br/> <span className="text-accent italic font-light">Meets Divinity</span>
              </h1>
              <p className="mt-6 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight">
                Authentic Himalayan journeys, spiritual pilgrimages, and adventure protocols across the Land of Gods.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-white/80 font-bold text-sm pt-4">
                <div className="flex text-accent">
                   {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <span>⭐ 4.8 from 5000+ happy travelers</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="pt-8"
            >
              <SearchFilters />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Featured Nodes Grid */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-accent font-bold uppercase tracking-[0.3em] text-[10px]">
                    <Sparkles className="h-4 w-4" /> Spiritual Nodes
                </div>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-primary font-heading uppercase">Divine Destinations</h2>
                <p className="text-slate-500 font-medium">Curated access to the most sacred corners of Uttarakhand.</p>
            </div>
            <Button variant="link" asChild className="text-accent font-bold uppercase tracking-widest text-xs p-0 h-auto group">
                <Link href="/search">
                    Browse All Nodes <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {dummyCities.map((city, idx) => (
              <motion.div 
                key={city.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link href={`/search?city=${city.name}`}>
                  <Card className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border-0 cursor-pointer shadow-xl bg-white saffron-glow">
                    <Image 
                      src={`https://images.unsplash.com/photo-1544735749-2e924378a839?auto=format&fit=crop&q=80&w=800`}
                      alt={city.name}
                      fill
                      className="object-cover transition-transform duration-2000 group-hover:scale-110 brightness-[0.8] group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                    <div className="absolute bottom-10 left-10 right-10 space-y-3">
                        <Badge className="bg-accent text-accent-foreground border-0 font-bold text-[9px] px-4 py-1.5 tracking-widest rounded-full">SACRED NODE</Badge>
                        <h3 className="text-3xl font-bold text-white tracking-tight leading-none font-heading uppercase">{city.name}</h3>
                        <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-accent transition-colors">
                            Explore Trails <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Why Choose Us (Unique Selling Points) */}
      <section className="py-32 bg-muted/30 border-y border-border/10 relative">
        <div className="container px-6 text-center">
           <div className="max-w-4xl mx-auto mb-20 space-y-4">
                <h4 className="text-accent font-bold uppercase tracking-[0.4em] text-[10px]">Trust & Divinity</h4>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-primary font-heading uppercase text-center w-full">The Northern Promise</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                { icon: ShieldCheck, title: "Verified Safety", desc: "Real-time mountain access protocols and weather-synchronized itineraries for every traveler." },
                { icon: Star, title: "Sacred Stays", desc: "Curated collection of hotels and homestays that blend Himalayan comfort with authentic hospitality." },
                { icon: Users, title: "Local Liaison", desc: "Dedicated team of Pahadi experts providing 24/7 on-ground assistance and spiritual guidance." }
              ].map((item, i) => (
                <div key={i} className="space-y-6 text-center group">
                  <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary transition-all group-hover:bg-accent group-hover:text-accent-foreground mx-auto saffron-glow">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xl font-bold text-primary uppercase tracking-tight font-heading">{item.title}</h4>
                    <p className="text-slate-600 font-medium leading-relaxed text-sm opacity-90">{item.desc}</p>
                  </div>
                </div>
              ))}
           </div>
           
           {/* Testimonial Quote */}
           <motion.div 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             className="mt-32 max-w-4xl mx-auto p-12 bg-white rounded-[3rem] shadow-2xl relative overflow-hidden italic text-xl text-primary font-medium border border-accent/10"
           >
              <div className="absolute top-0 left-0 w-2 h-full bg-accent" />
              "Northern Harrier ensured that our Char Dham Yatra was not just a trip, but a life-changing spiritual experience. Their local expertise is unmatched in the Himalayas."
              <footer className="mt-6 font-bold text-sm uppercase tracking-widest text-accent">— Giridhar Dorai, 2024 Traveller</footer>
           </motion.div>
        </div>
      </section>

      {/* SECTION 4: Performance & Intent CTA */}
      <section className="py-48 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Image src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920" fill alt="Texture" className="object-cover" />
        </div>
        <div className="container px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto space-y-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                >
                    <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] font-heading uppercase">
                        Start Your <br className="hidden md:block"/> <span className="text-accent italic font-light">Sacred Voyage</span>
                    </h2>
                    <p className="text-lg md:text-xl text-white/70 font-medium tracking-wide max-w-2xl mx-auto">
                        Ready to embrace the peace and power of the Himalayas? Initialize your Devbhoomi protocol today.
                    </p>
                </motion.div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Button asChild size="lg" className="h-16 px-12 rounded-full font-bold text-lg bg-accent hover:bg-white hover:text-primary transition-all shadow-xl saffron-glow group">
                        <Link href="/search" className="flex items-center gap-3">
                            Plan Your Trip <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-2" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-16 px-12 rounded-full font-bold text-lg border-white/20 hover:bg-white/10 text-white backdrop-blur-xl">
                        <Link href="/vibe-match">Vibe Match™</Link>
                    </Button>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}