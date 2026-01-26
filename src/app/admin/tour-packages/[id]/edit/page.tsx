
'use client';
import { useFirestore, useDoc, useMemoFirebase, type WithId } from '@/firebase';
import { useParams, notFound } from 'next/navigation';
import { doc } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { EditTourPackageForm } from '@/components/admin/EditTourPackageForm';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function EditTourPackagePageSkeleton() {
  return (
    <div className="space-y-6">
        <Skeleton className="h-9 w-1/3 mb-2" />
        <Skeleton className="h-5 w-1/2 mb-8" />
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-8">
                    <Skeleton className="h-10 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

export default function EditTourPackagePage() {
    const params = useParams();
    const packageId = params.id as string;
    const firestore = useFirestore();

    const packageRef = useMemoFirebase(() => {
        if (!firestore || !packageId) return null;
        return doc(firestore, 'tourPackages', packageId);
    }, [firestore, packageId]);

    const { data: tourPackage, isLoading } = useDoc<TourPackage>(packageRef);

    if (isLoading) {
        return <EditTourPackagePageSkeleton />;
    }

    if (!tourPackage) {
        return notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Edit Tour Package</h1>
                <p className="text-muted-foreground">Update the details for &quot;{tourPackage.title}&quot;.</p>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <EditTourPackageForm tourPackage={tourPackage} />
                </CardContent>
            </Card>
        </div>
    );
}
