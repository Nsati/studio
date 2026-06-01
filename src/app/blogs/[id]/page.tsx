'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { normalizeTimestamp } from '@/lib/firestore-utils';
import { format } from 'date-fns';
import { Calendar, Video, ArrowLeft, MapPin, Share2, Facebook, Twitter, Instagram } from 'lucide-react';
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
        <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl mb-12 border-8 border-white">
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
        <div className="container mx-auto py-20 px-4 animate-pulse space-y-8">
            <div className="h-12 w-3/4 bg-muted rounded-full mx-auto" />
            <div className="h-[500px] w-full bg-muted rounded-[3rem]" />
        </div>
    );

    if (!blog) return notFound();

    const postDate = normalizeTimestamp(blog.createdAt);

    return (
        <div className="min-h-screen bg-[#fcfcf9]">
            {/* Nav Back */}
            <div className="bg-white border-b py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Link href="/blogs" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:text-accent transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Logs
                    </Link>
                    <div className="flex gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-slate-50"><Share2 className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>

            <article className="container mx-auto max-w-5xl py-16 md:py-24 px-4">
                {/* Header */}
                <header className="text-center space-y-6 mb-16">
                    <Badge className="bg-accent/10 text-accent border-0 font-black uppercase tracking-[0.2em] text-[10px] px-6 py-2 rounded-full">
                        {blog.category}
                    </Badge>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.95]">
                        {blog.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-accent" /> {format(postDate, 'MMMM dd, yyyy')}</span>
                        <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-accent" /> Harrier Node 01</span>
                    </div>
                </header>

                {/* Hero Image */}
                <div className="relative aspect-[21/9] w-full rounded-[3rem] overflow-hidden shadow-apple-deep mb-16 border-4 border-white">
                    <Image 
                        src={blog.images?.[0] || 'https://picsum.photos/seed/hero/1200/600'} 
                        alt={blog.title} 
                        fill 
                        className="object-cover" 
                        priority
                    />
                </div>

                {/* Content Body */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Social Sidebar */}
                    <aside className="hidden lg:block lg:col-span-1 sticky top-32 h-fit space-y-6">
                        <div className="flex flex-col gap-4 text-slate-300">
                            <Button variant="ghost" size="icon" className="hover:text-blue-600"><Facebook className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon" className="hover:text-sky-400"><Twitter className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon" className="hover:text-pink-600"><Instagram className="h-5 w-5" /></Button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="lg:col-span-11 prose prose-slate max-w-none prose-p:text-lg prose-p:leading-relaxed prose-p:text-slate-600 prose-headings:font-black prose-headings:tracking-tighter">
                        <div className="whitespace-pre-wrap font-sans text-xl leading-loose text-slate-700 mb-16">
                            {blog.description}
                        </div>

                        {/* Embed Video if exists */}
                        {blog.videoUrl && <YouTubeEmbed url={blog.videoUrl} />}

                        {/* Gallery Section */}
                        {blog.images && blog.images.length > 1 && (
                            <div className="space-y-12">
                                <h3 className="text-3xl font-black tracking-tight text-slate-900 border-l-4 border-accent pl-6">
                                    Field Visuals
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {blog.images.slice(1).map((img, i) => (
                                        <div key={i} className="relative aspect-square rounded-[2rem] overflow-hidden shadow-xl border-4 border-white">
                                            <Image src={img} alt={`Gallery ${i}`} fill className="object-cover hover:scale-105 transition-transform duration-700" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Credits */}
                <footer className="mt-32 pt-16 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white font-black">NH</div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Authored By</p>
                            <p className="text-lg font-black text-slate-900">Northern Harrier Intelligence</p>
                        </div>
                    </div>
                    <Button asChild className="rounded-full px-10 h-14 font-black shadow-xl">
                        <Link href="/tour-packages">Explore This Route <ArrowLeft className="ml-3 h-5 w-5 rotate-180" /></Link>
                    </Button>
                </footer>
            </article>
        </div>
    );
}