'use client';

import React from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { Video, Compass, MapPin, ArrowRight, Calendar, Sparkles } from 'lucide-react';
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
            {/* Immersive Hero Section */}
            <section className="bg-primary pt-32 pb-48 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <Compass className="absolute -right-20 -bottom-20 w-[600px] h-[600px] text-white" strokeWidth={0.5} />
                </div>
                <div className="container mx-auto relative z-10">
                    <div className="max-w-4xl space-y-6">
                        <div className="inline-flex items-center gap-3 bg-accent/20 backdrop-blur-md px-6 py-2 rounded-full border border-accent/30 text-accent text-[10px] font-black uppercase tracking-[0.4em] animate-in fade-in slide-in-from-left-4 duration-700">
                            <Sparkles className="h-4 w-4" /> Field Intelligence
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85]">
                            Expedition <br /> <span className="text-accent italic font-heading font-medium">Intelligence</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/70 font-medium max-w-2xl leading-relaxed">
                            Classified reports and visual narratives from the northern frontier. Verified data from beyond the horizon.
                        </p>
                    </div>
                </div>
                {/* Visual Decorative Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fcfcf9] to-transparent" />
            </section>

            {/* Featured Post / Grid Section */}
            <section className="py-20 px-4 -mt-32">
                <div className="container mx-auto">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                             {[1,2,3,4].map(i => <Skeleton key={i} className="h-[500px] w-full rounded-[3rem]" />)}
                        </div>
                    ) : blogs && blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {blogs.map((blog, idx) => {
                                const postDate = normalizeTimestamp(blog.createdAt);
                                const isLarge = idx === 0; // Highlight the first post
                                
                                return (
                                    <Link 
                                        key={blog.id} 
                                        href={`/blogs/${blog.id}`}
                                        className={isLarge ? "md:col-span-2 lg:col-span-2" : "col-span-1"}
                                    >
                                        <Card className="group rounded-[3rem] overflow-hidden border-0 shadow-apple-deep bg-white hover:shadow-2xl transition-all duration-1000 h-full flex flex-col">
                                            <CardContent className="p-0 flex flex-col h-full">
                                                <div className={`relative ${isLarge ? "aspect-[21/9]" : "aspect-[16/10]"} overflow-hidden`}>
                                                    <Image 
                                                        src={blog.images?.[0] || 'https://picsum.photos/seed/blog/1200/800'} 
                                                        alt={blog.title}
                                                        fill
                                                        className="object-cover transition-transform duration-3000 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                                    
                                                    <div className="absolute top-8 left-8">
                                                        <Badge className="bg-white/90 backdrop-blur-md text-primary border-0 font-black uppercase tracking-widest text-[9px] px-5 py-2 rounded-full shadow-xl">
                                                            {blog.category}
                                                        </Badge>
                                                    </div>
                                                    
                                                    {blog.videoUrl && (
                                                        <div className="absolute bottom-8 right-8 h-14 w-14 bg-accent/90 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-2xl transform transition-transform duration-500 group-hover:scale-110">
                                                            <Video className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="p-10 md:p-12 flex flex-col flex-grow space-y-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                            <Calendar className="h-3.5 w-3.5 text-accent" /> {format(postDate, 'dd MMMM yyyy')}
                                                        </div>
                                                        <div className="h-px w-8 bg-slate-100" />
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">NH NODE 01</div>
                                                    </div>
                                                    
                                                    <h2 className={`${isLarge ? "text-4xl md:text-5xl" : "text-3xl"} font-black tracking-tighter text-slate-900 group-hover:text-primary transition-colors leading-[1.1]`}>
                                                        {blog.title}
                                                    </h2>
                                                    
                                                    <p className="text-slate-500 font-medium leading-loose line-clamp-3 text-lg">
                                                        {blog.description}
                                                    </p>
                                                    
                                                    <div className="pt-10 mt-auto border-t border-slate-50 flex items-center justify-between">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                                                            Read Full intelligence <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
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
                        <div className="py-40 text-center border-2 border-dashed rounded-[4rem] border-black/5 bg-white shadow-inner">
                            <Compass className="h-20 w-20 mx-auto text-primary/10 mb-6 animate-pulse" />
                            <h3 className="text-3xl font-black tracking-tight text-slate-900">No Intelligence Logged</h3>
                            <p className="text-slate-400 font-medium mt-4 text-xl">The horizon is quiet. New reports coming soon.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
