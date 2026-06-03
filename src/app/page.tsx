
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Star, 
  ArrowRight, 
  Compass, 
  MapPin, 
  Trophy,
  Mountain,
  Video,
  ChevronRight,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Tent,
  Shrine,
  Navigation,
  Sparkles
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
  const valley = PlaceHolderImages.find(img => img.id === 'valley-view');
  const range = PlaceHolderImages.find(img => img.id === 'himalaya-range');
  const trek = PlaceHolderImages.find(img => img.id === 'trekking-exp');

  return (
    <div className="bg-background min-h-screen font-sans selection:bg-accent selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
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
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto space-y-6">
            <Badge className="bg-accent/90 backdrop-blur-sm text-accent-foreground border-0 px-5 py-2 rounded-full font-black uppercase tracking-widest text-[9px] mb-2 shadow-xl saffron-glow">
              ⚡ INDIA'S MOST LOVED UTTARAKHAND SPECIALIST
            </Badge>
            
            <div className="space-y-4">
                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-tight font-heading uppercase drop-shadow-2xl">
                    Discover Uttarakhand <br/> <span className="text-accent italic font-spiritual capitalize">with Northern Harrier</span>
                </h1>
                <p className="text-lg md:text-xl font-bold text-white/90 tracking-widest uppercase font-heading drop-shadow-md">
                    Where Every Journey Becomes a Story
                </p>
            </div>
            
            <p className="mt-4 text-sm md:text-lg text-white/80 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight drop-shadow-sm">
              From the snow-covered Himalayan peaks to serene lakes, ancient temples, and thrilling adventure trails, Northern Harrier brings you the finest travel experiences across Uttarakhand. Explore breathtaking destinations, hidden gems, and unforgettable adventures crafted for every traveler.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button asChild size="lg" className="h-14 px-10 rounded-full font-black text-sm bg-accent hover:bg-white hover:text-primary transition-all shadow-xl group">
                <Link href="/tour-packages" className="flex items-center gap-2 uppercase tracking-widest">
                  Plan Your Trip <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full font-black text-sm border-2 border-white/50 text-white hover:bg-white hover:text-primary backdrop-blur-md transition-all shadow-lg">
                <Link href="/search" className="flex items-center justify-center uppercase tracking-widest">Explore Destinations</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section className="py-20 bg-white relative z-20 -mt-12 rounded-t-[3rem]">
        <div className="container px-6">
            <div className="max-w-4xl mx-auto text-center space-y-6">
                <div className="flex items-center justify-center gap-2 text-accent font-black uppercase tracking-[0.3em] text-[10px]">
                    <ShieldCheck className="h-4 w-4" /> The Northern Harrier Edge
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-primary font-heading uppercase">
                    Your Trusted Travel Companion <br/> <span className="italic font-light text-accent capitalize">in Uttarakhand</span>
                </h2>
                <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed">
                    At Northern Harrier, we believe travel is more than visiting places—it&apos;s about creating memories that last a lifetime. We help travelers discover the true essence of Uttarakhand through carefully curated experiences, local insights, and seamless travel planning.
                </p>
                <p className="text-slate-500 text-sm font-medium">
                    Whether you&apos;re seeking spiritual peace, mountain adventures, wildlife encounters, or a relaxing escape into nature, our platform connects you with the best that Uttarakhand has to offer.
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                {[
                    { label: 'Destinations', val: '100+', desc: 'Explore the best of Uttarakhand.', icon: MapPin },
                    { label: 'Happy Travelers', val: '10,000+', desc: 'Trusted by seekers & nature lovers.', icon: MessageSquare },
                    { label: 'Days of Adventure', val: '365', desc: 'Experiences for every season.', icon: Calendar },
                    { label: 'Authentic Experiences', val: '100%', desc: 'Curated with local expertise.', icon: Trophy },
                ].map((stat, i) => (
                    <motion.div 
                        key={i} 
                        {...fadeInUp} 
                        transition={{ delay: i * 0.1 }}
                        className="bg-background p-8 rounded-3xl border border-muted text-center space-y-2 hover:shadow-lg transition-all group"
                    >
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <stat.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="text-3xl font-black text-primary uppercase font-heading">{stat.val}</h4>
                        <p className="text-[10px] font-black uppercase text-accent tracking-widest">{stat.label}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">{stat.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE US */}
      <section className="py-24 bg-background">
        <div className="container px-6">
            <div className="text-center mb-16 space-y-2">
                <span className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">Why Choose Northern Harrier</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-primary uppercase font-heading">The Himalayan Difference</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { title: 'Handpicked Destinations', desc: 'Explore the most beautiful locations, from famous landmarks to hidden Himalayan treasures.', icon: Mountain },
                    { title: 'Hassle-Free Planning', desc: 'Get complete travel guidance, itineraries, and destination recommendations.', icon: Navigation },
                    { title: 'Adventure & Nature', desc: 'Trekking, camping, wildlife safaris, river rafting, skiing, and more.', icon: Tent },
                    { title: 'Spiritual Journeys', desc: 'Experience the divine charm of Uttarakhand sacred temples and pilgrimage routes.', icon: Shrine },
                    { title: 'Local Expertise', desc: 'Travel with confidence through authentic local knowledge and trusted recommendations.', icon: CheckCircle2 }
                ].map((item, i) => (
                    <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="flex gap-6 p-8 bg-white rounded-[2.5rem] border border-black/5 hover:shadow-xl transition-all group">
                        <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                            <item.icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-primary uppercase font-heading tracking-tight">{item.title}</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* 4. FEATURED DESTINATIONS */}
      <section className="py-24 bg-white">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-accent font-black uppercase tracking-widest text-[9px]">
                <Sparkles className="h-3 w-3" /> Explore Your Interest
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-primary font-heading uppercase leading-none">Featured Collections</h2>
            </div>
            <Button variant="link" asChild className="text-accent font-black uppercase tracking-widest text-[10px] group h-auto p-0">
              <Link href="/search" className="flex items-center gap-1">View All Destinations <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Mountains & Hills', img: auli, badge: 'Cool Escapes', desc: 'Mussoorie, Nainital, Auli, Chopta' },
              { name: 'Spiritual Escapes', img: kedarnath, badge: 'Divine', desc: 'Kedarnath, Badrinath, Rishikesh' },
              { name: 'Adventure Trails', img: trek, badge: 'Thrilling', desc: 'Valley of Flowers, Kedarkantha' },
              { name: 'Wildlife & Nature', img: valley, badge: 'Wild', desc: 'Jim Corbett, Rajaji, Binsar' }
            ].map((node, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                <Link href={`/search?category=${node.name}`}>
                  <Card className="group relative aspect-[3/4] overflow-hidden rounded-3xl border-0 shadow-lg cursor-pointer bg-muted">
                    {node.img && (
                      <Image 
                        src={node.img.imageUrl} 
                        alt={node.name} 
                        data-ai-hint={node.img.imageHint}
                        fill 
                        unoptimized={true} 
                        className="object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-8 left-8 right-8 space-y-1">
                      <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase font-heading">{node.name}</h3>
                      <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest line-clamp-1">{node.desc}</p>
                      <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[9px] font-black text-accent uppercase tracking-[0.2em] flex items-center gap-2">Explore <ArrowRight className="h-3 w-3"/></span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA BANNER */}
      <section className="py-24 relative overflow-hidden bg-background">
        <div className="container px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-10">
                <motion.div {...fadeInUp} className="space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-primary leading-tight font-heading uppercase">
                        Ready to Explore <br/> <span className="text-accent italic font-spiritual capitalize">Uttarakhand?</span>
                    </h2>
                    <p className="text-sm md:text-base text-slate-500 font-bold tracking-tight max-w-xl mx-auto uppercase leading-relaxed">
                        Let Northern Harrier guide your next adventure through the majestic Himalayas, sacred landscapes, and unforgettable experiences.
                    </p>
                </motion.div>
                
                <div className="flex flex-col items-center gap-8">
                    <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-base bg-accent hover:bg-primary hover:text-white transition-all shadow-xl saffron-glow group active:scale-95">
                        <Link href="/tour-packages" className="flex items-center gap-3 uppercase tracking-widest">
                            Start Exploring Today <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> AUTHENTIC NODES</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> LOCAL INTELLIGENCE</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> BEST RATE DATA</span>
                    </div>
                </div>
            </div>
        </div>
        
        {/* SEO Tagline Overlay */}
        <div className="mt-24 text-center opacity-30">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 px-6">
                Northern Harrier – Explore Uttarakhand&apos;s Hidden Gems, Adventure Trails, Spiritual Journeys & Himalayan Wonders.
            </p>
        </div>
      </section>
    </div>
  );
}
