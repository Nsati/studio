'use client';
import { useParams, notFound } from 'next/navigation';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { useMemo } from 'react';

import { HotelForm } from '@/components/admin/HotelForm';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RoomManagement } from '@/components/admin/RoomManagement';


export default function EditHotelPage() {
    const params = useParams();
    const id = params.id as string;
    const firestore = useFirestore();

    const hotelRef = useMemo(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'hotels', id);
    }, [firestore, id]);

    const { data: hotel, isLoading } = useDoc<Hotel>(hotelRef);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 space-y-8">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-96 w-full" />
                <div className="mt-8">
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (!hotel) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8">
             <div className="flex items-center gap-4 mb-8">
                <Link href="/admin" className="p-2 rounded-md hover:bg-muted">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h1 className="font-headline text-4xl font-bold">Edit Hotel</h1>
                    <p className="text-muted-foreground">Update the details for {hotel.name}.</p>
                </div>
            </div>
            <Card>
                <CardContent className="p-6">
                    <HotelForm hotel={hotel} />
                </CardContent>
            </Card>

            <div className="mt-8">
                <RoomManagement hotelId={hotel.id} />
            </div>
        </div>
    );
}
