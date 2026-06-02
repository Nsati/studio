'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { doc, writeBatch } from 'firebase/firestore';
import { useFirestore, type WithId } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import slugify from 'slugify';
import { useState } from 'react';
import type { Hotel, Room } from '@/lib/types';
import { deleteHotelAction } from '@/app/admin/hotels/actions';

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
import { Switch } from "@/components/ui/switch"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dummyCities } from '@/lib/dummy-data';
import { Loader2, Trash2, PlusCircle, ShieldAlert } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardHeader } from '../ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { ImageUpload } from './ImageUpload';

const allAmenities = ['wifi', 'parking', 'restaurant', 'bar', 'spa', 'pool', 'gym', 'mountain-view', 'garden', 'library', 'river-view', 'ghat', 'adventure', 'trekking', 'skiing', 'heritage', 'safari'];

const roomSchema = z.object({
  id: z.string().optional(),
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
  images: z.array(z.string()).min(1, 'Please upload at least one image.'),
  rooms: z.array(roomSchema).min(1, 'Please add at least one room type.'),
  isVerifiedPahadiHost: z.boolean().default(false),
  ecoPractices: z.object({
    waterSaving: z.boolean().default(false),
    plasticFree: z.boolean().default(false),
    localSourcing: z.boolean().default(false),
  }).default({ waterSaving: false, plasticFree: false, localSourcing: false }),
  safetyInfo: z.object({
    nearestHospital: z.string().optional(),
    policeStation: z.string().optional(),
    networkCoverage: z.enum(['good', 'average', 'poor', '']).optional(),
  }).default({ nearestHospital: '', policeStation: '', networkCoverage: '' }),
  spiritualAmenities: z.array(z.string()).default([]),
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
      rooms: initialRooms.map(r => ({...r})),
      isVerifiedPahadiHost: hotel.isVerifiedPahadiHost || false,
      ecoPractices: hotel.ecoPractices || { waterSaving: false, plasticFree: false, localSourcing: false },
      safetyInfo: hotel.safetyInfo || { nearestHospital: '', policeStation: '', networkCoverage: '' },
      spiritualAmenities: hotel.spiritualAmenities || [],
    },
  });

  const { fields: roomFields, append: appendRoom, remove: removeRoom } = useFieldArray({
    control: form.control,
    name: 'rooms',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;

    setIsLoading(true);
    const hotelId = hotel.id;
    const batch = writeBatch(firestore);
    
    const minPrice = values.rooms.length > 0 ? Math.min(...values.rooms.map(r => r.price)) : 0;

    const hotelRef = doc(firestore, 'hotels', hotelId);
    const { rooms, ...hotelData } = values;
    batch.update(hotelRef, { ...hotelData, minPrice });

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

    for (const rid of roomsToDelete) {
        const roomRef = doc(firestore, 'hotels', hotelId, 'rooms', rid);
        batch.delete(roomRef);
    }
    
    try {
        await batch.commit();
        toast({ title: 'Hotel Updated!', description: `${values.name} inventory synced.` });
        router.push('/admin/hotels');
        router.refresh();
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
        setIsLoading(false);
      }
  }

  const handleDeleteHotel = async () => {
    setIsDeleting(true);
    try {
        const res = await deleteHotelAction(hotel.id);
        if (res.success) {
            toast({ title: 'Record Purged', description: res.message });
            router.push('/admin/hotels');
            router.refresh();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: res.message });
        }
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Critical Error', description: e.message });
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Property Name</FormLabel><FormControl><Input {...field} className="h-12 rounded-none" /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">City Hub</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{dummyCities.map(city => (<SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>))}</SelectContent>
                </Select>
                <FormMessage /></FormItem>
            )} />
        </div>
        <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detailed Summary</FormLabel><FormControl><Textarea className="resize-y min-h-[150px] rounded-none" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <Separator />

        <div>
            <h3 className="text-lg font-black tracking-tight text-primary uppercase flex items-center gap-2">
                <PlusCircle className="h-5 w-5" /> Gallery Management
            </h3>
            <FormDescription className="text-[10px] font-black uppercase tracking-widest">Upload high-res property photos for the Northern Harrier grid.</FormDescription>
        </div>
        <FormField control={form.control} name="images" render={({ field }) => (
            <FormItem>
                <FormControl>
                    <ImageUpload value={field.value} onChange={field.onChange} maxImages={15} />
                </FormControl>
                <FormMessage />
            </FormItem>
        )} />

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField control={form.control} name="rating" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trust Rating (1-5)</FormLabel><FormControl><Input type="number" step="0.1" {...field} className="h-12 rounded-none" /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="discount" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Exclusive Discount (%)</FormLabel><FormControl><Input type="number" {...field} className="h-12 rounded-none" onChange={event => field.onChange(+event.target.value)} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>

        <Separator />
        
        <div className="flex items-center justify-between pt-8 border-t gap-4">
            <Button type="submit" disabled={isLoading || isDeleting} className="h-14 px-10 rounded-none font-black text-lg bg-[#003580] hover:bg-[#002b60] shadow-xl flex-1">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {isLoading ? 'Synchronizing...' : 'Sync Property Data'}
            </Button>
            
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" disabled={isDeleting || isLoading} className="h-14 px-10 rounded-none font-black text-lg border-2 border-red-600 bg-transparent text-red-600 hover:bg-red-600 hover:text-white">
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Purge Property
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-none border-0 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black flex items-center gap-3">
                            <ShieldAlert className="h-6 w-6 text-red-600" /> Confirm Deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground font-medium text-base">
                            This will wipe all room inventory, reviews, and current booking associations for <strong>"{hotel.name}"</strong> from the Northern Harrier cloud. This is irreversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel className="rounded-none h-11 font-bold">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteHotel} className="bg-red-600 hover:bg-red-700 text-white rounded-none h-11 font-black px-8">
                            Confirm Permanent Purge
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </form>
    </Form>
  );
}
