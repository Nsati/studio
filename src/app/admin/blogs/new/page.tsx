'use client';
import { BlogForm } from '@/components/admin/BlogForm';

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-4xl font-black tracking-tight text-[#1a1a1a]">New Field Report</h1>
        <p className="text-muted-foreground font-medium">Record visual data from the northern expeditions.</p>
      </div>
      <BlogForm />
    </div>
  );
}