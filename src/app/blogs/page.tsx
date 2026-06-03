
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
  Compass
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

/**
 * @fileOverview Professional Travel Journal for Northern Harrier.
 * Symmetric layout with clean English copy and immersive hero visuals.
 */

const CULTURAL_PILLARS = [
  {
    id: 'aipan-art-ritual-geometry',
    title: "Sacred Geometry: Aipan",
    category: "Traditional Art",
    desc: "A beautiful ritualistic folk art that welcomes positive energy into Himalayan homes.",
    imageUrl: "https://images.pexels.com/photos/15815340/pexels-photo-15815340.jpeg",
    icon: Sparkles
  },
  {
    id: 'pahadi-cuisine-himalayan-feast',
    title: "Soul of the Soil: Cuisine",
    category: "Local Flavors",
    desc: "Discover the high-altitude grains and unique flavors of the Northern belt.",
    imageUrl: "https://images.pexels.com/photos/30205313/pexels-photo-30205313.jpeg",
    icon: Utensils
  },
  {
    id: 'choliya-dance-warrior-past',
    title: "Echoes of Valor: Choliya",
    category: "Folk Lore",
    desc: "Experience the ancient warrior sword dance of the Kumaon hills.",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIch1Ra3e7tUarWTPbij4k631cwRR6PxETbQ&s",
    icon: Wind
  },
  {
    id: 'harela-festival-nature-bond',
    title: "Green Bond: Harela",
    category: "Festivals",
    desc: "Celebrating the arrival of monsoon and the eternal cycle of life in the hills.",
    imageUrl: "https://images.pexels.com/photos/946186/pexels-photo-946186.jpeg",
    icon: Calendar
  },
  {
    id: 'likhai-wood-carving-heritage',
    title: "Legacy in Wood: Likhai",
    category: "Heritage",
    desc: "Intricate wood carvings found on ancient Himalayan thresholds and temples.",
    imageUrl: "https://images.pexels.com/photos/4611607/pexels-photo-4611607.jpeg",
    icon: Building2
  },
  {
    id: 'jhora-chhapeli-soul-music',
    title: "The Heartbeat: Folk Music",
    category: "Folk Music",
    desc: "Rhythmic community dances representing unity, love, and mountain spirit.",
    imageUrl: "https://images.pexels.com/photos/10405322/pexels-photo-10405322.jpeg",
    icon: Music
  }
];

export default function BlogsPublicPage() {
    return (
        <div className="min-h-screen bg-background selection:bg-accent selection:text-white font-sans">
            
            {/* Hero Section - Updated with Misty Mountain Visual */}
            <section className="relative h-[70vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
                <Image 
                    src="https://images.pexels.com/photos/6149892/pexels-photo-6149892.jpeg" 
                    alt="Uttarakhand Sacred Journal" 
                    fill 
                    priority
                    unoptimized={true}
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-background" />
                
                <div className="container relative z-10 px-6 text-center space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto space-y-4"
                    >
                        <Badge className="bg-accent/90 text-accent-foreground border-0 px-8 py-2 rounded-full font-black uppercase tracking-[0.4em] text-[10px] shadow-xl saffron-glow">
                            THE TRAVEL JOURNAL
                        </Badge>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase font-heading drop-shadow-2xl">
                            Soul of <br/> <span className="text-accent italic font-spiritual capitalize">Uttarakhand</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-bold uppercase tracking-tight font-heading drop-shadow-md">
                            Explore the traditions, spirituality, and vibrant folk life of the Northern frontier.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content Grid */}
            <section className="py-24 relative z-20 -mt-12 bg-background rounded-t-[3rem]">
                <div className="container px-6">
                    <div className="text-center mb-16 space-y-4">
                        <div className="flex items-center justify-center gap-3 text-accent font-black uppercase tracking-[0.4em] text-[10px]">
                            <Compass className="h-4 w-4" /> Discover Cultural Nodes
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-primary uppercase leading-tight font-heading">Expedition Insights</h2>
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
                                <Card className="group overflow-hidden rounded-[2.5rem] border-black/5 bg-white shadow-apple-deep hover:shadow-2xl transition-all duration-700 hover:-translate-y-2">
                                    <Link href={`/blogs/${item.id}`}>
                                        <CardContent className="p-0">
                                            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                                <img 
                                                    src={item.imageUrl} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover transition-transform duration-2000 group-hover:scale-110" 
                                                />
                                                <div className="absolute top-6 left-6">
                                                    <Badge className="bg-white/95 backdrop-blur-md text-primary border-0 font-black px-5 py-2 rounded-full text-[9px] uppercase tracking-widest shadow-lg">
                                                        {item.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="p-8 space-y-4">
                                                <div className="flex items-center gap-3 text-accent font-black uppercase tracking-[0.2em] text-[9px]">
                                                    <item.icon className="h-4 w-4" /> VERIFIED LOG
                                                </div>
                                                <h3 className="text-2xl font-black text-foreground leading-tight uppercase font-heading group-hover:text-primary transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-slate-500 font-medium text-xs leading-relaxed line-clamp-2">
                                                    {item.desc}
                                                </p>
                                                <div className="pt-6 border-t border-muted/50">
                                                    <Button variant="link" className="p-0 h-auto font-black text-[10px] uppercase tracking-[0.3em] text-primary hover:text-accent group">
                                                        Read Full Report <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
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
        </div>
    );
}
