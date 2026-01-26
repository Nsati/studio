
'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { doc, writeBatch, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { useFirestore, type WithId } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import slugify from 'slugify';
import { useState } from 'react';
import type { Hotel, Room } from '@/lib/types';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dummyCities } from '@/lib/dummy-data';
import { Loader2, Trash2, PlusCircle } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardHeader } from '../ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const hotelImagePlaceholders = PlaceHolderImages.filter(p => p.id.startsWith('hotel-'));

const allAmenities = ['wifi', 'parking', 'restaurant', 'bar', 'spa', 'pool', 'gym', 'mountain-view', 'garden', 'library', 'river-view', 'ghat', 'adventure', 'trekking', 'skiing', 'heritage', 'safari'];

const roomSchema = z.object({
  id: z.string().optional(), // Existing rooms will have an ID
  type: z.enum(['Standard', 'Deluxe', 'Suite']),
  price: z.coerce.number().min(1, 'Price must be positive.'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1.'),
  totalRooms: z.coerce.number().min(1, 'Total rooms must be at least 1.'),
  availableRooms: z.coerce.number().optional(),
});


const formSchema = z.object({
  name: z.string().min(3, 'Hotel name must be at least 3 characters long.'),
  city: z.string().min(1, 'Please select a city.'),
  address: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  rating: z.coerce.number().min(1).max(5).positive(),
  discount: z.coerce.number().min(0).max(100).optional(),
  amenities: z.array(z.string()).min(1, 'Please select at least one amenity.'),
  images: z.array(z.string()).min(1, 'Please select at least one image.'),
  rooms: z.array(roomSchema).min(1, 'Please add at least one room type.'),
});

type EditHotelFormProps = {
    hotel: WithId<Hotel>;
    rooms: WithId<Room>[];
}

export function EditHotelForm({ hotel, rooms: initialRooms }: EditHotelFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [roomsToDelete, setRoomsToDelete] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: hotel.name,
      city: hotel.city,
      description: hotel.description,
      address: hotel.address || '',
      rating: hotel.rating,
      discount: hotel.discount || 0,
      amenities: hotel.amenities,
      images: hotel.images,
      rooms: initialRooms.map(r => ({...r})), // Pass rooms with their IDs
    },
  });

  const { fields: roomFields, append: appendRoom, remove: removeRoom } = useFieldArray({
    control: form.control,
    name: 'rooms',
  });

  const handleRemoveRoom = (index: number) => {
    const roomToRemove = roomFields[index];
    if (roomToRemove.id) {
        setRoomsToDelete(prev => [...prev, roomToRemove.id!]);
    }
    removeRoom(index);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Firestore not available' });
        return;
    }

    setIsLoading(true);
    const hotelId = hotel.id;
    const batch = writeBatch(firestore);
    
    const minPrice = values.rooms.length > 0 ? Math.min(...values.rooms.map(r => r.price)) : 0;

    const hotelRef = doc(firestore, 'hotels', hotelId);
    const { rooms, ...hotelData } = values;
    batch.update(hotelRef, {
        ...hotelData,
        minPrice,
    });

    for (const room of rooms) {
        const { id: roomId, ...roomData } = room;
        if (roomId) {
            const roomRef = doc(firestore, 'hotels', hotelId, 'rooms', roomId);
            const currentInitialRoom = initialRooms.find(r => r.id === roomId);
            const totalRoomsDelta = currentInitialRoom ? room.totalRooms - currentInitialRoom.totalRooms : 0;
            const newAvailableRooms = (currentInitialRoom?.availableRooms ?? 0) + totalRoomsDelta;

            batch.update(roomRef, { 
                ...roomData,
                availableRooms: newAvailableRooms >= 0 ? newAvailableRooms : 0,
            });
        } else {
            const newRoomId = slugify(`${values.name} ${room.type} ${Math.random().toString(36).substring(2, 7)}`, { lower: true, strict: true });
            const roomRef = doc(firestore, 'hotels', hotelId, 'rooms', newRoomId);
            batch.set(roomRef, {
                hotelId: hotelId,
                ...roomData,
                availableRooms: room.totalRooms,
            });
        }
    }

    for (const roomId of roomsToDelete) {
        const roomRef = doc(firestore, 'hotels', hotelId, 'rooms', roomId);
        batch.delete(roomRef);
    }
    
    try {
        await batch.commit();
        toast({
            title: 'Hotel Updated!',
            description: `${values.name} and its rooms have been successfully updated.`,
        });
        router.push('/admin/hotels');
        router.refresh();
      } catch (error: any) {
        console.error("Error updating hotel:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Could not update hotel. Check Firestore rules.',
        });
      } finally {
        setIsLoading(false);
      }
  }

  const handleDeleteHotel = async () => {
    if (!firestore) return;
    setIsDeleting(true);
    const batch = writeBatch(firestore);
    
    const hotelRef = doc(firestore, 'hotels', hotel.id);
    const roomsRef = collection(firestore, 'hotels', hotel.id, 'rooms');
    const reviewsRef = collection(firestore, 'hotels', hotel.id, 'reviews');

    try {
        const [roomsSnap, reviewsSnap] = await Promise.all([
             getDocs(roomsRef),
             getDocs(reviewsRef)
        ]);

        roomsSnap.forEach(roomDoc => batch.delete(roomDoc.ref));
        reviewsSnap.forEach(reviewDoc => batch.delete(reviewDoc.ref));
        
        batch.delete(hotelRef);
        await batch.commit();
        
        toast({
            title: 'Hotel Deleted',
            description: `${hotel.name} has been removed from the platform.`,
        });
        router.push('/admin/hotels');
        router.refresh();
    } catch (error: any) {
        console.error("Error deleting hotel:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Could not delete hotel. Check Firestore rules.',
        });
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                <FormLabel>Hotel Name</FormLabel>
                <FormControl><Input placeholder="e.g. The Grand Himalayan" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />
             <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                <FormLabel>City</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a city" /></SelectTrigger></FormControl>
                    <SelectContent>
                    {dummyCities.map(city => (<SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )} />
        </div>
        
        <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea placeholder="Tell us about this wonderful hotel" className="resize-y" {...field} /></FormControl>
            <FormMessage />
            </FormItem>
        )} />

        <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem>
            <FormLabel>Full Address (Optional)</FormLabel>
            <FormControl><Textarea placeholder="e.g. Mall Road, Near High Court, Nainital, Uttarakhand 263001" className="resize-y" {...field} /></FormControl>
            <FormDescription>Used by the AI Arrival Assistant to provide directions.</FormDescription>
            <FormMessage />
            </FormItem>
        )} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField control={form.control} name="rating" render={({ field }) => (
                <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl><Input type="number" step="0.1" min="1" max="5" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />
             <FormField control={form.control} name="discount" render={({ field }) => (
                <FormItem>
                <FormLabel>Discount (%)</FormLabel>
                <FormControl><Input type="number" step="1" min="0" max="100" placeholder="e.g. 15" {...field} onChange={event => field.onChange(+event.target.value)} /></FormControl>
                <FormDescription>Optional: Enter a discount percentage (0-100).</FormDescription>
                <FormMessage />
                </FormItem>
            )} />
        </div>

        <FormField control={form.control} name="amenities" render={() => (
            <FormItem>
                <div className="mb-4"><FormLabel className="text-base">Amenities</FormLabel><FormDescription>Select all amenities that apply.</FormDescription></div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2 border rounded-md">
                {allAmenities.map((item) => (
                    <FormField key={item} control={form.control} name="amenities" render={({ field }) => {
                        return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                            <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                return checked ? field.onChange([...(field.value || []), item]) : field.onChange((field.value || [])?.filter((value) => value !== item));
                                }}
                            />
                            </FormControl>
                            <FormLabel className="text-sm font-normal capitalize">{item.replace('-', ' ')}</FormLabel>
                        </FormItem>
                        );
                    }} />
                ))}
                </div>
                <FormMessage className="mt-2" />
            </FormItem>
        )} />

        <Separator />
        
        <FormField control={form.control} name="images" render={() => (
            <FormItem>
                <div className="mb-4"><FormLabel className="text-base">Hotel Images</FormLabel><FormDescription>Select one or more images for the hotel gallery.</FormDescription></div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2 border rounded-md max-h-60 overflow-y-auto">
                    {hotelImagePlaceholders.map((item) => (
                        <FormField key={item.id} control={form.control} name="images" render={({ field }) => {
                            return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                    return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange((field.value || [])?.filter((value) => value !== item.id));
                                    }}
                                />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">{item.description}</FormLabel>
                            </FormItem>
                            );
                        }} />
                    ))}
                </div>
                <FormMessage className="mt-2" />
            </FormItem>
        )} />

        <Separator />
        
        <div>
            <h3 className="text-lg font-medium">Room Types</h3>
            <FormDescription>Manage the rooms available in this hotel.</FormDescription>
            <FormField control={form.control} name="rooms" render={() => (<FormItem><FormMessage className="mt-2" /></FormItem>)} />
        </div>

        <div className="space-y-4">
          {roomFields.map((field, index) => (
            <Card key={field.id} className="p-4 bg-muted/30">
                <CardHeader className="flex flex-row items-center justify-between p-0 pb-4">
                     <h4 className="font-semibold">Room Configuration {index + 1}</h4>
                     <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveRoom(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </CardHeader>
                <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField control={form.control} name={`rooms.${index}.type`} render={({ field }) => (
                        <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Standard">Standard</SelectItem>
                                <SelectItem value="Deluxe">Deluxe</SelectItem>
                                <SelectItem value="Suite">Suite</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name={`rooms.${index}.price`} render={({ field }) => (
                        <FormItem>
                        <FormLabel>Price / night</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g. 5000" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name={`rooms.${index}.capacity`} render={({ field }) => (
                        <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g. 2" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name={`rooms.${index}.totalRooms`} render={({ field: formField }) => (
                        <FormItem>
                        <FormLabel>Total Units</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g. 10" {...formField} /></FormControl>
                         <FormDescription className="text-xs">
                           Inventory: {field.id ? (initialRooms.find(r => r.id === field.id)?.availableRooms ?? '?') : form.watch(`rooms.${index}.totalRooms`)} / {form.watch(`rooms.${index}.totalRooms`)}
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendRoom({ type: 'Standard', price: 5000, capacity: 2, totalRooms: 10 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Room Type</Button>
        </div>


        <div className="flex items-center justify-between pt-8 border-t">
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" disabled={isDeleting}>
                         {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Hotel
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the hotel and all its associated rooms and reviews. Bookings will NOT be deleted but will be orphaned.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteHotel} className="bg-destructive hover:bg-destructive/90">
                        Yes, delete hotel
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </form>
    </Form>
  );
}
