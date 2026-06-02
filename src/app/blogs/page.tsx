
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Wind, 
  Music, 
  Utensils, 
  Building2,
  Calendar,
  Mountain,
  MapPin,
  Compass
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/**
 * @fileOverview Professional Cultural Journal for Northern Harrier.
 * Symmetric, compact, and high-end editorial layout with verified cultural assets.
 */

const CULTURAL_PILLARS = [
  {
    id: 'aipan-art-ritual-geometry',
    title: "Sacred Geometry: Aipan",
    category: "Traditional Art",
    desc: "The ritualistic folk art that welcomes divine energies.",
    imgId: "blog-aipan",
    icon: Sparkles
  },
  {
    id: 'pahadi-cuisine-himalayan-feast',
    title: "Soul of Soil: Cuisine",
    category: "Local Flavors",
    desc: "Dense nutrition from the high-altitude Himalayan belt.",
    imgId: "blog-food",
    icon: Utensils
  },
  {
    id: 'choliya-dance-warrior-past',
    title: "Echoes of Valor: Choliya",
    category: "Folk Lore",
    desc: "The ancient warrior sword dance of the Kumaon hills.",
    imgId: "blog-dance",
    icon: Wind
  },
  {
    id: 'harela-festival-nature-bond',
    title: "Green Bond: Harela",
    category: "Festivals",
    desc: "Celebrating the arrival of monsoon and life's cycle.",
    imgId: "blog-festival",
    icon: Calendar
  },
  {
    id: 'likhai-wood-carving-heritage',
    title: "Legacy in Wood: Likhai",
    category: "Heritage",
    desc: "Intricate carvings found on ancient Himalayan thresholds.",
    imgId: "blog-heritage",
    icon: Building2
  },
  {
    id: 'jhora-chhapeli-soul-music',
    title: "Heartbeat: Folk Music",
    category: "Folk Music",
    desc: "The rhythmic community dance of unity and love.",
    imgId: "blog-music",
    icon: Music
  }
];

export default function BlogsPublicPage() {
    const getImageUrl = (id: string) => {
        const found = PlaceHolderImages.find(img => img.id === id);
        return found ? found.imageUrl : 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800';
    };

    return (
        <div className="min-h-screen bg-white selection:bg-accent selection:text-white font-sans">
            
            {/* Professional Symmetric Hero */}
            <section className="relative h-[65vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
                <Image 
                    src={getImageUrl('hero')} 
                    alt="Devbhoomi Heritage" 
                    fill 
                    priority
                    className="object-cover brightness-[0.5]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />
                
                <div className="container relative z-10 px-6 text-center space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <Badge className="bg-white/10 backdrop-blur-md text-accent border border-white/20 px-8 py-2 rounded-full font-black uppercase tracking-[0.4em] text-[10px] mb-4">
                            The Devbhoomi Chronicles
                        </Badge>
                        <h1 className="text-5xl md:text-[7rem] font-black text-white tracking-tighter leading-none uppercase">
                            Soul of <br/> <span className="text-accent italic font-heading font-light capitalize">Uttarakhand</span>
                        </h1>
                        <p className="mt-4 text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
                            Explore the traditions, spirituality, and vibrant folk life of the Northern Frontier.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Compact Stats Bar - Professional Minimalist */}
            <section className="py-12 bg-slate-50 border-y border-black/5">
                <div className="container px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: 'Festivals', val: '45+', icon: Calendar },
                            { label: 'Temples', val: '1000+', icon: Building2 },
                            { label: 'Folk Arts', val: '12+', icon: Wind },
                            { label: 'Villages', val: '15,000+', icon: Mountain }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center text-center space-y-2">
                                <stat.icon className="h-5 w-5 text-accent opacity-50 mb-1" />
                                <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Symmetric Content Grid */}
            <section className="py-24 bg-white">
                <div className="container px-6">
                    <div className="text-center mb-20 space-y-4">
                        <div className="flex items-center justify-center gap-3 text-accent font-black uppercase tracking-[0.4em] text-[10px]">
                            <Compass className="h-4 w-4" /> Operational Archive
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 uppercase leading-none">Cultural Heritage</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {CULTURAL_PILLARS.map((item, i) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                            >
                                <Card className="group overflow-hidden rounded-[2rem] border-black/5 bg-white shadow-apple-deep hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                    <Link href={`/blogs/${item.id}`}>
                                        <CardContent className="p-0">
                                            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                                <Image 
                                                    src={getImageUrl(item.imgId)} 
                                                    alt={item.title} 
                                                    fill 
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                                                />
                                                <div className="absolute top-6 left-6">
                                                    <Badge className="bg-white/95 backdrop-blur-md text-primary border-0 font-black px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest shadow-sm">
                                                        {item.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="p-8 space-y-4">
                                                <div className="flex items-center gap-3 text-accent font-black uppercase tracking-[0.2em] text-[8px]">
                                                    <item.icon className="h-4 w-4" /> VERIFIED LOG
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase group-hover:text-primary transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-slate-400 font-medium text-xs leading-relaxed line-clamp-2">
                                                    {item.desc}
                                                </p>
                                                <div className="pt-4 border-t border-slate-50">
                                                    <Button variant="link" className="p-0 h-auto font-black text-[10px] uppercase tracking-widest text-primary hover:text-accent group">
                                                        View Report <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Link>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Compact Call to Action */}
            <section className="py-24 container px-6">
                <div className="relative h-[450px] rounded-[3.5rem] overflow-hidden flex items-center justify-center text-center shadow-2xl">
                    <Image 
                        src={getImageUrl('village-1')} 
                        alt="Join the Journey" 
                        fill 
                        className="object-cover brightness-50"
                    />
                    <div className="relative z-10 space-y-8 max-w-2xl px-6">
                        <Badge className="bg-accent text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">Himalayan Liaison Protocol</Badge>
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                            Synchronize With <br/> <span className="text-accent italic font-heading font-light capitalize">Devbhumi</span>
                        </h2>
                        <p className="text-white/70 font-medium text-lg max-w-lg mx-auto">
                            "Where every mountain peak holds a throne of the divine."
                        </p>
                        <div className="pt-4">
                            <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-sm uppercase tracking-widest bg-primary hover:bg-slate-900 shadow-2xl transition-all hover:scale-105 active:scale-95">
                                <Link href="/search">Find Stays Nearby <ArrowRight className="ml-3 h-5 w-5" /></Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
