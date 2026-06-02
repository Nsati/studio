
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlusCircle, PlayCircle, Trash2, Edit, Video } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function BlogGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="rounded-none border-black/5">
                    <Skeleton className="h-40 w-full rounded-none" />
                    <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                </Card>
            ))}
        </div>
    );
}

export default function AdminBlogsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const blogsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'blogs');
    }, [firestore]);

    const { data: blogs, isLoading } = useCollection<Blog>(blogsQuery);

    const handleDelete = async (id: string) => {
        if (!firestore) return;
        try {
            await deleteDoc(doc(firestore, 'blogs', id));
            toast({ title: 'Report Purged', description: 'Expedition video log removed successfully.' });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Action Failed', description: e.message });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#003580]">
                        <Video className="h-3 w-3" /> Visual Intelligence
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-[#1a1a1a]">Field Reports</h1>
                    <p className="text-muted-foreground text-sm font-medium">Manage video logs from the northern frontier.</p>
                </div>
                <Button asChild className="rounded-none h-12 font-black px-8 bg-[#003580] hover:bg-[#002b60] shadow-sm">
                    <Link href="/admin/blogs/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> New Field Report
                    </Link>
                </Button>
            </div>

            {isLoading ? <BlogGridSkeleton /> : blogs && blogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                        <Card key={blog.id} className="rounded-none border border-black/5 shadow-sm bg-white overflow-hidden group">
                            <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
                                <PlayCircle className="h-12 w-12 text-white/20 group-hover:text-white transition-all" />
                                <div className="absolute top-3 left-3 bg-black/80 px-2 py-1 text-white text-[8px] font-black uppercase tracking-widest">
                                    {blog.category || 'Expedition'}
                                </div>
                            </div>
                            <CardHeader className="p-5">
                                <CardTitle className="text-lg font-black tracking-tight line-clamp-1">{blog.title}</CardTitle>
                                <CardDescription className="line-clamp-2 text-xs font-medium">{blog.description}</CardDescription>
                            </CardHeader>
                            <CardFooter className="p-5 pt-0 flex justify-end gap-2 border-t border-black/[0.03] mt-2">
                                <Button variant="outline" size="sm" asChild className="h-8 rounded-none text-[10px] font-black uppercase">
                                    <Link href={`/admin/blogs/${blog.id}/edit`}><Edit className="h-3 w-3 mr-1" /> Edit</Link>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 rounded-none text-[10px] font-black uppercase text-destructive">
                                            <Trash2 className="h-3 w-3 mr-1" /> Purge
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-none">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Purge Field Report?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete the visual data for "{blog.title}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(blog.id)} className="bg-destructive text-white hover:bg-destructive/90 rounded-none">Confirm Purge</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-black/5 bg-white text-center rounded-sm">
                    <Video className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">No field reports found.</p>
                </div>
            )}
        </div>
    );
}
