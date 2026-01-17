'use client';

import React, { useState, useTransition, useMemo } from 'react';
import type { Hotel } from '@/lib/types';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
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
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Star, Edit, Trash2, Loader2, PlusCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { revalidateAdminPanel, revalidatePublicContent } from '@/app/admin/actions';
import { HotelForm } from './HotelForm';

export function HotelList() {
    const firestore = useFirestore();
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingHotel, setEditingHotel] = useState<Hotel | undefined>(undefined);

    const hotelsQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'hotels');
    }, [firestore]);

    const { data: hotels, isLoading } = useCollection<Hotel>(hotelsQuery);

    const handleEdit = (hotel: Hotel) => {
        setEditingHotel(hotel);
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingHotel(undefined);
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
        <Card>
            <div className="p-6 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Hotel Management</h2>
                    <p className="text-muted-foreground">
                        Add, edit, or delete hotels on the platform.
                    </p>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Hotel
                </Button>
            </div>
            <div className="border-t">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({length: 5}).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                            </TableRow>
                        ))}
                        {hotels?.map((hotel) => (
                           <TableRow key={hotel.id}>
                                <TableCell className="font-medium">{hotel.name}</TableCell>
                                <TableCell>{hotel.city}</TableCell>
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
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</DialogTitle>
                    <DialogDescription>
                        {editingHotel ? `Update the details for ${editingHotel.name}.` : 'Fill in the details for the new hotel.'}
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
