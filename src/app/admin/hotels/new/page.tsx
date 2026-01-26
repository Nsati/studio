'use client';
import { AddHotelForm } from '@/components/admin/AddHotelForm';
import { Card, CardContent } from '@/components/ui/card';

export default function NewHotelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Add New Hotel</h1>
        <p className="text-muted-foreground">Fill out the form below to add a new hotel to the platform.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <AddHotelForm />
        </CardContent>
      </Card>
    </div>
  );
}
