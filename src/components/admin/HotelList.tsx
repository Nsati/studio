'use client';

import React, { useState, useTransition, useMemo } from 'react';
import type { Hotel, City } from '@/lib/types';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, deleteDoc, query, where } from 'firebase/firestore';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { Button } from '../ui/button';
import { Star, Edit, Trash2, Loader2, PlusCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { revalidateAdminPanel, revalidatePublicContent } from '@/app/admin/actions';
import { HotelForm } from './HotelForm';

interface HotelListProps {
    city: City;
}

export function HotelList({ city }: HotelListProps) {
    const firestore = useFirestore();
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingHotel, setEditingHotel] = useState<Partial<Hotel> | undefined>(undefined);

    const hotelsQuery = useMemo(() => {
        if (!firestore || !city) return null;
        return query(collection(firestore, 'hotels'), where('city', '==', city.name));
    }, [firestore, city]);

    const { data: hotels, isLoading } = useCollection<Hotel>(hotelsQuery);

    const handleEdit = (hotel: Hotel) => {
        setEditingHotel(hotel);
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingHotel({ city: city.name });
        setIsDialogOpen(true);
    }

    const handleDelete = (hotel: Hotel) => {
        if (!firestore) return;
        startTransition(async () => {
            try {
                await deleteDoc(doc(firestore, 'hotels', hotel.id));
                await revalidateAdminPanel();
                await revalidatePublicContent();
                toast({
                    title: 'Hotel Deleted',
                    description: `Hotel "${hotel.name}" has been successfully removed.`,
                });
            } catch (e: any) {
                 toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: `Could not delete hotel: ${e.message}`,
                });
            }
        });
    };

    return (
        <>
        <div className="border rounded-lg">
            <div className="p-4 flex justify-end items-start">
                <Button onClick={handleAddNew} size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Hotel in {city.name}
                </Button>
            </div>
            <div className="border-t">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({length: 2}).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && hotels?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No hotels yet in {city.name}.
                                </TableCell>
                            </TableRow>
                        )}
                        {hotels?.map((hotel) => (
                           <TableRow key={hotel.id}>
                                <TableCell className="font-medium">{hotel.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                        {hotel.rating}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(hotel)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={isPending}>
                                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the hotel "{hotel.name}".
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(hotel)}
                                                    className="bg-destructive hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                           </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{editingHotel?.id ? 'Edit Hotel' : 'Add New Hotel'}</DialogTitle>
                    <DialogDescription>
                        {editingHotel?.id ? `Update the details for ${editingHotel.name}.` : `Fill in the details for the new hotel in ${city.name}.`}
                    </DialogDescription>
                </DialogHeader>
                <HotelForm
                    hotel={editingHotel}
                    onFinished={() => setIsDialogOpen(false)}
                />
            </DialogContent>
        </Dialog>
        </>
    );
}
