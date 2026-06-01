'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { Calendar, Video, ArrowLeft, MapPin, Share2, Facebook, Twitter, Instagram, Bookmark, Sparkles, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const STATIC_BLOG_DATA: Record<string, any> = {
  'aipan-art-ritual-geometry': {
    title: "The Sacred Art of Aipan: Uttarakhand's Ritualistic Geometry",
    category: "Traditional Art",
    date: "May 20, 2024",
    description: "Aipan is the traditional folk art of Uttarakhand, specifically the Kumaon region. It is characterized by geometric patterns and symbolic motifs that hold deep religious and cultural significance.",
    image: "https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://www.youtube.com/embed/YpXq4_066G8",
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
    videoUrl: "https://www.youtube.com/embed/Z52p8z2W_Hw",
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
    videoUrl: "https://www.youtube.com/embed/YyM8r8K0kCc",
    content: `The Choliya Dance (छोलिया नृत्य) is a thousand-year-old dance form that originated in the Kumaon region. It is traditionally performed by men holding swords and shields, mimicking the movements of a battlefield.

Accompanied by the thunderous beats of the Nagara, Dhol, and the soulful wail of the Ransingha (a traditional trumpet), the dancers move in perfect sync, demonstrating agility, strength, and dramatic flair.

Historically, this dance was performed to celebrate victories in battle or to ward off evil spirits during long wedding processions through the dense mountain forests. Today, it is the heartbeat of every major cultural gathering in Uttarakhand, representing the undying bravery of the 'Pahadi' people.`
  }
};

function YouTubeEmbed({ url }: { url: string }) {
    return (
        <div className="relative aspect-video rounded-[3rem] overflow-hidden bg-slate-950 shadow-2xl my-24 group">
            <iframe
                src={url}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
            <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md px-5 py-2 rounded-full text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Video className="h-3 w-3 text-accent" /> Cultural Heritage Stream
            </div>
        </div>
    );
}

export default function BlogDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const blog = STATIC_BLOG_DATA[id];

    if (!blog) return notFound();

    return (
        <div className="min-h-screen bg-white">
            <div className="sticky top-[72px] z-40 bg-white/90 backdrop-blur-2xl border-b border-black/5 py-5">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Link href="/blogs" className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:text-accent transition-all group">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-2" /> Back to Archive
                    </Link>
                    <div className="flex gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 hover:bg-slate-100"><Share2 className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 hover:bg-slate-100"><Bookmark className="h-5 w-5" /></Button>
                    </div>
                </div>
            </div>

            <article className="pb-40">
                <header className="container mx-auto max-w-6xl pt-24 pb-16 px-4 text-center space-y-10">
                    <div className="flex justify-center">
                        <Badge className="bg-accent/10 text-accent border-0 font-black uppercase tracking-[0.5em] text-[10px] px-10 py-4 rounded-full">
                            <Sparkles className="h-3 w-3 mr-2 inline" /> {blog.category}
                        </Badge>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9] lg:-mx-20">
                        {blog.title}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        <span className="flex items-center gap-3"><Calendar className="h-5 w-5 text-accent" /> {blog.date}</span>
                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                        <span className="flex items-center gap-3"><MapPin className="h-5 w-5 text-accent" /> Northern Harrier Intel</span>
                    </div>
                </header>

                <div className="container mx-auto max-w-7xl px-4 mb-24">
                    <div className="relative aspect-[21/9] w-full rounded-[5rem] overflow-hidden shadow-apple-deep ring-12 ring-white bg-muted">
                        <Image src={blog.image} alt={blog.title} fill className="object-cover" priority />
                    </div>
                </div>

                <div className="container mx-auto max-w-6xl px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        <aside className="hidden lg:block lg:col-span-1 sticky top-52 h-fit">
                            <div className="flex flex-col gap-8 text-slate-300">
                                <Button variant="ghost" size="icon" className="hover:text-blue-600 rounded-full"><Facebook className="h-6 w-6" /></Button>
                                <Button variant="ghost" size="icon" className="hover:text-sky-400 rounded-full"><Twitter className="h-6 w-6" /></Button>
                                <Button variant="ghost" size="icon" className="hover:text-pink-600 rounded-full"><Instagram className="h-6 w-6" /></Button>
                            </div>
                        </aside>

                        <div className="lg:col-span-11 lg:pl-16">
                            <div className="prose prose-slate max-w-none prose-p:text-2xl prose-p:leading-[1.9] prose-p:text-slate-600">
                                <div className="whitespace-pre-wrap font-sans mb-16 text-3xl leading-[1.6] text-slate-800 font-medium opacity-90 border-l-8 border-accent pl-12 italic">
                                    {blog.description}
                                </div>

                                <div className="text-xl leading-relaxed text-slate-700 whitespace-pre-wrap font-sans">
                                    {blog.content}
                                </div>

                                {blog.videoUrl && <YouTubeEmbed url={blog.videoUrl} />}
                            </div>

                            <footer className="mt-40 p-16 bg-[#fcfcf9] rounded-[5rem] border border-black/5 flex flex-col md:flex-row items-center justify-between gap-12 shadow-inner">
                                <div className="flex items-center gap-8">
                                    <div className="h-28 w-28 rounded-full bg-primary flex items-center justify-center text-white font-black text-3xl shadow-2xl border-6 border-white">NH</div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase text-accent tracking-[0.5em]">Verified Cultural Authority</p>
                                        <p className="text-3xl font-black text-slate-900 tracking-tight">Northern Harrier Liaison</p>
                                        <div className="flex items-center gap-3 text-slate-400 font-bold text-sm">
                                            <UserCheck className="h-5 w-5 text-green-600" /> Preserving Himalayan Legacies
                                        </div>
                                    </div>
                                </div>
                                <Button asChild size="lg" className="rounded-full px-16 h-20 font-black text-lg bg-primary">
                                    <Link href="/search" className="flex items-center gap-6">
                                        Explore Stays Near These Traditions <ArrowLeft className="h-6 w-6 rotate-180" />
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
