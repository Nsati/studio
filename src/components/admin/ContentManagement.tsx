'use client';

import React, { useState, useTransition, useMemo } from 'react';
import type { City } from '@/lib/types';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Button } from '../ui/button';
import { Edit, Trash2, Loader2, PlusCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { revalidateAdminPanel, revalidatePublicContent } from '@/app/admin/actions';
import { CityForm } from './CityForm';
import { HotelList } from './HotelList';

export function ContentManagement() {
    const firestore = useFirestore();
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    // State for City Form Dialog
    const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
    const [editingCity, setEditingCity] = useState<City | undefined>(undefined);

    const citiesQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'cities');
    }, [firestore]);

    const { data: cities, isLoading } = useCollection<City>(citiesQuery);

    const handleEditCity = (city: City) => {
        setEditingCity(city);
        setIsCityDialogOpen(true);
    };

    const handleAddNewCity = () => {
        setEditingCity(undefined);
        setIsCityDialogOpen(true);
    }

    const handleDeleteCity = (city: City) => {
        if (!firestore) return;
        startTransition(async () => {
            try {
                await deleteDoc(doc(firestore, 'cities', city.id));
                await revalidateAdminPanel();
                await revalidatePublicContent();
                toast({
                    title: 'City Deleted',
                    description: `City "${city.name}" has been successfully removed. Associated hotels are now uncategorized.`,
                });
            } catch (e: any) {
                 toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: `Could not delete city: ${e.message}`,
                });
            }
        });
    };

    if (isLoading) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        )
    }

    return (
        <>
            <div className="flex justify-end mb-8">
                <Button onClick={handleAddNewCity}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New City
                </Button>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                {cities?.map(city => (
                     <AccordionItem value={city.id} key={city.id} className="border-none">
                        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-t-lg border">
                            <AccordionTrigger className="text-xl font-headline flex-grow p-2 hover:no-underline">
                                {city.name}
                            </AccordionTrigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); handleEditCity(city); }}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={isPending} onClick={e => e.stopPropagation()}>
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                           This action will permanently delete the city "{city.name}". Hotels in this city will no longer appear under a city category.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDeleteCity(city)}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        <AccordionContent className="border border-t-0 rounded-b-lg p-4">
                           <HotelList city={city} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        
            <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editingCity ? 'Edit City' : 'Add New City'}</DialogTitle>
                        <DialogDescription>
                            {editingCity ? `Update the details for ${editingCity.name}.` : 'Fill in the details for the new city.'}
                        </DialogDescription>
                    </DialogHeader>
                    <CityForm
                        city={editingCity}
                        onFinished={() => setIsCityDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
