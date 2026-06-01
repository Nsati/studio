'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { Calendar, Camera, ArrowLeft, MapPin, Share2, Facebook, Twitter, Instagram, Bookmark, Sparkles, UserCheck, Quote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

/**
 * @fileOverview Cinematic Detail View for Himalayan Discovery Essays.
 */

const STATIC_BLOG_DATA: Record<string, any> = {
  'aipan-art-ritual-geometry': {
    title: "The Sacred Art of Aipan: Uttarakhand's Ritualistic Geometry",
    category: "Traditional Art",
    date: "May 20, 2024",
    description: "Aipan is the traditional folk art of Uttarakhand, specifically the Kumaon region. It is characterized by geometric patterns and symbolic motifs that hold deep religious and cultural significance.",
    image: "https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&q=80&w=1080",
    imageHint: "Indian folk art",
    gallery: [
        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=1080",
        "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&q=80&w=1080",
        "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&q=80&w=1080"
    ],
    content: `Aipan (Kumaoni: ऐपण) is a traditional folk art specifically from the Kumaon region of Uttarakhand. It is a form of ritualistic painting that has been passed down through generations of women. 

The art is traditionally made using a base of red clay, known as 'Geru', over which designs are drawn with a white paste made from ground rice, called 'Biswar'. The designs are not merely decorative but serve as a spiritual conduit during ceremonies such as weddings, births, and local festivals like Harela and Diwali.

Key Motifs include:
• Saraswati Chowki: Drawn during learning ceremonies.
• Chamunda Peeth: Used for tantric rituals.
• Vasudhara: Continuous lines of rice paste representing the flow of nature's bounty.

In modern times, Aipan is moving from the thresholds of homes to canvases, clothes, and decorative items, becoming a symbol of Himalayan identity worldwide.`
  },
  'pahadi-cuisine-himalayan-feast': {
    title: "Bhatt ki Churkani & Mandua: A Soul-Warming Himalayan Feast",
    category: "Local Flavors",
    date: "May 15, 2024",
    description: "The food of Uttarakhand is simple, nutritious, and deeply rooted in the harsh but beautiful landscape of the mountains.",
    image: "https://images.unsplash.com/photo-1626777553732-489957d1f971?auto=format&fit=crop&q=80&w=1080",
    imageHint: "Indian thali",
    gallery: [
        "https://images.unsplash.com/photo-1601050633647-8f8f5f4ad474?auto=format&fit=crop&q=80&w=1080",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1080",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1080"
    ],
    content: `Uttarakhandi cuisine is a celebration of local ingredients. The high-altitude terrain produces grains and legumes that are incredibly dense in nutrition, essential for the physical demands of mountain life.

Bhatt ki Churkani is the crown jewel of Kumaoni food. Made from black soybeans slow-cooked in an iron wok, it develops a deep, earthy flavor that pairs perfectly with steamed rice. 

Mandua ki Roti (Ragi/Finger Millet Bread) is another staple. It is gluten-free, rich in calcium, and provides sustained energy. During winters, a dollop of Ghee and a bit of Jaggery on a hot Mandua roti is the ultimate comfort food.

Don't forget the 'Singori' (a sweet wrapped in Maalu leaves) and the iconic 'Bal Mithai' from Almora, covered in tiny white sugar balls that look like Himalayan snow.`
  },
  'choliya-dance-warrior-past': {
    title: "The Choliya Dance: Echoes of Kumaon's Warrior Past",
    category: "Folk Lore",
    date: "May 10, 2024",
    description: "Choliya is the traditional sword dance of Kumaon, showcasing the military prowess and artistic rhythm of the hills.",
    image: "https://images.unsplash.com/photo-1541011400305-64f1e9488a03?auto=format&fit=crop&q=80&w=1080",
    imageHint: "Tribal dance",
    gallery: [
        "https://images.unsplash.com/photo-1613941455255-081696a07677?auto=format&fit=crop&q=80&w=1080",
        "https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&q=80&w=1080",
        "https://images.unsplash.com/photo-1613580459569-0268579930f3?auto=format&fit=crop&q=80&w=1080"
    ],
    content: `The Choliya Dance (छोलिया नृत्य) is a thousand-year-old dance form that originated in the Kumaon region. It is traditionally performed by men holding swords and shields, mimicking the movements of a battlefield.

Accompanied by the thunderous beats of the Nagara, Dhol, and the soulful wail of the Ransingha (a traditional trumpet), the dancers move in perfect sync, demonstrating agility, strength, and dramatic flair.

Historically, this dance was performed to celebrate victories in battle or to ward off evil spirits during long wedding processions through the dense mountain forests. Today, it is the heartbeat of every major cultural gathering in Uttarakhand, representing the undying bravery of the 'Pahadi' people.`
  }
};

export default function BlogDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const blog = STATIC_BLOG_DATA[id];

    if (!blog) return notFound();

    return (
        <div className="min-h-screen bg-white selection:bg-accent selection:text-white">
            {/* Minimal Sticky Sub-Nav */}
            <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-2xl border-b border-black/5 py-4">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link href="/blogs" className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.5em] text-primary hover:text-accent transition-all group">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-3" /> Back to Archive
                    </Link>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10"><Share2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-accent"><Bookmark className="h-4 w-4 fill-current" /></Button>
                    </div>
                </div>
            </div>

            <article className="pb-48">
                {/* Symmetric Header Section */}
                <header className="container mx-auto max-w-6xl pt-24 pb-16 px-6 text-center space-y-12">
                    <div className="flex justify-center animate-in fade-in duration-1000">
                        <Badge className="bg-accent/10 text-accent border-0 font-black uppercase tracking-[0.5em] text-[10px] px-12 py-4 rounded-full">
                            <Sparkles className="h-3 w-3 mr-3 inline animate-pulse" /> {blog.category}
                        </Badge>
                    </div>
                    <h1 className="text-6xl md:text-[9rem] font-black tracking-tighter text-slate-900 leading-[0.85] lg:-mx-24 uppercase">
                        {blog.title}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                        <span className="flex items-center gap-4 border-r border-slate-200 pr-12"><Calendar className="h-5 w-5 text-accent" /> {blog.date}</span>
                        <span className="flex items-center gap-4"><MapPin className="h-5 w-5 text-accent" /> Northern Intelligence Node</span>
                    </div>
                </header>

                {/* Symmetric Hero Image */}
                <div className="container mx-auto max-w-7xl px-6 mb-24">
                    <div className="relative aspect-[21/9] w-full rounded-[4rem] overflow-hidden shadow-apple-deep ring-[1.5rem] ring-white bg-slate-100">
                        <Image 
                            src={blog.image} 
                            alt={blog.title} 
                            fill 
                            className="object-cover" 
                            priority 
                            data-ai-hint={blog.imageHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                </div>

                {/* Editorial Body */}
                <div className="container mx-auto max-w-6xl px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
                        {/* Social Sidebar */}
                        <aside className="hidden lg:block lg:col-span-1 sticky top-52 h-fit">
                            <div className="flex flex-col gap-10 text-slate-300">
                                <Button variant="ghost" size="icon" className="hover:text-blue-600 rounded-full transition-colors"><Facebook className="h-6 w-6" /></Button>
                                <Button variant="ghost" size="icon" className="hover:text-sky-400 rounded-full transition-colors"><Twitter className="h-6 w-6" /></Button>
                                <Button variant="ghost" size="icon" className="hover:text-pink-600 rounded-full transition-colors"><Instagram className="h-6 w-6" /></Button>
                            </div>
                        </aside>

                        {/* Content Column */}
                        <div className="lg:col-span-11 lg:pl-20 space-y-20">
                            <div className="relative">
                                <Quote className="absolute -left-16 -top-4 h-12 w-12 text-accent/20" />
                                <div className="whitespace-pre-wrap font-sans text-4xl leading-[1.4] text-slate-800 font-medium opacity-90 border-l-[10px] border-accent pl-12 italic tracking-tight">
                                    {blog.description}
                                </div>
                            </div>

                            <div className="prose prose-slate max-w-none prose-p:text-2xl prose-p:leading-[1.85] prose-p:text-slate-600 prose-p:font-light font-sans">
                                {blog.content.split('\n\n').map((para, i) => (
                                    <p key={i} className="mb-10">{para}</p>
                                ))}
                            </div>

                            {/* Symmetric Visual Collection Gallery */}
                            <div className="pt-24 space-y-12">
                                <div className="flex items-center gap-6">
                                    <Camera className="h-6 w-6 text-accent" />
                                    <h3 className="text-sm font-black uppercase tracking-[0.5em] text-slate-900">Visual Collection</h3>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {blog.gallery.map((img: string, i: number) => (
                                        <div key={i} className={`relative rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-1000 hover:scale-[1.02] ${i === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-square'}`}>
                                            <Image 
                                                src={img} 
                                                alt={`Gallery ${i}`} 
                                                fill 
                                                className="object-cover"
                                                data-ai-hint="India culture"
                                            />
                                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Symmetric Footer Liaison */}
                            <footer className="mt-48 p-20 bg-[#fcfcf9] rounded-[4rem] border border-black/5 flex flex-col md:flex-row items-center justify-between gap-16 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                                <div className="flex items-center gap-10 relative z-10">
                                    <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center text-white font-black text-4xl shadow-2xl border-8 border-white">NH</div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase text-accent tracking-[0.5em]">Verified Expedition Intelligence</p>
                                        <p className="text-4xl font-black text-slate-900 tracking-tighter">Northern Harrier Liaison</p>
                                        <div className="flex items-center gap-4 text-slate-400 font-bold text-sm">
                                            <UserCheck className="h-5 w-5 text-green-600" /> Curating Himalayan Legacies Since 2024
                                        </div>
                                    </div>
                                </div>
                                <Button asChild size="lg" className="rounded-full px-16 h-20 font-black text-lg bg-primary hover:bg-slate-900 transition-all shadow-2xl relative z-10 active:scale-95 group">
                                    <Link href="/search" className="flex items-center gap-8">
                                        Explore Stays Nearby <ArrowLeft className="h-6 w-6 rotate-180 transition-transform group-hover:translate-x-3" />
                                    </Link>
                                </Button>
                            </footer>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}

