'use client';
import { useFirestore, useCollection, useMemoFirebase, type WithId } from '@/firebase';
import Link from 'next/link';
import { collection } from 'firebase/firestore';
import type { TourPackage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Calendar, Package, Trash2, Edit2, Loader2 } from 'lucide-react';
import { BulkUploadTourPackagesDialog } from '@/components/admin/BulkUploadTourPackagesDialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { deleteTourPackageAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

function PackageGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
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
        if (!img) return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800';
        
        let url = img.trim();
        
        // Fix Pexels page links to direct image links
        if (url.includes('pexels.com/photo/')) {
            const parts = url.split('/');
            const idPart = parts.find(p => p.match(/^\d+$/)) || parts[parts.length - 2];
            if (idPart && idPart.match(/^\d+$/)) {
                return `https://images.pexels.com/photos/${idPart}/pexels-photo-${idPart}.jpeg?auto=compress&cs=tinysrgb&w=800`;
            }
        }
        
        return url.startsWith('http') ? url : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800';
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteTourPackageAction(tourPackage.id);
            if (res.success) {
                toast({ title: 'Expedition Removed', description: res.message });
            } else {
                toast({ variant: 'destructive', title: 'Action Failed', description: res.message });
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'System Error', description: e.message });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card className="rounded-none border border-black/5 shadow-sm group hover:shadow-md transition-all bg-white overflow-hidden flex flex-col h-full">
            <div className="relative h-40 w-full overflow-hidden bg-muted">
                <img
                    src={getImageUrl(tourPackage.image)}
                    alt={tourPackage.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800';
                    }}
                />
                <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 text-white text-[8px] font-black uppercase tracking-widest">
                    {tourPackage.duration}
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="icon" variant="destructive" className="h-7 w-7 rounded-none bg-red-600/90 hover:bg-red-600" disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-none">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Purge Itinerary?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will permanently delete "{tourPackage.title}" from the production grid. This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-none text-white">Confirm Purge</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <CardHeader className="p-4 space-y-2 flex-grow">
                <CardTitle className="line-clamp-2 leading-snug text-base font-black tracking-tight text-[#1a1a1a]">
                    {tourPackage.title}
                </CardTitle>
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-muted-foreground truncate">
                    <Calendar className="h-3 w-3 text-[#003580]" /> {tourPackage.destinations?.join(' • ')}
                </div>
            </CardHeader>
            <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-black/[0.03] mt-auto bg-slate-50/50">
                <div className="flex flex-col">
                    <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Starts from</span>
                    <span className="text-xs font-black text-[#1a1a1a]">₹{tourPackage.totalCost?.toLocaleString('en-IN')}</span>
                </div>
                <Button variant="outline" size="sm" asChild className="rounded-none h-7 px-3 text-[9px] font-black uppercase border-black/10 hover:bg-muted transition-colors bg-white">
                    <Link href={`/admin/tour-packages/${tourPackage.id}/edit`}><Edit2 className="mr-1.5 h-3 w-3" /> Edit</Link>
                </Button>
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
                    <Button asChild className="rounded-none h-12 font-black px-8 bg-[#003580] hover:bg-[#002b60] shadow-sm">
                        <Link href="/admin/tour-packages/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Itinerary
                        </Link>
                    </Button>
                </div>
            </div>
            
            {isLoading ? <PackageGridSkeleton /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {allPackages?.map(pkg => (
                        <TourPackageAdminCard key={pkg.id} tourPackage={pkg} />
                    ))}
                </div>
            )}
            
            {!isLoading && (!allPackages || allPackages.length === 0) && (
                 <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-black/5 bg-white text-center rounded-sm">
                    <Package className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">No itineraries found in the cloud.</p>
                </div>
            )}
        </div>
    );
}
