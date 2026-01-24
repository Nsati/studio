'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Calendar } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function PackageGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                    <Skeleton className="h-40 w-full" />
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardFooter>
                         <Skeleton className="h-9 w-20" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

function TourPackageAdminCard({ tourPackage }: { tourPackage: TourPackage }) {
    const imageUrl = PlaceHolderImages.find((img) => img.id === tourPackage.image)?.imageUrl;

    return (
        <Card>
            <div className="relative h-40 w-full">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={tourPackage.title}
                        fill
                        className="object-cover rounded-t-lg"
                        unoptimized
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted rounded-t-lg">
                        <span className="text-sm text-muted-foreground">No Image</span>
                    </div>
                )}
            </div>
            <CardHeader>
                <CardTitle className="truncate leading-snug">{tourPackage.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> {tourPackage.duration}
                </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/tour-packages/${tourPackage.id}/edit`}>Edit</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}


export default function TourPackagesAdminPage() {
    const firestore = useFirestore();

    const packagesQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'tourPackages');
    }, [firestore]);

    const { data: allPackages, isLoading } = useCollection<TourPackage>(packagesQuery);
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Tour Package Management</h1>
                    <p className="text-muted-foreground">
                        Here you can view, add, and edit tour packages.
                    </p>
                </div>
                 <Button asChild>
                    <Link href="/admin/tour-packages/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Package
                    </Link>
                </Button>
            </div>
            
            {isLoading ? <PackageGridSkeleton /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allPackages?.map(pkg => (
                        <TourPackageAdminCard key={pkg.id} tourPackage={pkg} />
                    ))}
                </div>
            )}
            {!isLoading && (!allPackages || allPackages.length === 0) && (
                 <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    <p>No tour packages found. Get started by adding one.</p>
                </div>
            )}
        </div>
    );
}
