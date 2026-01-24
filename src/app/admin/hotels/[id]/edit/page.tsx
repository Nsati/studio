
'use client';
import { useMemoFirebase, useFirestore, useDoc, useCollection } from '@/firebase';
import { useParams, notFound } from 'next/navigation';
import { doc, collection } from 'firebase/firestore';
import type { Hotel, Room } from '@/lib/types';
import { EditHotelForm } from '@/components/admin/EditHotelForm';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function EditHotelPageSkeleton() {
  return (
    <div className="space-y-6">
        <Skeleton className="h-9 w-1/3 mb-2" />
        <Skeleton className="h-5 w-1/2 mb-8" />
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

export default function EditHotelPage() {
    const params = useParams();
    const hotelId = params.id as string;
    const firestore = useFirestore();

    const hotelRef = useMemoFirebase(() => {
        if (!firestore || !hotelId) return null;
        return doc(firestore, 'hotels', hotelId);
    }, [firestore, hotelId]);

    const roomsQuery = useMemoFirebase(() => {
        if (!firestore || !hotelId) return null;
        return collection(firestore, 'hotels', hotelId, 'rooms');
    }, [firestore, hotelId]);

    const { data: hotel, isLoading: isLoadingHotel } = useDoc<Hotel>(hotelRef);
    const { data: rooms, isLoading: isLoadingRooms } = useCollection<Room>(roomsQuery);

    if (isLoadingHotel || isLoadingRooms) {
        return <EditHotelPageSkeleton />;
    }

    if (!hotel) {
        return notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Edit Hotel</h1>
                <p className="text-muted-foreground">Update the details for &quot;{hotel.name}&quot;.</p>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <EditHotelForm hotel={hotel} rooms={rooms || []} />
                </CardContent>
            </Card>
        </div>
    );
}
