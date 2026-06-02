
'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { Calendar, ArrowLeft, MapPin, Share2, Quote, Sparkles, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

/**
 * @fileOverview Cinematic Detail View for Himalayan Discovery Essays.
 * Uses Direct HD URLs for better visual consistency.
 */

const STATIC_BLOG_DATA: Record<string, any> = {
  'aipan-art-ritual-geometry': {
    title: "Sacred Geometry: The Art of Aipan",
    category: "Traditional Art",
    date: "May 20, 2024",
    description: "Aipan is the spiritual folk art of Uttarakhand, specifically the Kumaon region. It is characterized by geometric patterns and symbolic motifs that hold deep religious significance.",
    imageUrl: "https://images.pexels.com/photos/15815340/pexels-photo-15815340.jpeg",
    content: `Aipan (Kumaoni: ऐपण) is a traditional folk art specifically from the Kumaon region of Uttarakhand. It is a form of ritualistic painting that has been passed down through generations of women, traditionally drawn on the thresholds of homes to welcome divine energies.\n\nThe art is traditionally made using a base of deep red clay, known as 'Geru', over which design motifs are drawn with a white paste made from ground rice, called 'Biswar'. The designs are not merely decorative but serve as a spiritual conduit during ceremonies such as weddings, births, and local festivals like Harela and Diwali.\n\nKey Motifs include:\n• Ganesh Chowki: Drawn during auspicious beginnings.\n• Lakshmi Peeth: Used for prosperity during Diwali.\n• Vasudhara: Representing the eternal flow of nature's bounty.`
  },
  'pahadi-cuisine-himalayan-feast': {
    title: "Soul of the Soil: A Himalayan Feast",
    category: "Local Flavors",
    date: "May 15, 2024",
    description: "The food of Uttarakhand is simple, dense in nutrition, and deeply rooted in the harsh but beautiful landscape of the northern mountains.",
    imageUrl: "https://images.pexels.com/photos/30205313/pexels-photo-30205313.jpeg",
    content: `Uttarakhandi cuisine is a celebration of local ingredients and resilience. The high-altitude terrain produces grains and legumes that are incredibly dense in nutrition.\n\nBhatt ki Churkani is the crown jewel of Kumaoni food. Made from black soybeans slow-cooked in an iron wok, it develops a deep, earthy flavor that pairs perfectly with steamed rice and a dollop of fresh ghee.\n\nMandua ki Roti (Finger Millet Bread) is another staple. It is gluten-free, rich in calcium, and provides sustained energy. During winters, a piece of Jaggery on a hot Mandua roti is the ultimate comfort food for any traveler.`
  },
  'choliya-dance-warrior-past': {
    title: "Echoes of Valor: The Choliya Dance",
    category: "Folk Lore",
    date: "May 10, 2024",
    description: "Choliya is the traditional sword dance of Kumaon, showcasing the military prowess and artistic rhythm of the Himalayan hills.",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIch1Ra3e7tUarWTPbij4k631cwRR6PxETbQ&s",
    content: `The Choliya Dance (छोलिया नृत्य) is a thousand-year-old martial art form that originated in the Kumaon region. It is traditionally performed by men holding swords and shields, mimicking ancient battlefield movements.\n\nAccompanied by the thunderous beats of the Nagara, Dhol, and the soulful wail of the Ransingha (a traditional trumpet), the dancers move in perfect sync, demonstrating agility and strength. Historically performed to celebrate victories, it is today the heartbeat of every major cultural gathering in Uttarakhand.`
  },
  'harela-festival-nature-bond': {
    title: "Harela: Celebrating the Green Bond",
    category: "Festivals",
    date: "May 05, 2024",
    description: "Harela is the festival of greenery and nature's bounty, marking the beginning of the monsoon and sowing season in the hills.",
    imageUrl: "https://images.pexels.com/photos/946186/pexels-photo-946186.jpeg",
    content: `Harela (Kumaoni: हरेला) is celebrated in the Kumaon region three times a year, but the most significant one falls during the monsoon. It symbolizes the arrival of the rains and the bond between the people and their land.\n\nTen days before the festival, seeds of five or seven types of grains are sown in small baskets inside the home. These shoots, called Harela, are then offered to the gods and used to bless the elders of the family. It is a festival of hope, growth, and the eternal cycle of life in the Himalayas.`
  },
  'likhai-wood-carving-heritage': {
    title: "Likhai: The Fading Art of Wood",
    category: "Heritage",
    date: "May 01, 2024",
    description: "The traditional wood carving of Uttarakhand, known as Likhai, is an intricate craft found on the doors and windows of ancient Pahadi houses.",
    imageUrl: "https://images.pexels.com/photos/4611607/pexels-photo-4611607.jpeg",
    content: `Likhai is the traditional wood-carving craft of Uttarakhand. The windows (jharokhas) and doors (kholy) of traditional houses were often carved with intricate geometric patterns, floral motifs, and depictions of deities.\n\nThis art form was not just aesthetic but had structural and spiritual significance. The carvings were often made on dense Himalayan timber like Cedar and Deodar, ensuring they lasted for centuries. Today, Likhai is a dying art, preserved mostly in remote villages and heritage museums.`
  },
  'jhora-chhapeli-soul-music': {
    title: "Jhora: The Community's Heartbeat",
    category: "Folk Music",
    date: "April 25, 2024",
    description: "Folk music in Uttarakhand is the soul of its people, with Jhora being the rhythmic community dance that brings villages together.",
    imageUrl: "https://images.pexels.com/photos/10405322/pexels-photo-10405322.jpeg",
    content: `Folk music and dance are the lifeblood of Himalayan life. Jhora is a community dance performed in a circle, where people of all ages join hands and sing ballads of love, valor, and devotion.\n\nThe Hurka (a small drum) provides the rhythmic base, and the songs often tell the stories of local legends or the daily struggles and joys of mountain life. Chhapeli, on the other hand, is a dance of courtship, performed with great agility and grace. Together, these forms represent the unbreakable spirit of the Devbhumi.`
  }
};

export default function BlogDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const blog = STATIC_BLOG_DATA[id];

    if (!blog) return notFound();

    return (
        <div className="min-h-screen bg-white selection:bg-accent selection:text-white">
            {/* Sticky Navigation Sub-Header */}
            <div className="sticky top-[72px] z-40 bg-white/90 backdrop-blur-2xl border-b border-black/5 py-4">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link href="/blogs" className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.5em] text-primary hover:text-accent transition-all group">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-3" /> Back to Journal
                    </Link>
                    <div className="flex items-center gap-4">
                        <Badge className="bg-slate-100 text-slate-400 border-0 font-bold text-[9px] uppercase tracking-widest px-3 py-1">READING TIME: 5 MIN</Badge>
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-black/5"><Share2 className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>

            <article className="pb-48">
                {/* Editorial Header */}
                <header className="container mx-auto max-w-5xl pt-24 pb-16 px-6 text-center space-y-12">
                    <Badge className="bg-accent/10 text-accent border-0 font-black uppercase tracking-[0.4em] text-[10px] px-10 py-3 rounded-full">
                        <Sparkles className="h-3 w-3 mr-3 inline animate-pulse" /> {blog.category}
                    </Badge>
                    <h1 className="text-6xl md:text-[6rem] font-black tracking-tighter text-slate-900 leading-[0.85] uppercase">
                        {blog.title}
                    </h1>
                    <div className="flex items-center justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        <span className="flex items-center gap-3"><Calendar className="h-4 w-4 text-accent" /> {blog.date}</span>
                        <span className="flex items-center gap-3"><MapPin className="h-4 w-4 text-accent" /> Uttarakhand Legacy</span>
                    </div>
                </header>

                {/* Wide Hero Visual */}
                <div className="container mx-auto max-w-7xl px-6 mb-24">
                    <div className="relative aspect-[21/9] w-full rounded-[4rem] overflow-hidden shadow-apple-deep bg-slate-100 gold-edge">
                        <Image 
                            src={blog.imageUrl} 
                            alt={blog.title} 
                            fill 
                            className="object-cover" 
                            priority 
                            unoptimized={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                </div>

                {/* Narrative Content */}
                <div className="container mx-auto max-w-4xl px-6">
                    <div className="space-y-16">
                        <div className="relative">
                            <Quote className="absolute -left-12 -top-4 h-12 w-12 text-accent/20" />
                            <div className="font-sans text-3xl leading-[1.4] text-slate-800 font-medium border-l-8 border-accent pl-12 italic">
                                {blog.description}
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none prose-p:text-xl prose-p:leading-[1.9] prose-p:text-slate-600 font-sans">
                            {blog.content.split('\n\n').map((para: string, i: number) => (
                                <p key={i} className="mb-10">{para}</p>
                            ))}
                        </div>

                        {/* Author/Source Badge */}
                        <footer className="mt-32 p-16 bg-[#fcfcf9] rounded-[3.5rem] border border-black/5 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                            <div className="flex items-center gap-8">
                                <div className="h-28 w-28 rounded-full bg-primary flex items-center justify-center text-white font-black text-3xl shadow-xl">NH</div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase text-accent tracking-[0.4em]">Verified Himalayan Liaison</p>
                                    <p className="text-4xl font-black text-slate-900 tracking-tight">Harrier Intelligence</p>
                                    <div className="flex items-center gap-3 text-slate-400 font-bold text-xs justify-center md:justify-start uppercase tracking-widest">
                                        <UserCheck className="h-4 w-4 text-green-600" /> Cultural Legacies
                                    </div>
                                </div>
                            </div>
                            <Button asChild size="lg" className="rounded-full px-12 h-20 font-black text-lg bg-primary hover:bg-slate-900 shadow-2xl transition-all hover:scale-105">
                                <Link href="/search">Explore Nearby Stays</Link>
                            </Button>
                        </footer>
                    </div>
                </div>
            </article>
        </div>
    );
}
