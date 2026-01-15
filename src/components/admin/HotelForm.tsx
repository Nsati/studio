'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { addHotelAction, updateHotelAction } from '@/app/admin/actions';
import type { Hotel } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getCities } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Trash2, PlusCircle, Loader2 } from 'lucide-react';

const roomSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['Standard', 'Deluxe', 'Suite']),
  price: z.coerce.number().min(1),
  capacity: z.coerce.number().min(1),
  totalRooms: z.coerce.number().min(1),
});

const hotelFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  city: z.string().min(1, 'Please select a city.'),
  description: z.string().min(10, 'Description is too short.'),
  amenities: z.string().min(1, 'Please list at least one amenity.'),
  rooms: z.array(roomSchema).min(1, 'At least one room type is required.'),
});

type HotelFormValues = z.infer<typeof hotelFormSchema>;

interface HotelFormProps {
  hotel?: Hotel | null;
  onFinished: () => void;
}

export function HotelForm({ hotel, onFinished }: HotelFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const cities = getCities();

  const defaultValues: Partial<HotelFormValues> = {
    name: hotel?.name ?? '',
    city: hotel?.city ?? '',
    description: hotel?.description ?? '',
    amenities: hotel?.amenities?.join(', ') ?? '',
    rooms: hotel?.rooms ?? [{ type: 'Standard', price: 5000, capacity: 2, totalRooms: 10 }],
  };

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(hotelFormSchema),
    defaultValues,
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rooms"
  });


  const onSubmit = (data: HotelFormValues) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('city', data.city);
    formData.append('description', data.description);
    formData.append('amenities', data.amenities);
    formData.append('rooms', JSON.stringify(data.rooms));

    if (hotel) {
        formData.append('images', hotel.images.join(','));
        formData.append('rating', String(hotel.rating));
    }


    startTransition(async () => {
      if (hotel) {
        await updateHotelAction(hotel.id, formData);
        toast({ title: 'Hotel Updated!', description: `${data.name} has been successfully updated.` });
      } else {
        await addHotelAction(formData);
        toast({ title: 'Hotel Added!', description: `${data.name} has been successfully created.` });
      }
      onFinished();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hotel Name</FormLabel>
                <FormControl>
                  <Input placeholder="The Grand Himalaya" {...field} />
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
                    {cities.map(city => (
                      <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
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
                <Textarea placeholder="A beautiful hotel..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amenities (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="wifi, pool, spa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Card>
            <CardHeader>
                <CardTitle>Room Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border p-4 rounded-md relative">
                         <FormField
                            control={form.control}
                            name={`rooms.${index}.type`}
                            render={({ field }) => (
                                <FormItem className="md:col-span-1">
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                                <FormLabel>Price/night</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
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
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`rooms.${index}.totalRooms`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Total Rooms</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="absolute -top-3 -right-3 h-7 w-7">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                 <Button type="button" variant="outline" onClick={() => append({ type: 'Standard', price: 0, capacity: 1, totalRooms: 1 })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Room Type
                </Button>
                 {form.formState.errors.rooms && <p className="text-sm font-medium text-destructive">{form.formState.errors.rooms.message}</p>}
            </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {hotel ? 'Update Hotel' : 'Add Hotel'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
