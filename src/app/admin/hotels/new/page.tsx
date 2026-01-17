'use client';

import { HotelForm } from '@/components/admin/HotelForm';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewHotelPage() {
  return (
    <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/admin" className="p-2 rounded-md hover:bg-muted">
                <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
                <h1 className="font-headline text-4xl font-bold">Add New Hotel</h1>
                <p className="text-muted-foreground">Step 1: Fill in the details for the new hotel. You'll add rooms in the next step.</p>
            </div>
        </div>
      <Card>
        <CardContent className="p-6">
          <HotelForm />
        </CardContent>
      </Card>
    </div>
  );
}
