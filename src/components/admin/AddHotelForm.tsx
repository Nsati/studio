'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { doc, writeBatch } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import slugify from 'slugify';
import { useState } from 'react';

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
import { Loader2, Trash2, PlusCircle } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardHeader } from '../ui/card';
import { ImageUpload } from './ImageUpload';

const allAmenities = ['wifi', 'parking', 'restaurant', 'bar', 'spa', 'pool', 'gym', 'mountain-view', 'garden', 'library', 'river-view', 'ghat', 'adventure', 'trekking', 'skiing', 'heritage', 'safari'];
const allSpiritualAmenities = ['meditation-friendly', 'silent-zone', 'sunrise-view', 'temple-nearby', 'yoga-sessions'];

const roomSchema = z.object({
  type: z.enum(['Standard', 'Deluxe', 'Suite']),
  price: z.coerce.number().min(1, 'Price must be positive.'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1.'),
  totalRooms: z.coerce.number().min(1, 'Total rooms must be at least 1.'),
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


export function AddHotelForm() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      city: '',
      description: '',
      address: '',
      rating: 4,
      discount: 0,
      amenities: [],
      images: [],
      rooms: [{ type: 'Standard', price: 5000, capacity: 2, totalRooms: 10 }],
      isVerifiedPahadiHost: false,
      ecoPractices: { waterSaving: false, plasticFree: false, localSourcing: false },
      safetyInfo: { nearestHospital: '', policeStation: '', networkCoverage: '' },
      spiritualAmenities: [],
    },
  });

  const { fields: roomFields, append: appendRoom, remove: removeRoom } = useFieldArray({
    control: form.control,
    name: 'rooms',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Firestore not available' });
        return;
    }
    setIsLoading(true);

    const hotelId = slugify(values.name, { lower: true, strict: true });
    const batch = writeBatch(firestore);

    const minPrice = Math.min(...values.rooms.map(r => r.price));

    const hotelRef = doc(firestore, 'hotels', hotelId);
    const { rooms, ...hotelData } = values;
    batch.set(hotelRef, {
        ...hotelData,
        minPrice,
    });

    for (const room of rooms) {
        const roomId = slugify(`${values.name} ${room.type} ${Math.random().toString(36).substring(2, 7)}`, { lower: true, strict: true });
        const roomRef = doc(firestore, 'hotels', hotelId, 'rooms', roomId);
        batch.set(roomRef, {
            hotelId: hotelId,
            ...room,
            availableRooms: room.totalRooms,
        });
    }
    
    try {
        await batch.commit();
        toast({
            title: 'Hotel Added!',
            description: `${values.name} has been successfully created.`,
        });
        router.push('/admin/hotels');
        router.refresh();
      } catch (error: any) {
        console.error("Error adding hotel:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Could not add hotel.',
        });
      } finally {
        setIsLoading(false);
      }
  }

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
            <FormLabel>Full Address</FormLabel>
            <FormControl><Textarea placeholder="e.g. Mall Road, Near High Court, Nainital, Uttarakhand 263001" className="resize-y" {...field} /></FormControl>
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
                <FormMessage />
                </FormItem>
            )} />
        </div>

        <Separator />

        <div>
            <h3 className="text-lg font-black tracking-tight">Gallery Management</h3>
            <FormDescription className="text-[10px] font-black uppercase tracking-widest">Upload original high-quality photos of the property.</FormDescription>
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

        <div>
            <h3 className="text-lg font-medium">Unique Features</h3>
            <FormDescription>Add special details that make this hotel stand out.</FormDescription>
        </div>
        <FormField control={form.control} name="isVerifiedPahadiHost" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <FormLabel>Verified Pahadi Host</FormLabel>
                    <FormDescription>Enable this badge for locally owned properties.</FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl>
            </FormItem>
        )} />
        
        <Separator />
        
        <FormField control={form.control} name="amenities" render={() => (
            <FormItem>
                <div className="mb-4"><FormLabel className="text-base">Standard Amenities</FormLabel></div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2 border rounded-md">
                {allAmenities.map((item) => (
                    <FormField key={item} control={form.control} name="amenities" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl><Checkbox checked={field.value?.includes(item)} onCheckedChange={(checked) => (checked ? field.onChange([...(field.value || []), item]) : field.onChange((field.value || [])?.filter((value) => value !== item)))}/></FormControl>
                            <FormLabel className="text-sm font-normal capitalize">{item.replace('-', ' ')}</FormLabel>
                        </FormItem>
                    )} />
                ))}
                </div>
                <FormMessage className="mt-2" />
            </FormItem>
        )} />

        <Separator />
        
        <div>
            <h3 className="text-lg font-medium">Room Types</h3>
            <FormDescription>Define the rooms available in this hotel.</FormDescription>
        </div>

        <div className="space-y-4">
          {roomFields.map((field, index) => (
            <Card key={field.id} className="p-4 bg-muted/30">
                <CardHeader className="flex flex-row items-center justify-between p-0 pb-4">
                     <h4 className="font-semibold">Room Configuration {index + 1}</h4>
                     <Button type="button" variant="ghost" size="icon" onClick={() => removeRoom(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </CardHeader>
                <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField control={form.control} name={`rooms.${index}.type`} render={({ field }) => (
                        <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                        <FormItem><FormLabel>Price/night</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`rooms.${index}.capacity`} render={({ field }) => (
                        <FormItem><FormLabel>Capacity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name={`rooms.${index}.totalRooms`} render={({ field }) => (
                        <FormItem><FormLabel>Total Units</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendRoom({ type: 'Standard', price: 5000, capacity: 2, totalRooms: 10 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Room Type</Button>
        </div>

        <div className="flex items-center justify-start pt-8 border-t">
            <Button type="submit" disabled={isLoading} className="h-14 px-10 rounded-full font-black text-lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Saving Property...' : 'Register Hotel'}
            </Button>
        </div>
      </form>
    </Form>
  );
}