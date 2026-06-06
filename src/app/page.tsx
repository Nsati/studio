'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  MapPin, 
  Trophy,
  Mountain,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Tent,
  Church,
  Navigation,
  Sparkles,
  Play,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');
  const kedarnath = PlaceHolderImages.find(img => img.id === 'dest-kedarnath');
  const rishikesh = PlaceHolderImages.find(img => img.id === 'dest-rishikesh');
  const auli = PlaceHolderImages.find(img => img.id === 'dest-auli');
  const nainital = PlaceHolderImages.find(img => img.id === 'dest-nainital');

  return (
    <div className="bg-background min-h-screen font-sans selection:bg-accent selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden -mt-24">
        {heroImage && (
          <Image 
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            priority
            className="object-cover"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-background/20" />
        
        <div className="container relative z-10 px-6 text-center">
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto space-y-8">
            <Badge className="bg-accent text-accent-foreground border-0 px-6 py-2 rounded-full font-black uppercase tracking-[0.3em] text-[10px] mb-2 shadow-2xl saffron-glow">
              ⚡ INDIA'S MOST LOVED UTTARAKHAND SPECIALIST
            </Badge>
            
            <div className="space-y-4">
                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[0.95] font-heading uppercase drop-shadow-2xl">
                    Discover Uttarakhand <br/> <span className="text-accent italic font-spiritual capitalize">with Northern Harrier</span>
                </h1>
                <p className="text-base md:text-2xl font-black text-white/95 tracking-[0.4em] uppercase font-heading drop-shadow-md">
                    Where Every Journey Becomes a Story
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-xs bg-accent hover:bg-white hover:text-primary transition-all shadow-2xl group saffron-glow">
                <Link href="/tour-packages" className="flex items-center gap-3 uppercase tracking-[0.2em]">
                  Plan Your Trip <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                </Link>
              </Button>
              <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-xs border-2 border-white text-white hover:bg-white hover:text-primary backdrop-blur-md transition-all shadow-2xl bg-black/20">
                <Link href="/search" className="flex items-center justify-center uppercase tracking-[0.2em]">
                  Explore Stays
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section className="py-24 md:py-32 bg-white relative z-20 -mt-12 rounded-t-[3rem]">
        <div className="container px-6">
            <div className="max-w-4xl mx-auto text-center space-y-6">
                <div className="flex items-center justify-center gap-2 text-accent font-black uppercase tracking-[0.4em] text-[10px]">
                    <ShieldCheck className="h-4 w-4" /> THE NORTHERN HARRIER EDGE
                </div>
                <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-primary font-heading uppercase leading-none">
                    Your Trusted Travel Companion <br/> <span className="italic font-light text-accent capitalize">in Uttarakhand</span>
                </h2>
                <p className="text-slate-500 text-base md:text-xl font-bold leading-relaxed uppercase tracking-tight max-w-3xl mx-auto">
                    At Northern Harrier, we believe travel is more than visiting places—it's about creating memories that last a lifetime.
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 mt-20">
                {[
                    { label: 'Destinations', val: '100+', icon: MapPin },
                    { label: 'Happy Travelers', val: '10,000+', icon: MessageSquare },
                    { label: 'Days of Adventure', val: '365', icon: Calendar },
                    { label: 'Authentic Protocol', val: '100%', icon: Trophy },
                ].map((stat, i) => (
                    <motion.div 
                        key={i} 
                        {...fadeInUp} 
                        transition={{ delay: i * 0.1 }}
                        className="bg-background p-8 md:p-12 rounded-[2.5rem] border border-muted text-center space-y-4 hover:shadow-apple-deep transition-all group"
                    >
                        <div className="mx-auto w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <stat.icon className="h-7 w-7" />
                        </div>
                        <h4 className="text-3xl md:text-5xl font-black text-primary uppercase font-heading">{stat.val}</h4>
                        <p className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">{stat.label}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE US */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container px-6">
            <div className="text-center mb-20 space-y-4">
                <span className="text-[10px] font-black text-accent uppercase tracking-[0.5em]">The Himalayan Difference</span>
                <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-primary uppercase font-heading">Why Choose Us</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { title: 'Handpicked Destinations', desc: 'From famous landmarks to hidden Himalayan treasures.', icon: Mountain },
                    { title: 'Hassle-Free Planning', desc: 'Complete itineraries and smart destination recommendations.', icon: Navigation },
                    { title: 'Adventure & Nature', desc: 'Trekking, camping, wildlife safaris, and high-altitude skiing.', icon: Tent },
                    { title: 'Spiritual Journeys', desc: 'Experience the divine charm of sacred pilgrimage routes.', icon: Church },
                    { title: 'Local Expertise', desc: 'Travel with confidence through verified local recommendations.', icon: CheckCircle2 }
                ].map((item, i) => (
                    <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="flex gap-8 p-10 bg-white rounded-[2.5rem] border border-black/5 hover:shadow-luxury transition-all group">
                        <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <item.icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-black text-primary uppercase font-heading tracking-tight">{item.title}</h3>
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* 4. FEATURED DESTINATIONS */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-accent font-black uppercase tracking-widest text-[10px]">
                <Sparkles className="h-4 w-4" /> EXPLORE YOUR INTEREST
              </div>
              <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-primary font-heading uppercase leading-none">Featured Collections</h2>
            </div>
            <Button variant="link" asChild className="text-accent font-black uppercase tracking-widest text-[10px] group h-auto p-0 border-b-2 border-accent/10 hover:border-accent">
              <Link href="/search" className="flex items-center gap-2 pb-1">View All Collections <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {[
              { name: 'Kedarnath', img: kedarnath, badge: 'Sacred Node' },
              { name: 'Rishikesh', img: rishikesh, badge: 'Spiritual Hub' },
              { name: 'Auli', img: auli, badge: 'Skiing Hub' },
              { name: 'Nainital', img: nainital, badge: 'Lake City' }
            ].map((node, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                <Link href={`/search?city=${node.name}`}>
                  <Card className="group relative aspect-[3/4] overflow-hidden rounded-[2.5rem] border-0 shadow-apple-deep cursor-pointer bg-muted">
                    {node.img && (
                      <Image 
                        src={node.img.imageUrl} 
                        alt={node.name} 
                        data-ai-hint={node.img.imageHint}
                        fill 
                        unoptimized={true} 
                        className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-80" />
                    <div className="absolute top-8 left-8">
                        <Badge className="bg-accent/90 text-accent-foreground border-0 font-black uppercase text-[8px] tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                            {node.badge}
                        </Badge>
                    </div>
                    <div className="absolute bottom-10 left-10 right-10">
                      <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase font-heading">{node.name}</h3>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. VISUAL ARCHIVE */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container px-6">
            <div className="text-center mb-20 space-y-4">
                <div className="flex items-center justify-center gap-2 text-accent font-black uppercase tracking-[0.4em] text-[10px]">
                    <Camera className="h-4 w-4" /> THE VISUAL ARCHIVE
                </div>
                <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-primary uppercase font-heading">Himalayan Moments</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[150px] md:auto-rows-[250px]">
                {/* Video Card */}
                <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-[3rem] cursor-pointer shadow-luxury bg-black">
                    <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-1000 group-hover:scale-105">
                        <source src="https://www.pexels.com/download/video/20594056/" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-20 w-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                            <Play className="h-8 w-8 text-white fill-white" />
                        </div>
                    </div>
                </div>

                <div className="relative group overflow-hidden rounded-[2rem] shadow-apple-deep">
                    <Image src="https://images.pexels.com/photos/4143599/pexels-photo-4143599.jpeg" alt="Nainital" fill className="object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="relative group overflow-hidden rounded-[2rem] shadow-apple-deep">
                    <Image src="https://images.pexels.com/photos/14149541/pexels-photo-14149541.jpeg" alt="Auli" fill className="object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="col-span-2 relative group overflow-hidden rounded-[3rem] shadow-luxury">
                    <Image src="https://images.pexels.com/photos/37618361/pexels-photo-37618361.jpeg" alt="Rishikesh" fill className="object-cover group-hover:scale-110 transition-transform" />
                </div>
            </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-24 md:py-40 relative overflow-hidden bg-white">
        <div className="container px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-12">
                <motion.div {...fadeInUp} className="space-y-6">
                    <h2 className="text-4xl md:text-8xl font-black tracking-tighter text-primary leading-[0.9] font-heading uppercase">
                        Ready to Explore <br/> <span className="text-accent italic font-spiritual capitalize">Uttarakhand?</span>
                    </h2>
                    <p className="text-[10px] md:text-xs text-slate-500 font-black tracking-[0.4em] max-w-2xl mx-auto uppercase leading-relaxed">
                        Let Northern Harrier guide your next adventure through the majestic Himalayas.
                    </p>
                </motion.div>
                
                <div className="flex flex-col items-center gap-10">
                    <Button asChild size="lg" className="h-20 px-16 rounded-full font-black text-sm bg-accent hover:bg-primary hover:text-white transition-all shadow-luxury saffron-glow group active:scale-95">
                        <Link href="/tour-packages" className="flex items-center gap-4 uppercase tracking-[0.2em]">
                            Start Journey <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                        </Link>
                    </Button>
                    <div className="flex flex-wrap items-center justify-center gap-10 text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">
                        <span className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-600" /> AUTHENTIC NODES</span>
                        <span className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-600" /> LOCAL INTEL</span>
                        <span className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-600" /> BEST RATES</span>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}