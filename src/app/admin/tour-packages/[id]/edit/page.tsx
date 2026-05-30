
'use client';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useParams, notFound } from 'next/navigation';
import { doc } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { TourPackageForm } from '@/components/admin/TourPackageForm';
import { Skeleton } from '@/components/ui/skeleton';

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
        return (
          <div className="space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-96 w-full" />
          </div>
        );
    }

    if (!tourPackage) {
        return notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="font-headline text-4xl font-black tracking-tight text-[#1a1a1a]">Modify Itinerary</h1>
                <p className="text-muted-foreground font-medium">Updating: "{tourPackage.title}"</p>
            </div>
            <TourPackageForm initialData={tourPackage} />
        </div>
    );
}
