'use client';

import React from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { Video, Compass, MapPin, ArrowRight, Calendar } from 'lucide-react';
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
        <div className="min-h-screen bg-background">
            <section className="bg-primary py-24 px-4 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
                    <Video className="w-full h-full text-white" strokeWidth={0.1} />
                </div>
                <div className="container mx-auto">
                    <div className="max-w-4xl space-y-4">
                        <div className="flex items-center gap-2 text-accent font-black uppercase tracking-[0.3em] text-[10px]">
                            <Compass className="h-4 w-4" /> Live Field Intelligence
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">
                            Expedition <span className="text-accent italic font-medium">Logs</span>
                        </h1>
                        <p className="text-xl text-white/70 font-medium max-w-2xl">
                            Visual reports and detailed narratives from the Himalayan frontier. Authentic stories captured beyond the horizon.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-20 px-4">
                <div className="container mx-auto">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                             {[1,2,3,4].map(i => <Skeleton key={i} className="h-96 w-full rounded-[2rem]" />)}
                        </div>
                    ) : blogs && blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {blogs.map((blog) => {
                                const postDate = normalizeTimestamp(blog.createdAt);
                                return (
                                    <Link key={blog.id} href={`/blogs/${blog.id}`}>
                                        <Card className="rounded-[2.5rem] overflow-hidden border-0 shadow-apple-deep bg-white group hover:shadow-2xl transition-all duration-700 h-full flex flex-col">
                                            <CardContent className="p-0 flex flex-col h-full">
                                                <div className="relative aspect-[16/10] overflow-hidden">
                                                    <Image 
                                                        src={blog.images?.[0] || 'https://picsum.photos/seed/blog/800/600'} 
                                                        alt={blog.title}
                                                        fill
                                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                                    />
                                                    <div className="absolute top-6 left-6">
                                                        <Badge className="bg-primary/90 backdrop-blur-sm text-white border-0 font-black uppercase tracking-widest text-[8px] px-3 py-1 rounded-full shadow-lg">
                                                            {blog.category}
                                                        </Badge>
                                                    </div>
                                                    {blog.videoUrl && (
                                                        <div className="absolute bottom-6 right-6 h-10 w-10 bg-accent rounded-full flex items-center justify-center text-white shadow-lg">
                                                            <Video className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="p-8 flex flex-col flex-grow space-y-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <Calendar className="h-3 w-3" /> {format(postDate, 'dd MMM yyyy')}
                                                    </div>
                                                    <h2 className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors leading-tight">
                                                        {blog.title}
                                                    </h2>
                                                    <p className="text-slate-500 font-medium leading-relaxed line-clamp-3 text-sm">
                                                        {blog.description}
                                                    </p>
                                                    
                                                    <div className="pt-6 mt-auto border-t border-slate-50 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary">
                                                            Read Full Report
                                                        </div>
                                                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary transition-all">
                                                            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-32 text-center border-2 border-dashed rounded-[3rem] border-black/5 bg-muted/20">
                            <Video className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                            <h3 className="text-2xl font-black tracking-tight">No Active Logs</h3>
                            <p className="text-slate-500 font-medium mt-2">New visual reports coming soon from the northern frontier.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}