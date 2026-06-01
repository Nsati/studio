'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, type WithId } from '@/firebase';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Video, Globe, ShieldCheck } from 'lucide-react';
import slugify from 'slugify';

const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  videoUrl: z.string().url('Please enter a valid YouTube/Vimeo URL.'),
  category: z.string().min(2, 'Category required'),
  thumbnail: z.string().optional(),
});

type BlogFormProps = {
  initialData?: WithId<any>;
};

export function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<z.infer<typeof blogSchema>>({
    resolver: zodResolver(blogSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      videoUrl: '',
      category: 'Expedition Log',
      thumbnail: '',
    },
  });

  async function onSubmit(values: z.infer<typeof blogSchema>) {
    if (!firestore) return;
    setIsLoading(true);

    try {
      const blogId = isEditing ? initialData.id : slugify(values.title, { lower: true, strict: true });
      const blogRef = doc(firestore, 'blogs', blogId);

      if (isEditing) {
        await updateDoc(blogRef, { ...values, updatedAt: serverTimestamp() });
      } else {
        await setDoc(blogRef, { ...values, createdAt: serverTimestamp() });
      }

      toast({ title: isEditing ? 'Log Updated' : 'Field Report Published', description: `Visual intelligence for "${values.title}" synced.` });
      router.push('/admin/blogs');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sync Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="rounded-none border-border">
          <CardHeader className="bg-muted/10 border-b">
            <CardTitle className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" /> Visual Intelligence Input
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Report Headline</FormLabel>
                <FormControl><Input placeholder="e.g. Crossing the High Passes of Spiti" {...field} className="h-12 rounded-none" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField control={form.control} name="videoUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Video Stream URL (YouTube/Vimeo)</FormLabel>
                  <FormControl><Input placeholder="https://youtube.com/watch?v=..." {...field} className="h-12 rounded-none" /></FormControl>
                  <FormDescription className="text-[9px] font-bold">Standard web URL from hosting provider.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Log Category</FormLabel>
                  <FormControl><Input placeholder="e.g. Winter Expedition" {...field} className="h-12 rounded-none" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detailed Field Summary</FormLabel>
                <FormControl><Textarea className="min-h-[200px] rounded-none" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="bg-[#f0f6ff] p-6 border border-black/5 flex items-center gap-4">
              <ShieldCheck className="h-8 w-8 text-primary opacity-20" />
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                By publishing, this visual data will be synchronized across the Northern Harrier public network. 
                Ensure content meets horizon-standard quality.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-start">
          <Button type="submit" disabled={isLoading} size="lg" className="h-14 px-12 rounded-none font-black text-lg bg-primary shadow-xl">
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Globe className="mr-2 h-5 w-5" />}
            {isEditing ? 'SYNC UPDATED LOG' : 'INITIALIZE FIELD REPORT'}
          </Button>
        </div>
      </form>
    </Form>
  );
}