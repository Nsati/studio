'use client';

import { useState, useMemo, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { revalidateAdminPanel, revalidatePublicContent } from '@/app/admin/actions';

import type { Room } from '@/lib/types';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


const roomSchema = z.object({
    type: z.enum(['Standard', 'Deluxe', 'Suite']),
    price: z.coerce.number().min(1, "Price must be greater than 0."),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1."),
    totalRooms: z.coerce.number().min(1, "Total rooms must be at least 1."),
});

type RoomFormValues = z.infer<typeof roomSchema>;

function RoomForm({ hotelId, room, onFinished }: { hotelId: string, room?: Room, onFinished: () => void }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const firestore = useFirestore();

    const form = useForm<RoomFormValues>({
        resolver: zodResolver(roomSchema),
        defaultValues: {
            type: room?.type || 'Standard',
            price: room?.price || 0,
            capacity: room?.capacity || 1,
            totalRooms: room?.totalRooms || 1,
        },
    });

    const onSubmit = (data: RoomFormValues) => {
        if (!firestore) return;

        startTransition(async () => {
            try {
                const roomId = room?.id || `${hotelId}-${data.type.toLowerCase()}`;
                const roomRef = doc(firestore, 'hotels', hotelId, 'rooms', roomId);

                const roomData = { ...data, id: roomId, hotelId };

                if (room) {
                    await updateDoc(roomRef, roomData);
                    toast({ title: 'Room Updated', description: `${data.type} room has been updated.` });
                } else {
                    await setDoc(roomRef, roomData);
                    toast({ title: 'Room Added', description: `${data.type} room has been added.` });
                }

                await revalidateAdminPanel();
                await revalidatePublicContent();
                onFinished();
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Room Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!room}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a room type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Standard">Standard</SelectItem>
                                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                                    <SelectItem value="Suite">Suite</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price per night (₹)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Capacity</FormLabel>
                            <FormControl>
                                <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="totalRooms"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Number of Rooms</FormLabel>
                            <FormControl>
                                <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onFinished}>Cancel</Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {room ? 'Update Room' : 'Add Room'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    )
}

export function RoomManagement({ hotelId }: { hotelId: string }) {
    const firestore = useFirestore();
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentRoom, setCurrentRoom] = useState<Room | undefined>(undefined);

    const roomsQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'hotels', hotelId, 'rooms');
    }, [firestore, hotelId]);

    const { data: rooms, isLoading } = useCollection<Room>(roomsQuery);

    const handleAdd = () => {
        setCurrentRoom(undefined);
        setIsDialogOpen(true);
    }

    const handleEdit = (room: Room) => {
        setCurrentRoom(room);
        setIsDialogOpen(true);
    }

    const handleDelete = (roomId: string) => {
         if (!firestore) return;
         startTransition(async () => {
             try {
                await deleteDoc(doc(firestore, "hotels", hotelId, "rooms", roomId));
                toast({ title: "Room Deleted", description: `The room has been removed.` });
                await revalidateAdminPanel();
                await revalidatePublicContent();
             } catch (e: any) {
                toast({ variant: "destructive", title: "Error", description: e.message });
             }
        });
    }


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Manage Rooms</CardTitle>
                    <CardDescription>Add, edit, or remove rooms for this hotel.</CardDescription>
                </div>
                <Button size="sm" onClick={handleAdd}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Room
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Total Rooms</TableHead>
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({length: 2}).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && rooms?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No rooms found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                        {rooms?.map((room) => (
                            <TableRow key={room.id}>
                                <TableCell className="font-medium">{room.type}</TableCell>
                                <TableCell>₹{room.price.toLocaleString()}</TableCell>
                                <TableCell>{room.capacity}</TableCell>
                                <TableCell>{room.totalRooms}</TableCell>
                                <TableCell className="text-right space-x-2">
                                     <Button variant="ghost" size="icon" onClick={() => handleEdit(room)}>
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
                                                    This will permanently delete the {room.type} room. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(room.id)}
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
            </CardContent>

             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>{currentRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the room. Click save when you're done.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <RoomForm hotelId={hotelId} room={currentRoom} onFinished={() => setIsDialogOpen(false)} />
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
