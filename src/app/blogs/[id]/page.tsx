'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { normalizeTimestamp } from '@/lib/firestore-utils';
import { format } from 'date-fns';
import { Calendar, Video, ArrowLeft, MapPin, Share2, Facebook, Twitter, Instagram, Bookmark, Clock, UserCheck } from 'lucide-react';
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
        <div className="relative aspect-video rounded-[3rem] overflow-hidden bg-slate-950 shadow-2xl my-16 group">
            <iframe
                src={getEmbedUrl(url)}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
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
            {/* Top Navigation */}
            <div className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-xl border-b border-black/5 py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Link href="/blogs" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:text-accent transition-all group">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-2" /> Back to Intelligence
                    </Link>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-slate-100"><Share2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-slate-100"><Bookmark className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>

            <article className="pb-32">
                {/* High-Impact Header */}
                <header className="container mx-auto max-w-5xl pt-24 pb-16 px-4 text-center space-y-8">
                    <Badge className="bg-accent/10 text-accent border-0 font-black uppercase tracking-[0.4em] text-[10px] px-8 py-3 rounded-full">
                        {blog.category}
                    </Badge>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9] lg:-mx-20">
                        {blog.title}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-accent" /> {format(postDate, 'MMMM dd, yyyy')}</span>
                        <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> 6 MIN READ</span>
                        <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Harrier Node 01</span>
                    </div>
                </header>

                {/* Hero Feature Image */}
                <div className="container mx-auto max-w-7xl px-4 mb-24">
                    <div className="relative aspect-[21/9] w-full rounded-[4rem] overflow-hidden shadow-apple-deep ring-8 ring-white">
                        <Image 
                            src={blog.images?.[0] || 'https://picsum.photos/seed/hero/1600/900'} 
                            alt={blog.title} 
                            fill 
                            className="object-cover" 
                            priority
                        />
                    </div>
                </div>

                {/* Narrative Body */}
                <div className="container mx-auto max-w-5xl px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Author/Social Sidebar */}
                        <aside className="hidden lg:block lg:col-span-1 sticky top-48 h-fit">
                            <div className="flex flex-col gap-6 text-slate-300">
                                <Button variant="ghost" size="icon" className="hover:text-blue-600 transition-colors"><Facebook className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon" className="hover:text-sky-400 transition-colors"><Twitter className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon" className="hover:text-pink-600 transition-colors"><Instagram className="h-5 w-5" /></Button>
                            </div>
                        </aside>

                        {/* Main Content Column */}
                        <div className="lg:col-span-11 lg:pl-10">
                            <div className="prose prose-slate max-w-none prose-p:text-xl prose-p:leading-[1.8] prose-p:text-slate-600 prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-slate-900 prose-strong:text-slate-900">
                                <div className="whitespace-pre-wrap font-sans mb-20 text-2xl leading-relaxed text-slate-800 border-l-4 border-accent pl-10 italic opacity-90">
                                    {blog.description}
                                </div>

                                {/* Dynamic Video Section */}
                                {blog.videoUrl && <YouTubeEmbed url={blog.videoUrl} />}

                                {/* Narrative Detail Grid */}
                                <div className="space-y-16 mt-20">
                                    <h3 className="text-4xl md:text-5xl font-black tracking-tight">Expedition <span className="text-accent italic font-medium">Visuals</span></h3>
                                    
                                    {blog.images && blog.images.length > 1 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            {blog.images.slice(1).map((img, i) => (
                                                <div key={i} className={`relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl transform transition-transform duration-700 hover:scale-[1.02] ${i % 3 === 0 ? "md:col-span-2 aspect-video" : ""}`}>
                                                    <Image src={img} alt={`Visual Log ${i}`} fill className="object-cover" />
                                                    <div className="absolute bottom-6 left-8 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[8px] font-black text-white uppercase tracking-widest">Captured Frame 0{i + 1}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Author Footer Card */}
                            <footer className="mt-32 p-12 bg-slate-50 rounded-[4rem] border border-black/5 flex flex-col md:flex-row items-center justify-between gap-10">
                                <div className="flex items-center gap-6 text-center md:text-left">
                                    <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white font-black text-2xl shadow-xl border-4 border-white ring-1 ring-black/5">NH</div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase text-accent tracking-[0.4em]">Intelligence Source</p>
                                        <p className="text-2xl font-black text-slate-900">Northern Harrier Command</p>
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 font-bold text-xs">
                                            <UserCheck className="h-4 w-4 text-green-600" /> Senior Field Liaison
                                        </div>
                                    </div>
                                </div>
                                <Button asChild size="lg" className="rounded-full px-12 h-16 font-black bg-primary shadow-2xl hover:scale-105 transition-transform active:scale-95">
                                    <Link href="/tour-packages" className="flex items-center gap-4">
                                        Explore Related Routes <ArrowLeft className="h-5 w-5 rotate-180" />
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
