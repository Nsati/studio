'use client';

import React from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { Compass, MapPin, ArrowRight, Calendar, Sparkles, Utensils, Music, Mountain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { normalizeTimestamp } from '@/lib/firestore-utils';
import { format } from 'date-fns';

export default function BlogsPublicPage() {
    const firestore = useFirestore();

    const blogsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'blogs'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: blogs, isLoading } = useCollection<Blog>(blogsQuery);

    return (
        <div className="min-h-screen bg-[#fcfcf9]">
            {/* Cultural Immersive Hero */}
            <section className="bg-primary pt-32 pb-48 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <Mountain className="absolute -right-20 -bottom-20 w-[600px] h-[600px] text-white" strokeWidth={0.5} />
                </div>
                <div className="container mx-auto relative z-10">
                    <div className="max-w-4xl space-y-8">
                        <div className="inline-flex items-center gap-3 bg-accent/20 backdrop-blur-md px-6 py-2 rounded-full border border-accent/30 text-accent text-[10px] font-black uppercase tracking-[0.4em] animate-in fade-in slide-in-from-left-4 duration-700">
                            <Sparkles className="h-4 w-4" /> Himalayan Discovery
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85]">
                            The Heart of <br /> <span className="text-accent italic font-heading font-medium">Uttarakhand</span>
                        </h1>
                        <p className="text-xl md:text-3xl text-white/70 font-medium max-w-3xl leading-relaxed tracking-tight">
                            Beyond stays, we explore the soul of Devbhumi. Discover authentic culture, local flavors, and the timeless traditions of the mountains.
                        </p>
                        
                        <div className="flex flex-wrap gap-4 pt-4">
                            {[
                                { icon: Utensils, label: 'Local Flavors' },
                                { icon: Music, label: 'Folk Lore' },
                                { icon: Compass, label: 'Hidden Routes' }
                            ].map((tag, i) => (
                                <div key={i} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-white/60 text-[10px] font-black uppercase tracking-widest">
                                    <tag.icon className="h-3.5 w-3.5 text-accent" /> {tag.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fcfcf9] to-transparent" />
            </section>

            {/* Stories Grid */}
            <section className="py-20 px-4 -mt-32">
                <div className="container mx-auto">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                             {[1,2,3,4].map(i => <Skeleton key={i} className="h-[600px] w-full rounded-[4rem]" />)}
                        </div>
                    ) : blogs && blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {blogs.map((blog, idx) => {
                                const postDate = normalizeTimestamp(blog.createdAt);
                                const isLarge = idx === 0;
                                
                                return (
                                    <Link 
                                        key={blog.id} 
                                        href={`/blogs/${blog.id}`}
                                        className={isLarge ? "md:col-span-2 lg:col-span-2" : "col-span-1"}
                                    >
                                        <Card className="group rounded-[4rem] overflow-hidden border-0 shadow-apple-deep bg-white hover:shadow-2xl transition-all duration-1000 h-full flex flex-col">
                                            <CardContent className="p-0 flex flex-col h-full">
                                                <div className={`relative ${isLarge ? "aspect-[21/9]" : "aspect-[16/10]"} overflow-hidden`}>
                                                    <Image 
                                                        src={blog.images?.[0] || 'https://picsum.photos/seed/culture/1200/800'} 
                                                        alt={blog.title}
                                                        fill
                                                        className="object-cover transition-transform duration-3000 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                                    
                                                    <div className="absolute top-10 left-10">
                                                        <Badge className="bg-white/95 backdrop-blur-md text-primary border-0 font-black uppercase tracking-[0.2em] text-[10px] px-6 py-3 rounded-full shadow-2xl">
                                                            {blog.category}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-12 md:p-16 flex flex-col flex-grow space-y-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                                            <Calendar className="h-4 w-4 text-accent" /> {format(postDate, 'dd MMMM yyyy')}
                                                        </div>
                                                        <div className="h-px w-10 bg-slate-100" />
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">LOCAL INTEL</div>
                                                    </div>
                                                    
                                                    <h2 className={`${isLarge ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl"} font-black tracking-tighter text-slate-900 group-hover:text-primary transition-colors leading-[1]`}>
                                                        {blog.title}
                                                    </h2>
                                                    
                                                    <p className="text-slate-500 font-medium leading-relaxed line-clamp-3 text-lg md:text-xl">
                                                        {blog.description}
                                                    </p>
                                                    
                                                    <div className="pt-12 mt-auto border-t border-slate-50 flex items-center justify-between">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-4 group-hover:translate-x-2 transition-transform">
                                                            Discover The Narrative <ArrowRight className="h-5 w-5" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-40 text-center border-2 border-dashed rounded-[5rem] border-black/5 bg-white shadow-inner mx-4">
                            <Compass className="h-24 w-24 mx-auto text-primary/10 mb-8 animate-pulse" />
                            <h3 className="text-4xl font-black tracking-tight text-slate-900">Local Intelligence Loading</h3>
                            <p className="text-slate-400 font-medium mt-6 text-xl max-w-md mx-auto leading-relaxed">
                                Our liaisons are currently gathering authentic Himalayan narratives. Check back soon.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Authentic Quote Section */}
            <section className="py-32 bg-white">
                <div className="container mx-auto px-4 text-center space-y-10">
                    <div className="h-20 w-px bg-accent mx-auto" />
                    <h2 className="text-3xl md:text-6xl font-heading italic text-slate-900 max-w-4xl mx-auto leading-tight">
                        "The soul of Uttarakhand lies not in its peaks, but in the warmth of its hearths and the stories told over a cup of Pahadi tea."
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Northern Harrier Liaison</p>
                </div>
            </section>
        </div>
    );
}
