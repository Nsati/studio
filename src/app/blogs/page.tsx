'use client';

import React from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { Video, Play, Compass, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function YouTubeEmbed({ url }: { url: string }) {
    // Basic YouTube ID extractor
    const getEmbedUrl = (url: string) => {
        let videoId = '';
        if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
        else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];
        
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        return url;
    };

    return (
        <div className="relative aspect-video rounded-none overflow-hidden bg-slate-900">
            <iframe
                src={getEmbedUrl(url)}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
}

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
                            Visual reports from the Himalayan frontier. Authentic stories captured beyond the horizon.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-20 px-4">
                <div className="container mx-auto">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                             {[1,2,4].map(i => <Skeleton key={i} className="h-96 w-full rounded-[2rem]" />)}
                        </div>
                    ) : blogs && blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {blogs.map((blog) => (
                                <Card key={blog.id} className="rounded-[3rem] overflow-hidden border-0 shadow-apple-deep bg-white group">
                                    <CardContent className="p-0">
                                        <YouTubeEmbed url={blog.videoUrl} />
                                        <div className="p-10 space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Badge className="bg-primary/10 text-primary border-0 font-black uppercase tracking-widest text-[9px] px-4 py-1.5 rounded-full">
                                                        {blog.category}
                                                    </Badge>
                                                    <div className="h-px flex-1 bg-slate-50" />
                                                </div>
                                                <h2 className="text-3xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                                                    {blog.title}
                                                </h2>
                                                <p className="text-slate-500 font-medium leading-relaxed line-clamp-3">
                                                    {blog.description}
                                                </p>
                                            </div>
                                            
                                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <MapPin className="h-3 w-3 text-accent" /> Harrier Field Node 01
                                                </div>
                                                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                                                    <Play className="h-4 w-4 text-slate-300" fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
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