'use client';
import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { BlogForm } from '@/components/admin/BlogForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBlogPage() {
    const params = useParams();
    const id = params.id as string;
    const firestore = useFirestore();

    const blogRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'blogs', id);
    }, [firestore, id]);

    const { data: blog, isLoading } = useDoc(blogRef);

    if (isLoading) return <div className="p-12 space-y-4"><Skeleton className="h-12 w-1/3" /><Skeleton className="h-96 w-full" /></div>;

    return (
        <div className="space-y-6">
             <div className="flex flex-col gap-1">
                <h1 className="font-headline text-4xl font-black tracking-tight text-[#1a1a1a]">Modify Field Report</h1>
                <p className="text-muted-foreground font-medium">Updating: "{blog?.title}"</p>
            </div>
            <BlogForm initialData={blog} />
        </div>
    );
}