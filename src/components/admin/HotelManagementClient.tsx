'use client';

import { useState, useTransition, useMemo } from 'react';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HotelForm } from './HotelForm';
import type { Hotel } from '@/lib/types';
import { revalidateAdminPanel } from '@/app/admin/actions';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, Loader2 } from 'lucide-react';
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
import { Skeleton } from '../ui/skeleton';

export function HotelManagementClient() {
  const firestore = useFirestore();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

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
    setEditingHotel(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (hotel: Hotel) => {
    if (!firestore) return;
    startTransition(async () => {
      try {
        const hotelRef = doc(firestore, 'hotels', hotel.id);
        await deleteDoc(hotelRef);
        await revalidateAdminPanel();
        toast({
          title: 'Hotel Deleted',
          description: `The hotel "${hotel.name}" has been successfully removed.`,
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
    <Card>
      <div className="flex items-center justify-between p-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Hotel Management</h2>
            <p className="text-muted-foreground">Add, edit, or remove hotels from your listing.</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Hotel
        </Button>
      </div>

      <div className="border-t">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Rooms Types</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({length: 5}).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
            ))}
            {hotels?.map((hotel) => (
              <TableRow key={hotel.id}>
                <TableCell className="font-medium">{hotel.name}</TableCell>
                <TableCell>{hotel.city}</TableCell>
                <TableCell>{hotel.rooms?.length || 0}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(hotel)}
                    className="mr-2"
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
                          This action cannot be undone. This will permanently
                          delete the hotel "{hotel.name}".
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
            </DialogTitle>
          </DialogHeader>
          <HotelForm
            hotel={editingHotel}
            onFinished={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
