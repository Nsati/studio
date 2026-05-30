
'use client';
import { TourPackageForm } from '@/components/admin/TourPackageForm';
import { Card, CardContent } from '@/components/ui/card';

export default function NewTourPackagePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-4xl font-black tracking-tight text-[#1a1a1a]">Create Travel Itinerary</h1>
        <p className="text-muted-foreground font-medium">Build a comprehensive tour experience with hotels, transport, and day-wise plans.</p>
      </div>
      <TourPackageForm />
    </div>
  );
}
