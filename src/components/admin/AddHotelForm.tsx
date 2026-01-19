'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dummyCities } from '@/lib/dummy-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardHeader } from '../ui/card';


const allAmenities = ['wifi', 'parking', 'restaurant', 'bar', 'spa', 'pool', 'gym', 'mountain-view', 'garden', 'library', 'river-view', 'ghat', 'adventure', 'trekking', 'skiing', 'heritage', 'safari'];
const imageOptions = PlaceHolderImages.filter(img => !img.id.startsWith('city-')).map(img => ({ id: img.id, label: img.description }));


const roomSchema = z.object({
  type: z.enum(['Standard', 'Deluxe', 'Suite']),
  price: z.coerce.number().min(1, 'Price must be positive.'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1.'),
  totalRooms: z.coerce.number().min(1, 'Total rooms must be at least 1.'),
});


const formSchema = z.object({
  name: z.string().min(3, 'Hotel name must be at least 3 characters long.'),
  city: z.string().min(1, 'Please select a city.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  rating: z.coerce.number().min(1).max(5).positive(),
  amenities: z.array(z.string()).min(1, 'Please select at least one amenity.'),
  images: z.array(z.string()).min(1, 'Please select at least one image.'),
  rooms: z.array(roomSchema).min(1, 'Please add at least one room type.'),
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
      rating: 4.5,
      amenities: [],
      images: [],
      rooms: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
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

    try {
        const hotelRef = doc(firestore, 'hotels', hotelId);
        const { rooms, ...hotelData } = values;

        await setDoc(hotelRef, {
            id: hotelId,
            ...hotelData
        });
        
        // Batch write for rooms can be implemented here for atomicity
        for (const room of rooms) {
            const roomId = slugify(`${values.name} ${room.type}`, { lower: true, strict: true });
            const roomRef = doc(firestore, 'hotels', hotelId, 'rooms', roomId);
            await setDoc(roomRef, {
                id: roomId,
                hotelId: hotelId,
                ...room,
                availableRooms: room.totalRooms, // Initially, all rooms are available
            });
        }

        toast({
            title: 'Hotel Added!',
            description: `${values.name} and its rooms have been successfully added.`,
        });

        router.push('/admin/hotels');
        router.refresh();

    } catch (error) {
        console.error('Error adding hotel: ', error);
        toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'There was a problem saving the hotel.',
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Hotel Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. The Grand Himalayan" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {dummyCities.map(city => (
                            <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about this wonderful hotel"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
        control={form.control}
        name="rating"
        render={({ field }) => (
            <FormItem>
            <FormLabel>Rating</FormLabel>
            <FormControl>
                <Input type="number" step="0.1" min="1" max="5" {...field} />
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
        />

        <FormField
            control={form.control}
            name="amenities"
            render={() => (
                <FormItem>
                    <div className="mb-4">
                        <FormLabel className="text-base">Amenities</FormLabel>
                        <FormDescription>
                        Select all amenities that apply.
                        </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2 border rounded-md">
                    {allAmenities.map((item) => (
                        <FormField
                        key={item}
                        control={form.control}
                        name="amenities"
                        render={({ field }) => {
                            return (
                            <FormItem
                                key={item}
                                className="flex flex-row items-start space-x-3 space-y-0"
                            >
                                <FormControl>
                                <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                    return checked
                                        ? field.onChange([...field.value, item])
                                        : field.onChange(
                                            field.value?.filter(
                                                (value) => value !== item
                                            )
                                            )
                                    }}
                                />
                                </FormControl>
                                <FormLabel className="text-sm font-normal capitalize">
                                    {item}
                                </FormLabel>
                            </FormItem>
                            )
                        }}
                        />
                    ))}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />

         <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
                <FormItem>
                    <div className="mb-4">
                        <FormLabel className="text-base">Images</FormLabel>
                        <FormDescription>
                        Select the images that best represent the hotel.
                        </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2 border rounded-md">
                    {imageOptions.map((item) => (
                        <FormField
                        key={item.id}
                        control={form.control}
                        name="images"
                        render={({ field }) => {
                            return (
                            <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                            >
                                <FormControl>
                                <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                    return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                                (value) => value !== item.id
                                            )
                                            )
                                    }}
                                />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                    {item.label}
                                </FormLabel>
                            </FormItem>
                            )
                        }}
                        />
                    ))}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
            />

        <Separator />
        
        <div>
            <h3 className="text-lg font-medium">Room Types</h3>
            <FormDescription>
              Add the different types of rooms available in this hotel.
            </FormDescription>
            <FormField
              control={form.control}
              name="rooms"
              render={() => (
                <FormItem>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="p-4">
                <CardHeader className="flex flex-row items-center justify-between p-0 pb-4">
                     <h4 className="font-semibold">Room Type {index + 1}</h4>
                     <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                     </Button>
                </CardHeader>
                <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                    control={form.control}
                    name={`rooms.${index}.type`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a type" />
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
                    name={`rooms.${index}.price`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Price / night</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g. 5000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name={`rooms.${index}.capacity`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g. 2" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                    control={form.control}
                    name={`rooms.${index}.totalRooms`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Total Units</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g. 10" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </CardContent>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ type: 'Standard', price: 5000, capacity: 2, totalRooms: 10 })}
          >
            Add Room Type
          </Button>
        </div>


        <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Saving...' : 'Add Hotel'}
        </Button>
      </form>
    </Form>
  );
}
