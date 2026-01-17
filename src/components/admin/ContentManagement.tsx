'use client';

import React, { useState, useTransition, useMemo } from 'react';
import type { Hotel, UserProfile, Booking } from '@/lib/types';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, deleteDoc, collectionGroup, query, orderBy } from 'firebase/firestore';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { revalidateAdminPanel, revalidatePublicContent } from '@/app/admin/actions';
import { HotelForm } from './HotelForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';


// --- Hotel Management Component ---
function HotelManagement() {
    const firestore = useFirestore();
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingHotel, setEditingHotel] = useState<Partial<Hotel> | undefined>(undefined);

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
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Hotel Management</CardTitle>
                    <CardDescription>Add, edit, or delete hotels.</CardDescription>
                </div>
                <Button onClick={handleAddNew} size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Hotel
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({length: 3}).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && hotels?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No hotels found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        )}
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
            </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{editingHotel?.id ? 'Edit Hotel' : 'Add New Hotel'}</DialogTitle>
                    <DialogDescription>
                        {editingHotel?.id ? `Update the details for ${editingHotel.name}.` : 'Fill in the details for the new hotel.'}
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

// --- User List Component ---
function UserList() {
    const firestore = useFirestore();
    const usersQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all registered users.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Display Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>User ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({length: 3}).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                            </TableRow>
                        ))}
                        {users?.map((user) => (
                            <TableRow key={user.uid}>
                                <TableCell className="font-medium">{user.displayName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{user.uid}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// --- Booking List Component ---
function BookingList() {
    const firestore = useFirestore();
    const bookingsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collectionGroup(firestore, 'bookings'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>View all bookings made across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Booking ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Hotel ID</TableHead>
                            <TableHead>Check-in</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total Paid</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({length: 3}).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            </TableRow>
                        ))}
                        {bookings?.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                                <TableCell>
                                    <div>{booking.customerName}</div>
                                    <div className="text-xs text-muted-foreground">{booking.customerEmail}</div>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{booking.hotelId}</TableCell>
                                <TableCell>{format((booking.checkIn as any).toDate(), 'PPP')}</TableCell>
                                <TableCell>{booking.status}</TableCell>
                                <TableCell>₹{booking.totalPrice.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                         {!isLoading && bookings?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No bookings have been made yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// --- Main Dashboard Component ---
export function ContentManagement() {
  return (
    <Tabs defaultValue="hotels" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="hotels">Hotels</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="bookings">Bookings</TabsTrigger>
      </TabsList>
      <TabsContent value="hotels">
        <HotelManagement />
      </TabsContent>
      <TabsContent value="users">
        <UserList />
      </TabsContent>
      <TabsContent value="bookings">
        <BookingList />
      </TabsContent>
    </Tabs>
  );
}
