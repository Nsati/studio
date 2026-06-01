'use client';

import React from 'react';
import { Calendar, Sparkles, ArrowRight, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

/**
 * @fileOverview Northern Harrier Public Photo Journal.
 * A highly symmetric, luxurious editorial layout showcasing Uttarakhand's heritage.
 */

const CULTURAL_BLOGS = [
  {
    id: 'aipan-art-ritual-geometry',
    title: "Sacred Geometry: The Living Art of Aipan",
    category: "Traditional Art",
    date: "20 May 2024",
    description: "The intricate red-and-white ritualistic patterns that define the thresholds of Kumaoni homes, symbolizing a divine gateway to prosperity.",
    image: "https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&q=80&w=1080",
    hint: "Indian folk art"
  },
  {
    id: 'pahadi-cuisine-himalayan-feast',
    title: "Soul of the Soil: Bhatt ki Churkani & Mandua",
    category: "Local Flavors",
    date: "15 May 2024",
    description: "A culinary voyage into the high-altitude kitchens where black soybeans and finger millets create a feast for the soul.",
    image: "https://images.unsplash.com/photo-1626777553732-489957d1f971?auto=format&fit=crop&q=80&w=1080",
    hint: "Indian thali"
  },
  {
    id: 'choliya-dance-warrior-past',
    title: "Echoes of Valor: The Choliya Warrior Dance",
    category: "Folk Lore",
    date: "10 May 2024",
    description: "The rhythmic thunder of Nagaras and the flash of swords—witnessing the thousand-year-old martial legacy of the hills.",
    image: "https://images.unsplash.com/photo-1541011400305-64f1e9488a03?auto=format&fit=crop&q=80&w=1080",
    hint: "Tribal dance"
  }
];

export default function BlogsPublicPage() {
    return (
        <div className="min-h-screen bg-[#fcfcf9] selection:bg-accent selection:text-white">
            {/* Symmetric Immersive Hero */}
            <section className="bg-primary pt-32 pb-48 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="grid grid-cols-6 h-full w-full">
                        {Array.from({length: 12}).map((_, i) => (
                            <div key={i} className="border-r border-b border-white/20" />
                        ))}
                    </div>
                </div>
                <div className="container mx-auto relative z-10 text-center">
                    <div className="max-w-4xl mx-auto space-y-10">
                        <div className="inline-flex items-center gap-3 bg-accent/20 backdrop-blur-md px-8 py-3 rounded-full border border-accent/30 text-accent text-[10px] font-black uppercase tracking-[0.5em] animate-in fade-in zoom-in duration-1000">
                            <Sparkles className="h-4 w-4" /> The Cultural Archive
                        </div>
                        <h1 className="text-6xl md:text-[10rem] font-black text-white tracking-tighter leading-[0.8] uppercase">
                            Vibrant <br /> <span className="text-accent italic font-heading font-light capitalize">Devbhumi</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed tracking-tight border-t border-white/10 pt-10">
                            A symmetric exploration of ancient arts, robust flavors, and the warrior spirit of the Northern Himalayas.
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#fcfcf9] to-transparent" />
            </section>

            {/* Symmetric Grid Section */}
            <section className="py-24 px-4 -mt-32">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-16">
                        {CULTURAL_BLOGS.map((blog, idx) => (
                            <Link 
                                key={blog.id} 
                                href={`/blogs/${blog.id}`}
                                className={idx === 0 ? "md:col-span-2" : "col-span-1"}
                            >
                                <Card className="group rounded-[3rem] overflow-hidden border-0 shadow-apple-deep bg-white hover:shadow-2xl transition-all duration-1000 h-full flex flex-col relative">
                                    <CardContent className="p-0 flex flex-col h-full">
                                        <div className={`relative ${idx === 0 ? "aspect-[21/9]" : "aspect-[16/10]"} overflow-hidden bg-slate-100`}>
                                            <Image 
                                                src={blog.image} 
                                                alt={blog.title}
                                                fill
                                                className="object-cover transition-transform duration-3000 group-hover:scale-105"
                                                data-ai-hint={blog.hint}
                                            />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-700" />
                                            
                                            <div className="absolute top-10 left-10">
                                                <Badge className="bg-white/95 backdrop-blur-md text-primary border-0 font-black uppercase tracking-[0.2em] text-[10px] px-6 py-3 rounded-full shadow-2xl">
                                                    {blog.category}
                                                </Badge>
                                            </div>
                                            
                                            <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                                <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center text-white shadow-xl">
                                                    <ArrowRight className="h-8 w-8" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="p-12 md:p-20 flex flex-col flex-grow space-y-8">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                                    <Calendar className="h-4 w-4 text-accent" /> {blog.date}
                                                </div>
                                                <Bookmark className="h-5 w-5 text-slate-200 group-hover:text-accent transition-colors" />
                                            </div>
                                            
                                            <h2 className={`${idx === 0 ? "text-5xl md:text-7xl" : "text-4xl md:text-5xl"} font-black tracking-tighter text-slate-900 group-hover:text-primary transition-colors leading-[0.9] uppercase`}>
                                                {blog.title}
                                            </h2>
                                            
                                            <p className="text-slate-500 font-medium leading-relaxed line-clamp-3 text-xl md:text-2xl italic">
                                                "{blog.description}"
                                            </p>
                                            
                                            <div className="pt-10 mt-auto border-t border-slate-100 flex items-center justify-start">
                                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary flex items-center gap-6">
                                                    Open Photo Essay <div className="h-px w-20 bg-primary/20 group-hover:w-32 transition-all duration-700" />
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

            {/* Symmetry & Texture Section */}
            <section className="py-40 bg-slate-950 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="grid grid-cols-12 h-full w-full">
                        {Array.from({length: 12}).map((_, i) => (
                            <div key={i} className="border-r border-white/20 h-full" />
                        ))}
                    </div>
                </div>
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <Badge className="bg-accent text-white font-black uppercase tracking-[0.5em] px-10 py-3 rounded-full text-[10px] shadow-2xl">Visual Excellence</Badge>
                        <h2 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.8] uppercase">The <br/><span className="italic font-light text-accent lowercase font-heading">Northern</span> Lens</h2>
                        <p className="text-2xl text-white/50 font-light max-w-2xl mx-auto leading-relaxed">Every frame captured in our archive is a verified piece of Himalayan intelligence, preserving the legacy of Uttarakhand for the world.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-32">
                        {[
                            {url: "https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&q=80&w=800", hint: "India mountain"},
                            {url: "https://images.unsplash.com/photo-1613580459569-0268579930f3?auto=format&fit=crop&q=80&w=800", hint: "Temple morning"},
                            {url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800", hint: "River ganga"},
                            {url: "https://images.unsplash.com/photo-1613941455255-081696a07677?auto=format&fit=crop&q=80&w=800", hint: "Dholak player"}
                        ].map((src, i) => (
                            <div key={i} className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/5">
                                <Image 
                                    src={src.url} 
                                    alt="Archive" 
                                    fill 
                                    className="object-cover transition-transform duration-2000 group-hover:scale-125 grayscale group-hover:grayscale-0"
                                    data-ai-hint={src.hint}
                                />
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
