'use client';

import React from 'react';
import { Compass, Calendar, Sparkles, Utensils, Music, Mountain, ArrowRight, Camera, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

// Curated Static Content: The Soul of Uttarakhand (Photo Journal Edition)
const CULTURAL_BLOGS = [
  {
    id: 'aipan-art-ritual-geometry',
    title: "The Sacred Art of Aipan: Uttarakhand's Ritualistic Geometry",
    category: "Traditional Art",
    date: "20 May 2024",
    description: "Discover the intricate red-and-white patterns that adorn the doorsteps of Kumaoni homes, symbolizing prosperity and divine protection.",
    image: "https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&q=80&w=1080",
    details: "Aipan is not just a drawing; it is a prayer. Practiced primarily by the women of Kumaon, this folk art uses a red clay base (Geru) and white rice paste (Biswar) to create complex geometric motifs."
  },
  {
    id: 'pahadi-cuisine-himalayan-feast',
    title: "Bhatt ki Churkani & Mandua: A Soul-Warming Himalayan Feast",
    category: "Local Flavors",
    date: "15 May 2024",
    description: "Step into a Pahadi kitchen to taste the robust flavors of black soybeans, ragi rotis, and the legendary Bal Mithai.",
    image: "https://images.unsplash.com/photo-1626777553732-489957d1f971?auto=format&fit=crop&q=80&w=1080",
    details: "Uttarakhand's cuisine is defined by its organic roots and high nutritional value. From the protein-rich Gahat Dal to the tangy Bhang ki Chutney, every dish is a testament to the resilient spirit."
  },
  {
    id: 'choliya-dance-warrior-past',
    title: "The Choliya Dance: Echoes of Kumaon's Warrior Past",
    category: "Folk Lore",
    date: "10 May 2024",
    description: "Witness the breathtaking sword-dance performed with rhythmic drums, reflecting the thousand-year-old history of Himalayan warriors.",
    image: "https://images.unsplash.com/photo-1541011400305-64f1e9488a03?auto=format&fit=crop&q=80&w=1080",
    details: "Originating in the Kumaon region, Choliya is more than a dance—it's a vibrant display of martial skill, music, and colorful attire, traditionally performed during wedding processions."
  }
];

export default function BlogsPublicPage() {
    return (
        <div className="min-h-screen bg-[#fcfcf9]">
            {/* Cultural Immersive Hero */}
            <section className="bg-primary pt-32 pb-48 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <Mountain className="absolute -right-20 -bottom-20 w-[600px] h-[600px] text-white" strokeWidth={0.5} />
                </div>
                <div className="container mx-auto relative z-10 text-center md:text-left">
                    <div className="max-w-4xl space-y-8">
                        <div className="inline-flex items-center gap-3 bg-accent/20 backdrop-blur-md px-6 py-2 rounded-full border border-accent/30 text-accent text-[10px] font-black uppercase tracking-[0.4em] animate-in fade-in slide-in-from-left-4 duration-700 mx-auto md:mx-0">
                            <Sparkles className="h-4 w-4" /> The Northern Harrier Photo Archive
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85]">
                            Vibrant <br /> <span className="text-accent italic font-heading font-medium">Devbhumi</span>
                        </h1>
                        <p className="text-xl md:text-3xl text-white/70 font-medium max-w-3xl leading-relaxed tracking-tight">
                            A visual journey through the timeless traditions and ancient arts of the Himalayas. Capturing the essence of Uttarakhand, one frame at a time.
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fcfcf9] to-transparent" />
            </section>

            {/* Stories Grid */}
            <section className="py-20 px-4 -mt-32">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {CULTURAL_BLOGS.map((blog, idx) => (
                            <Link 
                                key={blog.id} 
                                href={`/blogs/${blog.id}`}
                                className={idx === 0 ? "md:col-span-2 lg:col-span-2" : "col-span-1"}
                            >
                                <Card className="group rounded-[4rem] overflow-hidden border-0 shadow-apple-deep bg-white hover:shadow-2xl transition-all duration-1000 h-full flex flex-col">
                                    <CardContent className="p-0 flex flex-col h-full">
                                        <div className={`relative ${idx === 0 ? "aspect-[21/9]" : "aspect-[16/10]"} overflow-hidden bg-muted`}>
                                            <Image 
                                                src={blog.image} 
                                                alt={blog.title}
                                                fill
                                                className="object-cover transition-transform duration-3000 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                            
                                            <div className="absolute top-10 left-10">
                                                <Badge className="bg-white/95 backdrop-blur-md text-primary border-0 font-black uppercase tracking-[0.2em] text-[10px] px-6 py-3 rounded-full shadow-2xl">
                                                    {blog.category}
                                                </Badge>
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-white/20 backdrop-blur-md p-6 rounded-full border border-white/40">
                                                    <Camera className="h-10 w-10 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="p-12 md:p-16 flex flex-col flex-grow space-y-6">
                                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                                <Calendar className="h-4 w-4 text-accent" /> {blog.date}
                                                <span className="opacity-30">|</span>
                                                <span className="text-primary/60">COLLECTIVE WISDOM</span>
                                            </div>
                                            
                                            <h2 className={`${idx === 0 ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl"} font-black tracking-tighter text-slate-900 group-hover:text-primary transition-colors leading-[1]`}>
                                                {blog.title}
                                            </h2>
                                            
                                            <p className="text-slate-500 font-medium leading-relaxed line-clamp-3 text-lg md:text-xl">
                                                {blog.description}
                                            </p>
                                            
                                            <div className="pt-8 mt-auto border-t border-slate-50 flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-4 group-hover:translate-x-2 transition-transform">
                                                    View Photo Essay <ArrowRight className="h-5 w-5" />
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

            {/* Immersive Photo Strip */}
            <section className="py-24 bg-primary text-white overflow-hidden relative">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto space-y-10">
                        <Badge className="bg-accent text-white font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full text-[10px]">Visual Intelligence</Badge>
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85]">Witness The <br/><span className="italic font-medium text-accent">Himalayan</span> Magic</h2>
                        <p className="text-xl text-white/70 font-medium leading-relaxed">Captured through the professional lens of Northern Harrier expeditions.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
                        {[
                            "https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&q=80&w=800",
                            "https://images.unsplash.com/photo-1613580459569-0268579930f3?auto=format&fit=crop&q=80&w=800",
                            "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800",
                            "https://images.unsplash.com/photo-1613941455255-081696a07677?auto=format&fit=crop&q=80&w=800"
                        ].map((src, i) => (
                            <div key={i} className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl group">
                                <Image src={src} alt="Culture" fill className="object-cover transition-transform duration-1000 group-hover:scale-125" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
