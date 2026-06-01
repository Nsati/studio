'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { normalizeTimestamp } from '@/lib/firestore-utils';
import { format } from 'date-fns';
import { Calendar, Video, ArrowLeft, MapPin, Share2, Facebook, Twitter, Instagram, Bookmark, Clock, UserCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

function YouTubeEmbed({ url }: { url: string }) {
    const getEmbedUrl = (url: string) => {
        let videoId = '';
        if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
        else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];
        
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        return url;
    };

    return (
        <div className="relative aspect-video rounded-[3rem] overflow-hidden bg-slate-950 shadow-2xl my-24 group">
            <iframe
                src={getEmbedUrl(url)}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
            <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md px-5 py-2 rounded-full text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Video className="h-3 w-3 text-accent" /> Field Intelligence Stream
            </div>
        </div>
    );
}

export default function BlogDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const firestore = useFirestore();

    const blogRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'blogs', id);
    }, [firestore, id]);

    const { data: blog, isLoading } = useDoc<Blog>(blogRef);

    if (isLoading) return (
        <div className="container mx-auto py-32 px-4 space-y-12">
            <div className="h-20 w-3/4 bg-muted rounded-full mx-auto animate-pulse" />
            <div className="h-[600px] w-full bg-muted rounded-[4rem] animate-pulse" />
        </div>
    );

    if (!blog) return notFound();

    const postDate = normalizeTimestamp(blog.createdAt);

    return (
        <div className="min-h-screen bg-white">
            {/* Narrative Navigation */}
            <div className="sticky top-[72px] z-40 bg-white/90 backdrop-blur-2xl border-b border-black/5 py-5">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Link href="/blogs" className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:text-accent transition-all group">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-2" /> Back to Discovery
                    </Link>
                    <div className="flex gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 hover:bg-slate-100"><Share2 className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 hover:bg-slate-100"><Bookmark className="h-5 w-5" /></Button>
                    </div>
                </div>
            </div>

            <article className="pb-40">
                {/* Hero Feature Content */}
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
                        <span className="flex items-center gap-3"><Calendar className="h-5 w-5 text-accent" /> {format(postDate, 'MMMM dd, yyyy')}</span>
                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                        <span className="flex items-center gap-3"><MapPin className="h-5 w-5 text-accent" /> Uttarakhand Node 01</span>
                    </div>
                </header>

                {/* Major Feature Image */}
                <div className="container mx-auto max-w-7xl px-4 mb-24">
                    <div className="relative aspect-[21/9] w-full rounded-[5rem] overflow-hidden shadow-apple-deep ring-12 ring-white">
                        <Image 
                            src={blog.images?.[0] || 'https://picsum.photos/seed/editorial/1600/900'} 
                            alt={blog.title} 
                            fill 
                            className="object-cover" 
                            priority
                        />
                    </div>
                </div>

                {/* Narrative Architecture */}
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        {/* Vertical Social Architecture */}
                        <aside className="hidden lg:block lg:col-span-1 sticky top-52 h-fit">
                            <div className="flex flex-col gap-8 text-slate-300">
                                <Button variant="ghost" size="icon" className="hover:text-blue-600 transition-colors rounded-full"><Facebook className="h-6 w-6" /></Button>
                                <Button variant="ghost" size="icon" className="hover:text-sky-400 transition-colors rounded-full"><Twitter className="h-6 w-6" /></Button>
                                <Button variant="ghost" size="icon" className="hover:text-pink-600 transition-colors rounded-full"><Instagram className="h-6 w-6" /></Button>
                            </div>
                        </aside>

                        {/* Main Editorial Body */}
                        <div className="lg:col-span-11 lg:pl-16">
                            <div className="prose prose-slate max-w-none prose-p:text-2xl prose-p:leading-[1.9] prose-p:text-slate-600 prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-slate-900 prose-strong:text-slate-900 prose-blockquote:border-accent prose-blockquote:bg-slate-50 prose-blockquote:p-10 prose-blockquote:rounded-[3rem] prose-blockquote:not-italic">
                                <div className="whitespace-pre-wrap font-sans mb-24 text-3xl leading-[1.6] text-slate-800 font-medium opacity-90 border-l-8 border-accent pl-12 italic">
                                    {blog.description}
                                </div>

                                {/* Cinematic Video Integration */}
                                {blog.videoUrl && <YouTubeEmbed url={blog.videoUrl} />}

                                {/* Visual Narrative Detail Grid */}
                                <div className="space-y-24 mt-24">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <h3 className="text-5xl md:text-7xl font-black tracking-tight">Cultural <span className="text-accent italic font-heading font-medium">Spotlight</span></h3>
                                        <div className="h-1.5 w-24 bg-accent rounded-full" />
                                    </div>
                                    
                                    {blog.images && blog.images.length > 1 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                            {blog.images.slice(1).map((img, i) => (
                                                <div key={i} className={`relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl transition-all duration-1000 hover:scale-[1.03] ${i % 3 === 0 ? "md:col-span-2 aspect-[21/9]" : ""}`}>
                                                    <Image src={img} alt={`Visual Insight ${i}`} fill className="object-cover" />
                                                    <div className="absolute bottom-8 left-10 bg-black/40 backdrop-blur-md px-5 py-2 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-xl">
                                                        Visual Data Archive: 0{i + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Author & Expedition Command Footer */}
                            <footer className="mt-40 p-16 bg-[#fcfcf9] rounded-[5rem] border border-black/5 flex flex-col md:flex-row items-center justify-between gap-12 shadow-inner">
                                <div className="flex items-center gap-8 text-center md:text-left">
                                    <div className="h-28 w-28 rounded-full bg-primary flex items-center justify-center text-white font-black text-3xl shadow-2xl border-6 border-white ring-1 ring-black/5">NH</div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase text-accent tracking-[0.5em]">Verified Authority</p>
                                        <p className="text-3xl font-black text-slate-900 tracking-tight">Northern Harrier Command</p>
                                        <div className="flex items-center justify-center md:justify-start gap-3 text-slate-400 font-bold text-sm">
                                            <UserCheck className="h-5 w-5 text-green-600" /> Lead Cultural Liaison
                                        </div>
                                    </div>
                                </div>
                                <Button asChild size="lg" className="rounded-full px-16 h-20 font-black text-lg bg-primary shadow-2xl hover:scale-105 transition-all active:scale-95">
                                    <Link href="/tour-packages" className="flex items-center gap-6">
                                        Explore Related Expeditions <ArrowLeft className="h-6 w-6 rotate-180" />
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
