
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
 * Symmetric layout with clean English copy.
 */

const CULTURAL_PILLARS = [
  {
    id: 'aipan-art-ritual-geometry',
    title: "Sacred Geometry: Aipan",
    category: "Traditional Art",
    desc: "A beautiful ritualistic folk art that welcomes positive energy.",
    imageUrl: "https://images.pexels.com/photos/15815340/pexels-photo-15815340.jpeg",
    icon: Sparkles
  },
  {
    id: 'pahadi-cuisine-himalayan-feast',
    title: "Soul of the Soil: Cuisine",
    category: "Local Flavors",
    desc: "Discover the nutritious and unique flavors of the Himalayan belt.",
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
    desc: "Celebrating the arrival of monsoon and the cycle of life.",
    imageUrl: "https://images.pexels.com/photos/946186/pexels-photo-946186.jpeg",
    icon: Calendar
  },
  {
    id: 'likhai-wood-carving-heritage',
    title: "Legacy in Wood: Likhai",
    category: "Heritage",
    desc: "Intricate wood carvings found on ancient Himalayan thresholds.",
    imageUrl: "https://images.pexels.com/photos/4611607/pexels-photo-4611607.jpeg",
    icon: Building2
  },
  {
    id: 'jhora-chhapeli-soul-music',
    title: "The Heartbeat: Folk Music",
    category: "Folk Music",
    desc: "Rhythmic community dances representing unity and love.",
    imageUrl: "https://images.pexels.com/photos/10405322/pexels-photo-10405322.jpeg",
    icon: Music
  }
];

export default function BlogsPublicPage() {
    return (
        <div className="min-h-screen bg-white selection:bg-accent selection:text-white font-sans">
            
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[450px] w-full flex items-center justify-center overflow-hidden">
                <Image 
                    src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1920" 
                    alt="Uttarakhand Heritage" 
                    fill 
                    priority
                    unoptimized={true}
                    className="object-cover brightness-[0.5]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />
                
                <div className="container relative z-10 px-6 text-center space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-4"
                    >
                        <Badge className="bg-white/10 backdrop-blur-md text-accent border border-white/20 px-8 py-2 rounded-full font-black uppercase tracking-[0.4em] text-[10px] mb-2">
                            The Travel Journal
                        </Badge>
                        <h1 className="text-5xl md:text-[6rem] font-black text-white tracking-tighter leading-none uppercase">
                            Soul of <br/> <span className="text-accent italic font-heading font-light capitalize">Uttarakhand</span>
                        </h1>
                        <p className="mt-2 text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
                            Explore the traditions, spirituality, and vibrant folk life of the Northern frontier.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content Grid */}
            <section className="py-20 bg-white">
                <div className="container px-6">
                    <div className="text-center mb-16 space-y-3">
                        <div className="flex items-center justify-center gap-3 text-accent font-black uppercase tracking-[0.4em] text-[9px]">
                            <Compass className="h-4 w-4" /> Explore Local Culture
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase leading-none">Cultural Heritage</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                                <img 
                                                    src={item.imageUrl} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                                />
                                                <div className="absolute top-6 left-6">
                                                    <Badge className="bg-white/95 backdrop-blur-md text-primary border-0 font-black px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest shadow-sm">
                                                        {item.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="p-8 space-y-4">
                                                <div className="flex items-center gap-3 text-accent font-black uppercase tracking-[0.2em] text-[8px]">
                                                    <item.icon className="h-4 w-4" /> Verified Insights
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase group-hover:text-primary transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-slate-400 font-medium text-xs leading-relaxed line-clamp-2">
                                                    {item.desc}
                                                </p>
                                                <div className="pt-4 border-t border-slate-50">
                                                    <Button variant="link" className="p-0 h-auto font-black text-[10px] uppercase tracking-widest text-primary hover:text-accent group">
                                                        Read More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
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
