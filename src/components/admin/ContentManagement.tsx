'use client';

import React, { useTransition, useMemo } from 'react';
import type { Hotel, UserProfile, Booking } from '@/lib/types';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, deleteDoc, collectionGroup, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { dummyHotels } from '@/lib/dummy-data';


// --- Hotel Management Component ---
function HotelManagement() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const firestore = useFirestore();
    const hotelsQuery = useMemo(() => firestore ? collection(firestore, 'hotels') : null, [firestore]);
    const { data: liveHotels, isLoading } = useCollection<Hotel>(hotelsQuery);
    
    const allHotels = useMemo(() => {
        const hotelMap = new Map<string, Hotel & { isDummy?: boolean }>();

        // Add dummy hotels first
        dummyHotels.forEach(hotel => {
            hotelMap.set(hotel.id, { ...hotel, isDummy: true });
        });

        // Overwrite with live hotels, marking them as not dummy
        liveHotels?.forEach(hotel => {
            hotelMap.set(hotel.id, { ...hotel, isDummy: false });
        });

        return Array.from(hotelMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [liveHotels]);
    
    const handleDelete = (hotel: Hotel & { isDummy?: boolean }) => {
        if (!firestore) return;

        if (hotel.isDummy) {
            toast({
                variant: 'destructive',
                title: 'Action Not Allowed',
                description: 'Dummy hotels can only be removed from the code, not deleted from the admin panel.',
            });
            return;
        }

        startTransition(async () => {
             try {
                await deleteDoc(doc(firestore, "hotels", hotel.id));
                toast({ title: "Hotel Deleted", description: `${hotel.name} has been removed.` });
                await revalidateAdminPanel();
                await revalidatePublicContent();
             } catch (e: any) {
                toast({ variant: "destructive", title: "Error", description: e.message });
             }
        });
    };

    return (
        <>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Hotel Management</CardTitle>
                    <CardDescription>Add, edit, or delete hotels. Dummy hotels are read-only.</CardDescription>
                </div>
                 <Button asChild size="sm">
                    <Link href="/admin/hotels/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Hotel
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({length: 5}).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && allHotels.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No hotels found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                        {allHotels.map((hotel) => (
                           <TableRow key={hotel.id} className={hotel.isDummy ? 'bg-muted/30' : ''}>
                                <TableCell className="font-medium">{hotel.name}</TableCell>
                                <TableCell>{hotel.city}</TableCell>
                                <TableCell>
                                    <Badge variant={hotel.isDummy ? 'secondary' : 'default'}>
                                        {hotel.isDummy ? 'Dummy' : 'Live'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                        {hotel.rating}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                     <Button asChild variant="ghost" size="icon">
                                      <Link href={`/admin/hotels/${hotel.id}/edit`}>
                                        <Edit className="h-4 w-4" />
                                      </Link>
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
                                                    This will permanently delete the hotel "{hotel.name}". This action cannot be undone.
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
        </>
    );
}


// --- User List Component ---
function UserList() {
    const firestore = useFirestore();
    const usersQuery = useMemo(() => firestore ? collection(firestore, 'users') : null, [firestore]);
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
                        {!isLoading && users?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
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
                            <TableHead>Hotel</TableHead>
                            <TableHead>Check-in</TableHead>
                            <TableHead>Check-out</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total Paid</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({length: 5}).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            </TableRow>
                        ))}
                        {bookings?.map((booking) => {
                            const checkInDate = (booking.checkIn as any).toDate ? (booking.checkIn as any).toDate() : new Date(booking.checkIn);
                            const checkOutDate = (booking.checkOut as any).toDate ? (booking.checkOut as any).toDate() : new Date(booking.checkOut);
                            return (
                            <TableRow key={booking.id}>
                                <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                                <TableCell>
                                    <div>{booking.customerName}</div>
                                    <div className="text-xs text-muted-foreground">{booking.customerEmail}</div>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{booking.hotelId}</TableCell>
                                <TableCell>{format(checkInDate, 'PPP')}</TableCell>
                                <TableCell>{format(checkOutDate, 'PPP')}</TableCell>
                                <TableCell>
                                     <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'destructive'} className="capitalize">
                                        {booking.status?.toLowerCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>{booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</TableCell>
                            </TableRow>
                        )})}
                         {!isLoading && bookings?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
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
