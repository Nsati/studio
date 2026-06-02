
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  MapPin, 
  Sparkles, 
  Compass, 
  Wind, 
  Music, 
  Utensils, 
  Building2,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/**
 * @fileOverview Professional Cultural Journal for Northern Harrier.
 * Symmetric, compact, and high-end editorial layout with updated authentic images.
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
    title: "Heartbeat: Jhora Music",
    category: "Folk Music",
    desc: "The rhythmic community dance of unity and love.",
    imgId: "blog-music",
    icon: Music
  }
];

export default function BlogsPublicPage() {
    const getImageUrl = (id: string) => {
        const found = PlaceHolderImages.find(img => img.id === id);
        return found ? found.imageUrl : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800';
    };

    return (
        <div className="min-h-screen bg-white selection:bg-accent selection:text-white font-sans">
            
            {/* Professional Compact Hero */}
            <section className="relative h-[50vh] min-h-[400px] w-full flex items-center justify-center overflow-hidden">
                <Image 
                    src={getImageUrl('hero')} 
                    alt="Himalayas" 
                    fill 
                    priority
                    className="object-cover brightness-[0.4]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-white" />
                
                <div className="container relative z-10 px-6 text-center space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Badge className="bg-white/10 backdrop-blur-md text-accent border border-white/20 px-6 py-1.5 rounded-full font-black uppercase tracking-[0.4em] text-[9px] mb-6">
                            The Devbhoomi Chronicles
                        </Badge>
                        <h1 className="text-5xl md:text-[5rem] font-black text-white tracking-tighter leading-none uppercase">
                            Soul of <span className="text-accent italic font-heading font-light capitalize">Uttarakhand</span>
                        </h1>
                        <p className="mt-4 text-base md:text-lg text-white/70 max-w-xl mx-auto font-medium leading-relaxed tracking-tight">
                            Curated intelligence on ancient traditions and high-altitude heritage.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Symmetric Content Grid */}
            <section className="py-20 bg-white">
                <div className="container px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 border-b border-black/5 pb-12">
                        <div className="space-y-2 text-center md:text-left">
                            <Badge className="bg-primary/10 text-primary border-0 font-black px-4 py-1 rounded-full uppercase tracking-[0.3em] text-[9px]">Cultural Inventory</Badge>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight uppercase">Heritage Archive</h2>
                        </div>
                        <p className="text-slate-400 font-bold text-xs max-w-[240px] text-center md:text-right italic">
                            Strictly symmetric logs of Himalayan legacy and Pahadi wisdom.
                        </p>
                    </div>

                    {/* Unified 3-Column Symmetric Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {CULTURAL_PILLARS.map((item, i) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="group overflow-hidden rounded-[1.5rem] border-black/5 bg-white shadow-apple-deep hover:shadow-2xl transition-all duration-500">
                                    <Link href={`/blogs/${item.id}`}>
                                        <CardContent className="p-0">
                                            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                                <Image 
                                                    src={getImageUrl(item.imgId)} 
                                                    alt={item.title} 
                                                    fill 
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                                                />
                                                <div className="absolute top-4 left-4">
                                                    <Badge className="bg-white/95 backdrop-blur-md text-primary border-0 font-black px-3 py-1 rounded-full text-[8px] uppercase tracking-widest shadow-sm">
                                                        {item.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="p-6 space-y-3">
                                                <div className="flex items-center gap-3 text-accent font-black uppercase tracking-[0.2em] text-[8px]">
                                                    <item.icon className="h-3 w-3" /> VERIFIED LOG
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 leading-tight uppercase group-hover:text-primary transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-slate-400 font-medium text-[11px] leading-relaxed line-clamp-2">
                                                    {item.desc}
                                                </p>
                                                <div className="pt-2">
                                                    <Button variant="link" className="p-0 h-auto font-black text-[10px] uppercase tracking-widest text-primary hover:text-accent">
                                                        View Report <ArrowRight className="ml-2 h-3 w-3" />
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

            {/* Compact Highlight Bar */}
            <section className="py-12 bg-slate-50 border-y border-black/5">
                <div className="container px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: 'Festivals', val: '45+', icon: Calendar },
                            { label: 'Heritage Nodes', val: '1000+', icon: Building2 },
                            { label: 'Art Forms', val: '12+', icon: Wind },
                            { label: 'Food Logs', val: '30+', icon: Utensils }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center text-center space-y-1">
                                <stat.icon className="h-4 w-4 text-accent opacity-40 mb-1" />
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Compact CTA */}
            <section className="py-20 bg-white text-center">
                <div className="container px-6 space-y-6">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        Experience The <span className="text-accent italic font-heading font-light capitalize">Devbhumi</span>
                    </h2>
                    <p className="text-slate-400 font-bold text-sm max-w-md mx-auto italic">
                        "Where every mountain peak holds a throne of the divine."
                    </p>
                    <div className="pt-4">
                        <Button asChild size="lg" className="h-14 px-10 rounded-full font-black text-xs uppercase tracking-widest bg-primary hover:bg-slate-900 shadow-xl transition-all">
                            <Link href="/search">Find Stays Nearby <ArrowRight className="ml-3 h-4 w-4" /></Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
