'use client';
import { BulkAddHotelsForm } from '@/components/admin/BulkAddHotelsForm';
import { Card, CardContent } from '@/components/ui/card';

export default function BulkAddHotelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Bulk Add Hotels</h1>
        <p className="text-muted-foreground">
          Add multiple hotel properties at once. For amenities and images, use comma-separated values.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <BulkAddHotelsForm />
        </CardContent>
      </Card>
    </div>
  );
}
