
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Heart, 
  Wind, 
  Tent, 
  Music, 
  Building2, 
  MapPin, 
  Utensils, 
  Info,
  Compass,
  ArrowDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/**
 * @fileOverview Soul of Uttarakhand Cultural Portal.
 * A high-end, immersive discovery page celebrating the traditions of Devbhoomi.
 */

const STATS = [
  { label: 'Major Festivals', value: '45+', icon: Sparkles },
  { label: 'Ancient Temples', value: '1000+', icon: Building2 },
  { label: 'Folk Art Forms', value: '12+', icon: Wind },
  { label: 'Native Recipes', value: '30+', icon: Utensils }
];

const FESTIVALS = [
  {
    name: 'Nanda Devi Raj Jat',
    date: 'Once in 12 Years',
    desc: 'The longest pilgrimage in the world, celebrating the journey of Goddess Nanda Devi to her mountain home.',
    img: 'blog-heritage'
  },
  {
    name: 'Harela',
    date: 'Monsoon Arrival',
    desc: 'The festival of greenery, marking the beginning of the sowing season and nature\'s rejuvenation.',
    img: 'blog-festival'
  },
  {
    name: 'Phool Dei',
    date: 'Spring Equinox',
    desc: 'Young girls decorate thresholds with flowers to welcome the spring and bring prosperity to homes.',
    img: 'culture-village'
  }
];

const TRADITIONAL_FOOD = [
  { name: 'Kafuli', id: 'food-kafuli', desc: 'A dense spinach-based gravy cooked in traditional iron woks.' },
  { name: 'Chainsoo', id: 'blog-food', desc: 'Protein-rich black gram curry, roasted and ground for earthy aroma.' },
  { name: 'Bal Mithai', id: 'blog-aipan', desc: 'The crown jewel of Kumaoni sweets, coated with sugary white poppy seeds.' }
];

export default function BlogsPublicPage() {
    const getImageUrl = (id: string) => {
        const found = PlaceHolderImages.find(img => img.id === id);
        return found ? found.imageUrl : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800';
    };

    const scrollToContent = () => {
        document.getElementById('culture-start')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white selection:bg-accent selection:text-white">
            
            {/* Hero Section */}
            <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
                <Image 
                    src={getImageUrl('hero')} 
                    alt="Himalayas" 
                    fill 
                    priority
                    className="object-cover brightness-[0.4]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-white" />
                
                <div className="container relative z-10 px-6 text-center space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Badge className="bg-white/10 backdrop-blur-md text-accent border border-white/20 px-6 py-2 rounded-full font-black uppercase tracking-[0.4em] text-[10px] mb-6">
                            The Devbhoomi Chronicles
                        </Badge>
                        <h1 className="text-6xl md:text-[9rem] font-black text-white tracking-tighter leading-[0.8] uppercase">
                            Soul of <br /> <span className="text-accent italic font-heading font-light capitalize">Uttarakhand</span>
                        </h1>
                        <p className="mt-8 text-xl md:text-2xl text-white/70 max-w-3xl mx-auto font-medium leading-relaxed">
                            A curated odyssey through ancient traditions, spiritual heights, and the robust flavors of the Northern Mountains.
                        </p>
                    </motion.div>
                    
                    <motion.button 
                        onClick={scrollToContent}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="mt-12 group flex flex-col items-center gap-4 text-white/50 hover:text-white transition-colors"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Explore Culture</span>
                        <ArrowDown className="h-6 w-6 animate-bounce" />
                    </motion.button>
                </div>
            </section>

            {/* Section 2: Culture Overview & Stats */}
            <section id="culture-start" className="py-32 bg-white">
                <div className="container px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <Badge className="bg-primary/10 text-primary border-0 font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] text-[10px]">Pillars of Devbhoomi</Badge>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9] uppercase">Heritage <br/> Reimagined</h2>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-lg">
                                Uttarakhand is not just a geographical region; it is a spiritual gateway where every mountain peak has a story and every village threshold is a canvas of divine geometry.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                {STATS.map((stat, i) => (
                                    <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-black/5 hover:bg-white hover:shadow-xl transition-all duration-500">
                                        <stat.icon className="h-6 w-6 text-accent mb-4" />
                                        <p className="text-3xl font-black tracking-tighter text-slate-900">{stat.value}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-apple-deep">
                            <Image src={getImageUrl('culture-village')} alt="Village life" fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-12 left-12 right-12 text-white">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-2">Hidden Nodes</p>
                                <h3 className="text-4xl font-black tracking-tight leading-none uppercase">The High Altitude Lifestyle</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Folk Dance & Music (Interactive Cards) */}
            <section className="py-32 bg-slate-950 text-white relative overflow-hidden">
                <div className="container px-6 relative z-10">
                    <div className="text-center mb-24 space-y-4">
                        <Badge className="bg-accent text-white font-black uppercase tracking-[0.4em] px-8 py-2 rounded-full text-[10px]">Rhythm of the Mountains</Badge>
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">Folk & Valor</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { name: 'Chholiya Dance', icon: Wind, img: 'blog-dance', desc: 'The ancient warrior sword dance of Kumaon.' },
                            { name: 'Jhora Nritya', icon: Music, img: 'blog-music', desc: 'A community circle dance celebrating unity.' },
                            { name: 'Langvir Nritya', icon: Compass, img: 'culture-village', desc: 'A specialized acrobatic performance of Garhwal.' }
                        ].map((dance, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ y: -10 }}
                                className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden cursor-pointer"
                            >
                                <Image src={getImageUrl(dance.img)} alt={dance.name} fill className="object-cover brightness-75 group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                                <div className="absolute bottom-12 left-12 right-12 space-y-4">
                                    <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-fit">
                                        <dance.icon className="h-6 w-6 text-accent" />
                                    </div>
                                    <h4 className="text-3xl font-black uppercase tracking-tight">{dance.name}</h4>
                                    <p className="text-sm text-white/60 font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">{dance.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 4: Festivals Timeline */}
            <section className="py-32 bg-white container px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                    <div className="space-y-4">
                        <Badge className="bg-primary/10 text-primary border-0 font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] text-[10px]">Spiritual Calendar</Badge>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 uppercase leading-[0.9]">Legacy <br/> Timelines</h2>
                    </div>
                    <p className="text-slate-500 font-bold text-xl max-w-sm border-l-2 border-slate-200 pl-6 italic">
                        Events that defy time and logic, anchored in deep mountain faith.
                    </p>
                </div>

                <div className="space-y-12 max-w-5xl mx-auto">
                    {FESTIVALS.map((fest, i) => (
                        <div key={i} className="group relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 bg-slate-50 hover:bg-white hover:shadow-2xl transition-all duration-700 rounded-[3rem] border border-black/5">
                            <div className="md:col-span-4 relative h-64 w-full rounded-[2rem] overflow-hidden shadow-lg">
                                <Image src={getImageUrl(fest.img)} alt={fest.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                            </div>
                            <div className="md:col-span-8 space-y-4">
                                <Badge className="bg-accent/10 text-accent font-black text-[9px] uppercase tracking-widest">{fest.date}</Badge>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">{fest.name}</h3>
                                <p className="text-slate-500 font-medium text-lg leading-relaxed">{fest.desc}</p>
                                <Button variant="link" className="p-0 h-auto font-black text-primary uppercase text-[10px] tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                                    Full Report <ArrowRight className="ml-2 h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 5: Traditional Food Showcase */}
            <section className="py-32 bg-slate-50">
                <div className="container px-6">
                    <div className="text-center mb-24 space-y-4">
                        <div className="flex items-center justify-center gap-3 text-accent font-black uppercase tracking-[0.4em] text-[10px]">
                            <Utensils className="h-4 w-4" /> THE MOUNTAIN KITCHEN
                        </div>
                        <h2 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-none">Soul of Soil</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {TRADITIONAL_FOOD.map((food, i) => (
                            <Card key={i} className="group overflow-hidden rounded-[2.5rem] border-0 bg-white shadow-apple-deep hover:shadow-2xl transition-all duration-700 hover:-translate-y-2">
                                <CardContent className="p-0">
                                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                                        <Image src={getImageUrl(food.id)} alt={food.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                                    </div>
                                    <div className="p-10 space-y-4 text-center">
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase group-hover:text-primary transition-colors">
                                            {food.name}
                                        </h3>
                                        <p className="text-slate-400 font-medium text-sm leading-relaxed italic">
                                            "{food.desc}"
                                        </p>
                                        <div className="pt-4">
                                            <Badge className="bg-primary/10 text-primary border-0 rounded-full font-black text-[9px] uppercase tracking-widest px-4 py-1.5">
                                                Authentic Recipe
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 6: Sacred Heritage (Temple Gallery) */}
            <section className="py-32 bg-white container px-6">
                <div className="max-w-4xl mx-auto text-center mb-24 space-y-4">
                    <Badge className="bg-accent/10 text-accent font-black uppercase tracking-[0.4em] px-8 py-2 rounded-full text-[10px]">The Sacred Circuit</Badge>
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase text-slate-900">Holy Anchors</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {[
                        { name: 'Kedarnath', img: 'temple-kedarnath', desc: 'The seat of Lord Shiva, etched into the high Himalayan peaks.' },
                        { name: 'Badrinath', img: 'temple-badrinath', desc: 'The colorful vibrant dwelling of Lord Vishnu in the lap of Neelkanth.' }
                    ].map((temple, i) => (
                        <div key={i} className="group relative aspect-[16/10] md:aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl">
                            <Image src={getImageUrl(temple.img)} alt={temple.name} fill className="object-cover transition-transform duration-2000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            <div className="absolute bottom-12 left-12 right-12 space-y-2">
                                <h3 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">{temple.name}</h3>
                                <p className="text-white/60 font-medium text-lg italic">{temple.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 7: Aipan Art & Handicrafts */}
            <section className="py-32 bg-[#fcfcf9]">
                <div className="container px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1 relative aspect-square rounded-[3rem] overflow-hidden gold-edge shadow-2xl">
                            <Image src={getImageUrl('blog-aipan')} alt="Aipan Art" fill className="object-cover" />
                        </div>
                        <div className="order-1 lg:order-2 space-y-8">
                            <Badge className="bg-accent/10 text-accent border-0 font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] text-[10px]">Sacred Geometry</Badge>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9] uppercase">The Canvas <br/> of Aipan</h2>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                Aipan is a traditional folk art specifically from the Kumaon region. Drawn on the thresholds of homes, it uses red clay and rice paste to create complex geometric patterns that welcome prosperity and divine energy.
                            </p>
                            <ul className="space-y-4">
                                {['Traditional Ringaal Bamboo Crafts', 'High Altitude Wool Weaving', 'Handmade Copper Ware'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-slate-900 font-black uppercase text-xs tracking-widest">
                                        <Sparkles className="h-4 w-4 text-accent" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 bg-slate-950 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <Image src={getImageUrl('hero')} alt="Bg" fill className="object-cover" />
                </div>
                <div className="container relative z-10 space-y-12">
                    <h2 className="text-6xl md:text-[7rem] font-black tracking-tighter leading-none uppercase">Experience The <br/> <span className="text-accent italic font-heading font-light capitalize">Devbhumi</span></h2>
                    <Button asChild size="lg" className="h-20 px-16 rounded-full font-black text-xl bg-accent hover:bg-accent/90 shadow-2xl transition-all hover:scale-105 active:scale-95 group">
                        <Link href="/search">Start Your Protocol <ArrowRight className="ml-4 h-6 w-6 transition-transform group-hover:translate-x-2" /></Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
