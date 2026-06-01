'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Compass, 
  MapPin, 
  Star, 
  ArrowRight, 
  Mountain, 
  Wind, 
  Tent, 
  Heart, 
  Wifi, 
  Coffee, 
  CloudSun,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Zap,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

// --- Navbar Component ---
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Discover', href: '#destinations' },
    { name: 'Stay', href: '#elite' },
    { name: 'Protocol', href: '#protocol' },
    { name: 'Vibe Match', href: '#vibe-match' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 py-4 px-6 md:px-12 flex items-center justify-between",
      isScrolled ? "solid-header h-20" : "bg-transparent h-24"
    )}>
      <Link href="/" className="flex items-center gap-3">
        <div className="h-10 w-10 border-2 border-accent rounded-full flex items-center justify-center">
            <span className="text-white font-black text-xs">NH</span>
        </div>
        <span className="font-heading text-xl md:text-2xl font-black text-white tracking-tighter uppercase">
            Northern <span className="text-accent">Harrier</span>
        </span>
      </Link>

      <div className="hidden lg:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            href={link.href} 
            className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80 hover:text-accent transition-colors"
          >
            {link.name}
          </Link>
        ))}
        <Button className="rounded-full px-8 bg-accent hover:bg-accent/90 text-white font-black text-[11px] uppercase tracking-widest shadow-xl">
          Protocol Access
        </Button>
      </div>

      <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-24 left-6 right-6 bg-[#1A1A1A] rounded-3xl p-8 flex flex-col gap-6 shadow-2xl animate-in fade-in zoom-in-95 lg:hidden border border-white/5">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 last:border-0"
            >
              {link.name}
            </Link>
          ))}
          <Button className="w-full h-14 rounded-full bg-accent text-white font-black uppercase tracking-widest">
            Join The Expedition
          </Button>
        </div>
      )}
    </nav>
  );
}

// --- Main Page Assembly ---
export default function LandingPage() {
  const { toast } = useToast();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const getImg = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

  const handleVibeMatch = (vibe: string) => {
    toast({
      title: "Himalayan Protocol Initialized",
      description: `Our AI is curating the perfect experience for a ${vibe} seeker in the Himalayas...`,
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1A1A] selection:bg-accent selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <video 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
          autoPlay 
          muted 
          loop 
          playsInline
        >
          <source src="https://videos.pexels.com/video-files/4904586/4904586-uhd_2560_1440_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#1A1A1A]" />
        
        <div className="container relative z-10 px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-md px-6 py-2.5 rounded-full border border-accent/30 text-accent text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-1000">
            <ShieldCheck className="h-4 w-4" /> Operational Instance: Himalayan North
          </div>
          <h1 className="text-5xl md:text-[8rem] text-white tracking-tighter font-black leading-[0.85] uppercase animate-in slide-in-from-bottom-10 duration-1000">
            The Northern <br /> <span className="text-accent italic font-heading font-light capitalize">Harrier</span> Protocol
          </h1>
          <p className="text-lg md:text-2xl text-white/70 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight border-l-2 border-accent/40 pl-8">
            Elite Himalayan Stays. Precision Safety Logic. Authentic Hospitality. <br/>
            Engineered for the modern explorer.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 pt-8">
            <Button asChild size="lg" className="h-16 px-12 rounded-full bg-accent hover:bg-accent/90 text-white font-black text-lg shadow-2xl hover:scale-105 transition-all">
              <Link href="#vibe-match">START YOUR PROTOCOL</Link>
            </Button>
            <Button variant="outline" size="lg" className="h-16 px-12 rounded-full border-white/20 text-white hover:bg-white/10 font-black text-lg backdrop-blur-sm">
              EXPLORE COLLECTION
            </Button>
          </div>
        </div>

        {/* Floating Book Now (Mobile) */}
        <div className="fixed bottom-6 right-6 z-[90] sm:hidden">
            <Button className="h-14 w-14 rounded-full bg-accent shadow-2xl flex items-center justify-center p-0">
                <Zap className="h-6 w-6 text-white" />
            </Button>
        </div>
      </section>

      {/* Prime Destinations Section */}
      <section id="destinations" className="py-32 bg-white rounded-t-[4rem] -mt-16 relative z-20">
        <div className="container px-6">
          <div className="text-center mb-24 space-y-4">
            <Badge className="bg-secondary/10 text-secondary border-0 font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] text-[10px]">Prime Coordinates</Badge>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-primary uppercase">Prime Destinations</h2>
            <p className="text-muted-foreground text-xl max-w-xl mx-auto font-medium">Handpicked nodes of absolute tranquility across the Himalayan belt.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Rishikesh', img: 'dest-rishikesh', score: '9.2' },
              { name: 'Auli', img: 'dest-auli', score: '9.5' },
              { name: 'Nainital', img: 'dest-nainital', score: '8.8' },
              { name: 'Manali', img: 'dest-manali', score: '9.0' }
            ].map((dest, i) => (
              <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-[3rem] shadow-apple-deep hover:shadow-2xl transition-all duration-700 cursor-pointer">
                <Image 
                  src={getImg(dest.img)} 
                  alt={dest.name} 
                  fill 
                  loading="lazy"
                  className="object-cover group-hover:scale-110 transition-transform duration-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute top-6 right-6">
                  <Badge className="bg-white/95 backdrop-blur-md text-primary border-0 font-black px-3 py-1 rounded-full text-[10px] shadow-lg">
                    SCORE: {dest.score}/10
                  </Badge>
                </div>
                <div className="absolute bottom-10 left-10 right-10 space-y-4">
                  <Badge className="bg-accent text-white border-0 font-black uppercase text-[8px] tracking-widest">HARRIER VERIFIED</Badge>
                  <h3 className="text-4xl text-white font-black tracking-tighter uppercase">{dest.name}</h3>
                  <Button variant="link" className="text-white/60 p-0 h-auto font-black uppercase text-[10px] tracking-widest group-hover:text-accent transition-colors">
                    View Properties <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Elite Collection Section */}
      <section id="elite" className="py-32 bg-[#F8F9FA]">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-accent font-black uppercase tracking-[0.4em] text-[10px]">
                    <div className="h-px w-10 bg-accent" /> THE CURATED SERIES
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-primary leading-none tracking-tight uppercase">Elite Collection</h2>
                <p className="text-slate-500 font-bold text-xl max-w-xl">Properties strictly audited for safety, connectivity, and authentic Himalayan warmth.</p>
            </div>
            <Button variant="outline" className="rounded-full font-black border-2 border-primary h-16 px-12 hover:bg-primary hover:text-white transition-all shadow-xl uppercase text-xs tracking-widest">
                VIEW CATALOGUE
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { name: "The Zenith Retreat", loc: "Auli", price: "₹18,000", img: "elite-1" },
              { name: "Cobalt Horizon", loc: "Rishikesh", price: "₹12,000", img: "elite-2" },
              { name: "Amber Wood Loft", loc: "Manali", price: "₹15,000", img: "elite-3" }
            ].map((hotel, i) => (
              <Card key={i} className="group overflow-hidden rounded-[3rem] border-0 shadow-apple-deep hover:shadow-2xl transition-all duration-1000 gold-edge bg-white">
                <CardContent className="p-0">
                  <div className="relative h-80 w-full overflow-hidden">
                    <Image src={getImg(hotel.img)} alt={hotel.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute top-8 left-8">
                      <Badge className="bg-primary/80 backdrop-blur-md text-white border-0 font-black px-5 py-2 text-[10px] rounded-full shadow-lg tracking-widest">
                        EST. PREMIUM
                      </Badge>
                    </div>
                  </div>
                  <div className="p-10 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-3xl font-black text-primary group-hover:text-accent transition-colors leading-tight uppercase">
                          {hotel.name}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                          <MapPin className="h-3.5 w-3.5 text-accent" /> {hotel.loc}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-accent/10 px-4 py-2 rounded-2xl">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="text-sm font-black text-accent">4.9</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 py-2">
                        <Wifi className="h-5 w-5 text-slate-300" />
                        <Coffee className="h-5 w-5 text-slate-300" />
                        <CloudSun className="h-5 w-5 text-slate-300" />
                    </div>

                    <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">starts from</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-primary tracking-tighter">{hotel.price}</span>
                          <span className="text-xs text-slate-400 font-bold">/night</span>
                        </div>
                      </div>
                      <Button className="h-14 w-14 rounded-full bg-primary flex items-center justify-center group-hover:bg-accent transition-all duration-500 shadow-xl group-hover:shadow-accent/30 p-0">
                        <ArrowRight className="h-6 w-6 text-white" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Harrier Protocol Section */}
      <section id="protocol" className="py-32 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
          <Mountain className="w-full h-full text-white" strokeWidth={0.1} />
        </div>
        <div className="container px-6">
          <div className="max-w-4xl mx-auto text-center mb-24 space-y-6">
            <Badge className="bg-accent text-white font-black uppercase tracking-[0.3em] px-8 py-3 rounded-full text-[10px] shadow-2xl">The Northern Harrier Protocol</Badge>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">Engineered <br/><span className="italic font-light text-accent">Safety</span> Logic</h2>
            <p className="text-xl text-white/60 font-medium leading-relaxed max-w-2xl mx-auto">We don't just book hotels; we map your entire journey with precision telemetry and a deep respect for the horizon.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: "Precision Safety", desc: "Military-grade landscape risk assessments for every route." },
              { icon: Wind, title: "Satellite Intel", desc: "Live road and weather monitoring from regional nodes." },
              { icon: Heart, title: "Curated Hospitality", desc: "Only properties meeting Harrier gold-standards are listed." },
              { icon: Tent, title: "Harrier Support", desc: "24/7 dedicated liaison for all expedition members." }
            ].map((item, i) => (
              <div key={i} className="group p-10 bg-white/5 rounded-[3rem] border border-white/10 hover:bg-accent transition-all duration-500 hover:border-accent hover:-translate-y-2">
                <div className="p-5 bg-white/10 rounded-3xl w-fit mb-8 group-hover:bg-white/20 transition-colors">
                  <item.icon className="h-8 w-8 text-accent group-hover:text-white" />
                </div>
                <h4 className="text-xl font-black uppercase tracking-widest mb-4 group-hover:text-white">{item.title}</h4>
                <p className="text-sm text-white/60 group-hover:text-white/80 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Vibe Match Section (Interactive) */}
      <section id="vibe-match" className="relative py-48 px-6 overflow-hidden">
        <Image src={getImg('vibe-bg')} alt="Vibe Match" fill className="object-cover brightness-[0.3]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-transparent to-transparent opacity-80" />
        
        <div className="container relative z-10">
          <div className="max-w-2xl space-y-10">
            <div className="flex items-center gap-4 text-accent font-black uppercase tracking-[0.4em] text-[10px]">
                <div className="h-10 w-10 border border-accent rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4" />
                </div>
                NEURAL SELECTION ENGINE
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase">Find Your <br/><span className="text-accent italic font-light">Northern</span> Vibe</h2>
            <p className="text-xl text-white/70 max-w-md font-medium leading-relaxed">Undefined itinerary? Our AI expert liaison matches your current psychological mood with the perfect Himalayan hidden gems.</p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              {[
                { label: "🏔️ Adventure Seeker", vibe: "Adventure" },
                { label: "🧘 Peace & Wellness", vibe: "Wellness" },
                { label: "📸 Culture & Heritage", vibe: "Culture" }
              ].map((btn) => (
                <Button 
                  key={btn.vibe}
                  onClick={() => handleVibeMatch(btn.vibe)}
                  className="h-16 px-10 rounded-full bg-white/10 hover:bg-accent text-white border border-white/20 font-black text-sm uppercase tracking-widest backdrop-blur-md transition-all active:scale-95"
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-white">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto text-center relative">
            <div className="text-accent text-[8rem] font-serif leading-none absolute -top-12 -left-12 opacity-10">“</div>
            <div className="relative z-10">
              <div className="flex justify-center gap-1 mb-8">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-accent text-accent" />)}
              </div>

              <div className="h-[250px] flex items-center justify-center">
                {[
                  { name: "Vikram S.", loc: "Stayed in Auli", text: "Northern Harrier provided a level of safety logic I've never seen in Himalayan travel. The villa was elite, but the real-time weather alerts were life-saving.", img: "client-1" },
                  { name: "Elena R.", loc: "Stayed in Rishikesh", text: "The vibe match suggested a hidden riverside sanctuary I would have never found on my own. Truly a precision-engineered luxury experience.", img: "client-2" },
                  { name: "Arjun K.", loc: "Stayed in Manali", text: "The 24/7 dedicated liaison made our expedition stress-free. Every detail from the cab condition to the property standards was gold.", img: "client-3" }
                ].map((item, idx) => (
                  <div key={idx} className={cn(
                    "absolute transition-all duration-1000 transform",
                    activeTestimonial === idx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}>
                    <p className="text-2xl md:text-4xl font-heading font-light italic leading-relaxed text-primary mb-12">
                      "{item.text}"
                    </p>
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-accent shadow-xl">
                        <Image src={getImg(item.img)} alt={item.name} width={80} height={80} className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-black text-primary uppercase tracking-widest text-sm">{item.name}</h4>
                        <p className="text-xs text-accent font-bold uppercase tracking-widest">{item.loc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-3 mt-16">
                {[0, 1, 2].map(i => (
                  <button 
                    key={i} 
                    onClick={() => setActiveTestimonial(i)}
                    className={cn(
                      "h-2 transition-all duration-500 rounded-full",
                      activeTestimonial === i ? "w-10 bg-accent" : "w-2 bg-slate-200"
                    )} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-32">
        <div className="container px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
            <div className="space-y-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="h-10 w-10 border-2 border-accent rounded-full flex items-center justify-center">
                    <span className="text-white font-black text-xs">NH</span>
                </div>
                <span className="font-heading text-2xl font-black text-white tracking-tighter uppercase">
                    Northern <span className="text-accent">Harrier</span>
                </span>
              </Link>
              <p className="text-white/50 text-sm leading-relaxed font-medium">
                Beyond the horizon lies a new standard of Himalayan expedition. Curating elite stays since 2024.
              </p>
              <div className="flex gap-4">
                {[ShieldCheck, Compass, Zap].map((Icon, i) => (
                    <div key={i} className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:border-accent transition-colors cursor-pointer">
                        <Icon size={16} className="text-white/60 hover:text-accent" />
                    </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Quick Links</h4>
              <ul className="space-y-4 text-sm font-bold text-white/60">
                {['Destinations', 'Properties', 'Protocol', 'Vibe Match'].map(item => (
                  <li key={item} className="hover:text-white cursor-pointer transition-colors uppercase tracking-widest text-[11px]">{item}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Contact Liaison</h4>
              <div className="space-y-4 text-sm font-bold text-white/60">
                <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-accent" /> expeditions@nh.com</p>
                <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-accent" /> Node 01: Almora HQ</p>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Newsletter Protocol</h4>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                    <input 
                        type="email" 
                        placeholder="Intelligence Node Email" 
                        required
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-full px-6 text-sm focus:border-accent transition-all outline-none"
                    />
                    <Button type="submit" className="absolute right-1 top-1 h-12 w-12 rounded-full bg-accent p-0 shadow-xl">
                        <ArrowRight size={20} />
                    </Button>
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Encrypted transmission via NH Cloud</p>
              </form>
            </div>
          </div>

          <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                <span className="text-[10px] font-black uppercase tracking-widest">Razorpay Secure</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Verified by Google</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Himalayan Trust</span>
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
              © 2024 NORTHERN HARRIER EXPEDITIONS. BEYOND LOGIC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
