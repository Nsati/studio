'use client';
import { useFirestore, useCollection, useMemoFirebase, type WithId } from '@/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { collection } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Star, MapPin, Eye, Trash2, Loader2, Edit } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BulkUploadHotelsDialog } from '@/components/admin/BulkUploadHotelsDialog';
import { deleteHotelAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
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
} from '@/components/ui/alert-dialog';

function HotelGridSkeleton() {
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
                        <Skeleton className="h-4 w-1/4" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

function HotelAdminCard({ hotel }: { hotel: WithId<Hotel> }) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const imageUrl = hotel.images[0]?.startsWith('http')
        ? hotel.images[0]
        : PlaceHolderImages.find((img) => img.id === hotel.images[0])?.imageUrl;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteHotelAction(hotel.id);
            if (res.success) {
                toast({ title: 'Property Removed', description: res.message });
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
        <Card className="rounded-none border border-black/5 shadow-sm bg-white overflow-hidden group">
            <div className="relative h-40 w-full overflow-hidden">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={hotel.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="text-xs text-muted-foreground font-black uppercase tracking-widest">No Visual</span>
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="icon" variant="destructive" className="h-7 w-7 rounded-none bg-red-600/90 hover:bg-red-600 shadow-lg" disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-none">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Purge Property?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete "{hotel.name}" and all its associated room inventory and reviews. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-none">Confirm Purge</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <CardHeader className="p-4 space-y-1">
                <CardTitle className="truncate text-base font-black tracking-tight">{hotel.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                    <MapPin className="h-3 w-3 text-[#003580]" /> {hotel.city}
                </CardDescription>
            </CardHeader>
            <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-black/[0.03] mt-2">
                 <div className="flex items-center gap-1 font-black text-[#febb02] text-xs">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{hotel.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0 rounded-none text-muted-foreground hover:text-primary">
                        <Link href={`/hotels/${hotel.id}`} target="_blank" title="View live page">
                            <Eye className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="h-8 rounded-none text-[10px] font-black uppercase px-4 border-black/10">
                        <Link href={`/admin/hotels/${hotel.id}/edit`}><Edit className="h-3 w-3 mr-1" /> Edit</Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}


export default function HotelsPage() {
    const firestore = useFirestore();

    const hotelsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'hotels');
    }, [firestore]);

    const { data: allHotels, isLoading } = useCollection<Hotel>(hotelsQuery);
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#003580]">
                         Inventory Control
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-[#1a1a1a]">Property Nodes</h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        Manage your Himalayan stay collection and real-time inventory.
                    </p>
                </div>
                 <div className="flex items-center gap-3">
                    <BulkUploadHotelsDialog />
                    <Button asChild className="rounded-none h-12 font-black px-8 bg-[#003580] hover:bg-[#002b60] shadow-sm">
                        <Link href="/admin/hotels/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Property
                        </Link>
                    </Button>
                 </div>
            </div>
            
            {isLoading ? <HotelGridSkeleton /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allHotels?.map(hotel => (
                        <HotelAdminCard key={hotel.id} hotel={hotel} />
                    ))}
                </div>
            )}

            {!isLoading && (!allHotels || allHotels.length === 0) && (
                 <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-black/5 bg-white text-center rounded-sm">
                    <MapPin className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">No active properties found.</p>
                </div>
            )}
        </div>
    );
}
