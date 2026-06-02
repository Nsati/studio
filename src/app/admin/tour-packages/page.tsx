
'use client';
import { useFirestore, useCollection, useMemoFirebase, type WithId } from '@/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { collection } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Calendar, Package, Trash2, Edit } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BulkUploadTourPackagesDialog } from '@/components/admin/BulkUploadTourPackagesDialog';
import { deleteTourPackageAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

function PackageGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="rounded-none border-black/5">
                    <Skeleton className="h-40 w-full rounded-none" />
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

function TourPackageAdminCard({ tourPackage }: { tourPackage: WithId<TourPackage> }) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const getImageUrl = (img: string) => {
        if (!img) return '';
        if (img.startsWith('http')) return img;
        return PlaceHolderImages.find((p) => p.id === img)?.imageUrl || '';
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteTourPackageAction(tourPackage.id);
            if (res.success) {
                toast({ title: 'Expedition Purged', description: res.message });
            } else {
                toast({ variant: 'destructive', title: 'Purge Failed', description: res.message });
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Critical Error', description: e.message });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card className="rounded-none border border-black/5 shadow-sm group hover:shadow-md transition-all bg-white overflow-hidden">
            <div className="relative h-48 w-full overflow-hidden">
                <Image
                    src={getImageUrl(tourPackage.image)}
                    alt={tourPackage.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 bg-black/80 px-2 py-1 text-white text-[9px] font-black uppercase tracking-widest">
                    {tourPackage.duration}
                </div>
            </div>
            <CardHeader className="p-5 space-y-2">
                <CardTitle className="line-clamp-1 leading-snug text-lg font-black tracking-tight text-[#1a1a1a]">
                    {tourPackage.title}
                </CardTitle>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground truncate">
                    <Calendar className="h-3 w-3 text-[#003580]" /> {tourPackage.destinations.join(' • ')}
                </div>
            </CardHeader>
            <CardFooter className="p-5 pt-0 flex justify-between items-center border-t border-black/[0.03] mt-2">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Starts from</span>
                    <span className="text-sm font-black text-[#1a1a1a]">₹{tourPackage.totalCost?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="rounded-none h-8 px-4 text-[10px] font-black uppercase border-black/10 hover:bg-muted transition-colors">
                        <Link href={`/admin/tour-packages/${tourPackage.id}/edit`}><Edit className="h-3 w-3 mr-1" /> Edit</Link>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 hover:text-destructive transition-colors" disabled={isDeleting}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-none">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Purge Itinerary?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently remove "{tourPackage.title}" from the production nodes.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-none text-white">Confirm Purge</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardFooter>
        </Card>
    )
}


export default function TourPackagesAdminPage() {
    const firestore = useFirestore();

    const packagesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'tourPackages');
    }, [firestore]);

    const { data: allPackages, isLoading } = useCollection<TourPackage>(packagesQuery);
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#003580]">
                        <Package className="h-3 w-3" /> Production Inventory
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-[#1a1a1a]">Tour Itineraries</h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        Manage dynamic Himalayan tour packages and customer experiences.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <BulkUploadTourPackagesDialog />
                    <Button asChild className="rounded-none h-10 font-black px-6 bg-[#003580] hover:bg-[#002b60] shadow-sm">
                        <Link href="/admin/tour-packages/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Itinerary
                        </Link>
                    </Button>
                </div>
            </div>
            
            {isLoading ? <PackageGridSkeleton /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allPackages?.map(pkg => (
                        <TourPackageAdminCard key={pkg.id} tourPackage={pkg} />
                    ))}
                </div>
            )}
            
            {!isLoading && (!allPackages || allPackages.length === 0) && (
                 <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-black/5 bg-white text-center rounded-sm">
                    <Package className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">No itineraries found in the cloud.</p>
                    <p className="text-xs text-muted-foreground mt-1">Start by adding individual packages or using bulk upload.</p>
                </div>
            )}
        </div>
    );
}
