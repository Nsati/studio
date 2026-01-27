
'use client';
import { AddTourPackageForm } from '@/components/admin/AddTourPackageForm';
import { Card, CardContent } from '@/components/ui/card';

export default function NewTourPackagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Add New Tour Package</h1>
        <p className="text-muted-foreground">Fill out the form below to add a new tour package to the platform.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <AddTourPackageForm />
        </CardContent>
      </Card>
    </div>
  );
}
