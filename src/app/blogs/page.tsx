'use client';

import React from 'react';
import { Calendar, Sparkles, ArrowRight, Bookmark, Heart, Wind, Tent, Music, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/**
 * @fileOverview Northern Harrier Public Cultural Journal.
 * Reverted to a clean, symmetric grid with relevant Himalayan images.
 */

const CULTURAL_BLOGS = [
  {
    id: 'aipan-art-ritual-geometry',
    title: "Sacred Geometry: The Art of Aipan",
    category: "Traditional Art",
    date: "20 May 2024",
    description: "Discover the intricate ritualistic patterns that define the thresholds of Kumaoni homes.",
    imageId: "blog-aipan",
    icon: Sparkles
  },
  {
    id: 'pahadi-cuisine-himalayan-feast',
    title: "Soul of the Soil: Himalayan Feast",
    category: "Local Flavors",
    date: "15 May 2024",
    description: "A culinary voyage into high-altitude kitchens where black soybeans create a feast.",
    imageId: "blog-food",
    icon: Heart
  },
  {
    id: 'choliya-dance-warrior-past',
    title: "Echoes of Valor: Warrior Dance",
    category: "Folk Lore",
    date: "10 May 2024",
    description: "The rhythmic thunder of Nagaras and the flash of swords witnessing warrior legacy.",
    imageId: "blog-dance",
    icon: Wind
  },
  {
    id: 'harela-festival-nature-bond',
    title: "Harela: Celebrating the Green Bond",
    category: "Festivals",
    date: "05 May 2024",
    description: "A celebration of growth and greenery, where the seeds of tradition are sown.",
    imageId: "blog-festival",
    icon: Tent
  },
  {
    id: 'likhai-wood-carving-heritage',
    title: "Likhai: The Fading Art of Wood",
    category: "Heritage",
    date: "01 May 2024",
    description: "The magnificent wood carvings on the doors of traditional Himalayan houses.",
    imageId: "blog-heritage",
    icon: Building2
  },
  {
    id: 'jhora-chhapeli-soul-music',
    title: "Jhora: The Community's Heartbeat",
    category: "Folk Music",
    date: "25 April 2024",
    description: "The rhythmic community dance and soulful songs that define every Pahadi village.",
    imageId: "blog-music",
    icon: Music
  }
];

export default function BlogsPublicPage() {
    const getImageUrl = (id: string) => {
        const found = PlaceHolderImages.find(img => img.id === id);
        return found ? found.imageUrl : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800';
    };

    return (
        <div className="min-h-screen bg-[#fcfcf9] pb-32">
            {/* Header / Hero Section */}
            <section className="bg-[#003580] pt-24 pb-40 px-4">
                <div className="container mx-auto text-center">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 text-[#febb02] text-[10px] font-black uppercase tracking-widest">
                            <Sparkles className="h-4 w-4" /> The Cultural Archive
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                            Uttarakhand <br /> <span className="text-[#febb02]">Cultural Journal</span>
                        </h1>
                        <p className="text-lg text-white/70 max-w-xl mx-auto font-medium">
                            Exploring ancient arts, robust flavors, and the warrior spirit of the Northern Mountains.
                        </p>
                    </div>
                </div>
            </section>

            {/* Symmetric Content Grid */}
            <section className="py-24 px-4 -mt-20">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {CULTURAL_BLOGS.map((blog) => (
                            <Link key={blog.id} href={`/blogs/${blog.id}`} className="group">
                                <Card className="h-full rounded-2xl overflow-hidden border-border bg-white hover:shadow-xl transition-all duration-300 flex flex-col">
                                    <CardContent className="p-0 flex flex-col h-full">
                                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                            <Image 
                                                src={getImageUrl(blog.imageId)} 
                                                alt={blog.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <Badge className="bg-white/90 text-primary border-0 font-bold uppercase tracking-widest text-[9px] px-3 py-1 rounded-sm shadow-md">
                                                    {blog.category}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6 flex flex-col flex-grow space-y-4">
                                            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-primary" /> {blog.date}</span>
                                                <Bookmark className="h-3.5 w-3.5 opacity-30" />
                                            </div>
                                            
                                            <h2 className="text-xl font-black tracking-tight text-[#1a1a1a] group-hover:text-primary transition-colors leading-tight uppercase">
                                                {blog.title}
                                            </h2>
                                            
                                            <p className="text-muted-foreground font-medium text-sm line-clamp-3">
                                                {blog.description}
                                            </p>
                                            
                                            <div className="pt-4 mt-auto border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                                                Read Full Report <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
