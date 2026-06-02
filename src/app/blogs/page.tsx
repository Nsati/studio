'use client';

import React from 'react';
import { Calendar, Sparkles, ArrowRight, Bookmark, MapPin, Wind, Tent, Heart, Music, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/**
 * @fileOverview Northern Harrier Public Cultural Journal.
 * Redesigned to match the vibrant, content-rich style of 'ukculture'.
 * Symmetric 3-column editorial grid for a premium magazine aesthetic.
 */

const CULTURAL_BLOGS = [
  {
    id: 'aipan-art-ritual-geometry',
    title: "Sacred Geometry: The Art of Aipan",
    category: "Traditional Art",
    date: "20 May 2024",
    description: "Discover the intricate ritualistic patterns that define the thresholds of Kumaoni homes, symbolizing a divine gateway.",
    imageId: "blog-aipan",
    icon: Sparkles
  },
  {
    id: 'pahadi-cuisine-himalayan-feast',
    title: "Soul of the Soil: Himalayan Feast",
    category: "Local Flavors",
    date: "15 May 2024",
    description: "A culinary voyage into high-altitude kitchens where black soybeans and finger millets create a feast for the soul.",
    imageId: "blog-food",
    icon: Heart
  },
  {
    id: 'choliya-dance-warrior-past',
    title: "Echoes of Valor: Warrior Dance",
    category: "Folk Lore",
    date: "10 May 2024",
    description: "The rhythmic thunder of Nagaras and the flash of swords witnessing the thousand-year-old martial legacy.",
    imageId: "blog-dance",
    icon: Wind
  },
  {
    id: 'harela-festival-nature-bond',
    title: "Harela: Celebrating the Green Bond",
    category: "Festivals",
    date: "05 May 2024",
    description: "A celebration of growth and greenery, where the seeds of tradition are sown into the heart of the Himalayas.",
    imageId: "blog-festival",
    icon: Tent
  },
  {
    id: 'likhai-wood-carving-heritage',
    title: "Likhai: The Fading Art of Wood",
    category: "Heritage",
    date: "01 May 2024",
    description: "The magnificent wood carvings on the doors of traditional Himalayan houses tell stories of divine protection.",
    imageId: "blog-heritage",
    icon: Building2
  },
  {
    id: 'jhora-chhapeli-soul-music',
    title: "Jhora: The Community's Heartbeat",
    category: "Folk Music",
    date: "25 April 2024",
    description: "The rhythmic community dance and soulful songs that define the social fabric of every Pahadi village.",
    imageId: "blog-music",
    icon: Music
  }
];

export default function BlogsPublicPage() {
    const getImageUrl = (id: string) => {
        return PlaceHolderImages.find(img => img.id === id)?.imageUrl || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800';
    };

    return (
        <div className="min-h-screen bg-[#fcfcf9] selection:bg-accent selection:text-white pb-32">
            {/* Immersive Cultural Hero */}
            <section className="bg-primary pt-32 pb-48 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                    <Image src={getImageUrl('blog-aipan')} alt="Pattern" fill className="object-cover mix-blend-overlay" />
                </div>
                <div className="container mx-auto relative z-10 text-center">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="inline-flex items-center gap-3 bg-accent/20 backdrop-blur-md px-8 py-3 rounded-full border border-accent/30 text-accent text-[10px] font-black uppercase tracking-[0.5em]">
                            <Sparkles className="h-4 w-4" /> The Cultural Archive
                        </div>
                        <h1 className="text-6xl md:text-[7.5rem] font-black text-white tracking-tighter leading-[0.8] uppercase">
                            Soul of <br /> <span className="text-accent italic font-heading font-light capitalize">Devbhumi</span>
                        </h1>
                        <p className="text-xl text-white/60 font-medium max-w-xl mx-auto leading-relaxed border-t border-white/10 pt-8 mt-4">
                            A symmetric exploration of ancient arts, robust flavors, and the warrior spirit of Uttarakhand.
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#fcfcf9] to-transparent" />
            </section>

            {/* Symmetric Content Grid */}
            <section className="py-24 px-4 -mt-32">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {CULTURAL_BLOGS.map((blog) => (
                            <Link 
                                key={blog.id} 
                                href={`/blogs/${blog.id}`}
                                className="group"
                            >
                                <Card className="h-full rounded-[3.5rem] overflow-hidden border-0 shadow-apple-deep bg-white hover:shadow-2xl transition-all duration-700 flex flex-col gold-edge">
                                    <CardContent className="p-0 flex flex-col h-full">
                                        <div className="relative aspect-[16/11] overflow-hidden bg-slate-100">
                                            <Image 
                                                src={getImageUrl(blog.imageId)} 
                                                alt={blog.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                className="object-cover transition-transform duration-2000 group-hover:scale-110"
                                            />
                                            <div className="absolute top-8 left-8">
                                                <Badge className="bg-white/95 backdrop-blur-md text-primary border-0 font-black uppercase tracking-widest text-[9px] px-5 py-2.5 rounded-full shadow-lg">
                                                    {blog.category}
                                                </Badge>
                                            </div>
                                            <div className="absolute bottom-6 right-8">
                                                <div className="h-12 w-12 bg-accent rounded-full flex items-center justify-center text-white shadow-xl transition-transform group-hover:rotate-[360deg] duration-1000">
                                                    <blog.icon className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="p-10 flex flex-col flex-grow space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                    <Calendar className="h-4 w-4 text-accent" /> {blog.date}
                                                </div>
                                                <Bookmark className="h-4 w-4 text-slate-200 group-hover:text-accent transition-colors" />
                                            </div>
                                            
                                            <h2 className="text-3xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors leading-[1.1] uppercase line-clamp-2">
                                                {blog.title}
                                            </h2>
                                            
                                            <p className="text-slate-500 font-medium leading-relaxed line-clamp-3 text-sm italic flex-grow">
                                                "{blog.description}"
                                            </p>
                                            
                                            <div className="pt-8 mt-auto border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                                                    Discover Legacy <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
