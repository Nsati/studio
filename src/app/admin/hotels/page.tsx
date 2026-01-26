
'use client';
import { useFirestore, useCollection, useMemoFirebase, type WithId } from '@/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { collection } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Star, MapPin, Eye } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function HotelGridSkeleton() {
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
                        <Skeleton className="h-4 w-1/4" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

function HotelAdminCard({ hotel }: { hotel: WithId<Hotel> }) {
    const imageUrl = hotel.images[0]?.startsWith('http')
        ? hotel.images[0]
        : PlaceHolderImages.find((img) => img.id === hotel.images[0])?.imageUrl;

    return (
        <Card>
            <div className="relative h-40 w-full">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={hotel.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover rounded-t-lg"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted rounded-t-lg">
                        <span className="text-sm text-muted-foreground">No Image</span>
                    </div>
                )}
            </div>
            <CardHeader>
                <CardTitle className="truncate">{hotel.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {hotel.city}
                </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between items-center">
                 <div className="flex items-center gap-1 font-semibold text-amber-500">
                    <Star className="h-5 w-5 fill-current" />
                    <span>{hotel.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/hotels/${hotel.id}`} target="_blank" title="View live page">
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/hotels/${hotel.id}/edit`}>Edit</Link>
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
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Hotel Management</h1>
                    <p className="text-muted-foreground">
                        Here you can view, add, and edit hotel properties.
                    </p>
                </div>
                 <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/admin/hotels/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Hotel
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
                 <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    <p>No hotels found in the database. Get started by adding one.</p>
                </div>
            )}
        </div>
    );
}
