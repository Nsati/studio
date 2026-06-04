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
  Camera,
  Compass
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
    <div className="bg-background min-h-screen font-sans selection:bg-accent selection:text-white -mt-16 lg:-mt-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-background/20" />
        
        <div className="container relative z-10 px-6 text-center">
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <Badge className="bg-accent text-accent-foreground border-0 px-6 py-2 rounded-full font-black uppercase tracking-[0.3em] text-[10px] mb-2 shadow-2xl saffron-glow">
              ⚡ INDIA'S MOST LOVED UTTARAKHAND SPECIALIST
            </Badge>
            
            <div className="space-y-3">
                <h1 className="text-3xl md:text-6xl font-black text-white tracking-tighter leading-[1.1] font-heading uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                    Discover Uttarakhand <br/> <span className="text-accent italic font-spiritual capitalize">with Northern Harrier</span>
                </h1>
                <p className="text-base md:text-xl font-black text-white/95 tracking-[0.4em] uppercase font-heading drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                    Where Every Journey Becomes a Story
                </p>
            </div>
            
            <p className="text-xs md:text-lg text-white font-bold leading-relaxed tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase max-w-2xl mx-auto">
              From snow-covered Himalayan peaks to serene lakes and ancient temples, Northern Harrier brings you the finest travel experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="h-16 px-10 rounded-full font-black text-xs bg-accent hover:bg-white hover:text-primary transition-all shadow-2xl group saffron-glow">
                <Link href="/tour-packages" className="flex items-center gap-3 uppercase tracking-[0.2em]">
                  Plan Your Trip <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                </Link>
              </Button>
              <Button asChild size="lg" className="h-16 px-10 rounded-full font-black text-xs border-2 border-white text-white hover:bg-white hover:text-primary backdrop-blur-xl transition-all shadow-2xl bg-black/40">
                <Link href="/search" className="flex items-center justify-center uppercase tracking-[0.2em] text-white drop-shadow-[0_5px_5px_rgba(0,0,0,1)]">
                  Explore Destinations
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section className="py-16 md:py-20 bg-white relative z-20 -mt-12 rounded-t-[3rem]">
        <div className="container px-6">
            <div className="max-w-4xl mx-auto text-center space-y-6">
                <div className="flex items-center justify-center gap-2 text-accent font-black uppercase tracking-[0.4em] text-[9px]">
                    <ShieldCheck className="h-4 w-4" /> THE NORTHERN HARRIER EDGE
                </div>
                <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-primary font-heading uppercase leading-none">
                    Your Trusted Travel Companion <br/> <span className="italic font-light text-accent capitalize">in Uttarakhand</span>
                </h2>
                <p className="text-slate-500 text-sm md:text-base font-bold leading-relaxed uppercase tracking-tight max-w-3xl mx-auto">
                    At Northern Harrier, we believe travel is more than visiting places—it's about creating memories that last a lifetime. We help travelers discover the true essence of Uttarakhand through curated experiences.
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mt-16">
                {[
                    { label: 'Destinations', val: '100+', desc: 'Explore nodes.', icon: MapPin },
                    { label: 'Happy Travelers', val: '10,000+', desc: 'Trusted seekers.', icon: MessageSquare },
                    { label: 'Days of Adventure', val: '365', desc: 'Every season.', icon: Calendar },
                    { label: 'Authentic Protocol', val: '100%', desc: 'Local expertise.', icon: Trophy },
                ].map((stat, i) => (
                    <motion.div 
                        key={i} 
                        {...fadeInUp} 
                        transition={{ delay: i * 0.1 }}
                        className="bg-background p-6 md:p-10 rounded-[2rem] border border-muted text-center space-y-3 hover:shadow-apple-deep transition-all group"
                    >
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                            <stat.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="text-2xl md:text-4xl font-black text-primary uppercase font-heading">{stat.val}</h4>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-accent tracking-widest">{stat.label}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">{stat.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE US */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container px-6">
            <div className="text-center mb-12 space-y-2">
                <span className="text-[9px] font-black text-accent uppercase tracking-[0.5em]">The Himalayan Difference</span>
                <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-primary uppercase font-heading">Why Choose Us</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: 'Handpicked Destinations', desc: 'Explore famous landmarks to hidden Himalayan treasures.', icon: Mountain },
                    { title: 'Hassle-Free Planning', desc: 'Get complete itineraries and destination recommendations.', icon: Navigation },
                    { title: 'Adventure & Nature', desc: 'Trekking, camping, wildlife safaris, skiing, and more.', icon: Tent },
                    { title: 'Spiritual Journeys', desc: 'Experience the divine charm of sacred pilgrimage routes.', icon: Church },
                    { title: 'Local Expertise', desc: 'Travel with confidence through trusted recommendations.', icon: CheckCircle2 }
                ].map((item, i) => (
                    <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="flex gap-6 p-8 bg-white rounded-[2rem] border border-black/5 hover:shadow-luxury transition-all group">
                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <item.icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-primary uppercase font-heading tracking-tight">{item.title}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* 4. FEATURED DESTINATIONS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-accent font-black uppercase tracking-widest text-[9px]">
                <Sparkles className="h-4 w-4" /> EXPLORE YOUR INTEREST
              </div>
              <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-primary font-heading uppercase leading-none">Featured Collections</h2>
            </div>
            <Button variant="link" asChild className="text-accent font-black uppercase tracking-widest text-[10px] group h-auto p-0 border-b-2 border-accent/10 hover:border-accent">
              <Link href="/search" className="flex items-center gap-2 pb-1">View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { name: 'Kedarnath', img: kedarnath, badge: 'Sacred Node', desc: 'The Abode of Lord Shiva' },
              { name: 'Rishikesh', img: rishikesh, badge: 'Spiritual Hub', desc: 'Yoga Capital' },
              { name: 'Auli', img: auli, badge: 'Skiing Hub', desc: 'Himalayan Ski' },
              { name: 'Nainital', img: nainital, badge: 'Lake City', desc: 'Queen of Lakes' }
            ].map((node, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                <Link href={`/search?city=${node.name}`}>
                  <Card className="group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-[2rem] border-0 shadow-apple-deep cursor-pointer bg-muted transition-all duration-700">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-transparent to-transparent opacity-80" />
                    <div className="absolute top-6 left-6 md:top-8 md:left-8">
                        <Badge className="bg-accent/90 text-accent-foreground border-0 font-black uppercase text-[7px] md:text-[8px] tracking-[0.2em] px-3 py-1 md:px-4 md:py-1.5 rounded-full shadow-lg">
                            {node.badge}
                        </Badge>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 space-y-1">
                      <h3 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase font-heading">{node.name}</h3>
                      <p className="text-white/80 text-[8px] md:text-[10px] font-black uppercase tracking-widest line-clamp-1">{node.desc}</p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. VISUAL ARCHIVE */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container px-6">
            <div className="text-center mb-12 space-y-2">
                <div className="flex items-center justify-center gap-2 text-accent font-black uppercase tracking-[0.4em] text-[9px]">
                    <Camera className="h-4 w-4" /> THE VISUAL ARCHIVE
                </div>
                <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-primary uppercase font-heading">Himalayan Moments</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[150px] md:auto-rows-[200px]">
                {/* Main Featured Video Slot */}
                <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-[2rem] cursor-pointer shadow-luxury bg-black">
                    <video 
                        autoPlay 
                        muted 
                        loop 
                        playsInline 
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                    >
                        <source src="https://www.pexels.com/download/video/20594056/" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform">
                            <Play className="h-6 w-6 text-white fill-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-6 left-6 text-white space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-80">Atmosphere Stream</p>
                        <h4 className="text-lg md:text-2xl font-black uppercase tracking-tighter">Mist on the Horizon</h4>
                    </div>
                </div>

                {/* Nainital Lake Aerial */}
                <div className="relative group overflow-hidden rounded-[1.5rem] cursor-pointer shadow-apple-deep">
                    <Image 
                        src="https://images.pexels.com/photos/4143599/pexels-photo-4143599.jpeg" 
                        alt="Nainital Lake Aerial" 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute bottom-3 left-3">
                        <Badge className="bg-white/90 text-primary border-0 font-black text-[6px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Nainital Lake</Badge>
                    </div>
                </div>

                {/* Auli Snow Slopes */}
                <div className="relative group overflow-hidden rounded-[1.5rem] cursor-pointer shadow-apple-deep">
                    <Image 
                        src="https://images.pexels.com/photos/14149541/pexels-photo-14149541.jpeg" 
                        alt="Auli Skiing" 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute bottom-3 left-3">
                        <Badge className="bg-white/90 text-primary border-0 font-black text-[6px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Auli Skiing</Badge>
                    </div>
                </div>

                {/* Rishikesh River Wide */}
                <div className="col-span-2 relative group overflow-hidden rounded-[2rem] cursor-pointer shadow-luxury">
                    <Image 
                        src="https://images.pexels.com/photos/37618361/pexels-photo-37618361.jpeg" 
                        alt="Rishikesh Rafting" 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                    <div className="absolute bottom-4 left-6 text-white">
                        <h4 className="text-base md:text-xl font-black uppercase tracking-tighter">Rishikesh Rapids</h4>
                    </div>
                </div>

                {/* Kedarnath Temple in Snow */}
                <div className="relative group overflow-hidden rounded-[1.5rem] cursor-pointer shadow-apple-deep">
                    <Image 
                        src="https://images.pexels.com/photos/16090413/pexels-photo-16090413.jpeg" 
                        alt="Kedarnath Temple Snow" 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute bottom-3 left-3">
                        <Badge className="bg-white/90 text-primary border-0 font-black text-[6px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Kedarnath</Badge>
                    </div>
                </div>

                {/* Valley Sunset */}
                <div className="relative group overflow-hidden rounded-[1.5rem] cursor-pointer shadow-apple-deep">
                    <Image 
                        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800" 
                        alt="Himalayan Range" 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                </div>
            </div>
        </div>
      </section>

      {/* 6. FINAL CTA BANNER */}
      <section className="py-16 md:py-20 relative overflow-hidden bg-white">
        <div className="container px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
                <motion.div {...fadeInUp} className="space-y-4">
                    <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-primary leading-tight font-heading uppercase">
                        Ready to Explore <br/> <span className="text-accent italic font-spiritual capitalize">Uttarakhand?</span>
                    </h2>
                    <p className="text-[10px] md:text-xs text-slate-500 font-black tracking-widest max-w-xl mx-auto uppercase leading-relaxed">
                        Let Northern Harrier guide your next adventure through the majestic Himalayas and sacred landscapes.
                    </p>
                </motion.div>
                
                <div className="flex flex-col items-center gap-8">
                    <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-sm bg-accent hover:bg-primary hover:text-white transition-all shadow-luxury saffron-glow group active:scale-95">
                        <Link href="/tour-packages" className="flex items-center gap-3 uppercase tracking-[0.2em]">
                            Start Journey <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                        </Link>
                    </Button>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> AUTHENTIC NODES</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> LOCAL INTEL</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> BEST RATES</span>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
