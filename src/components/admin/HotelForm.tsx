'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTransition } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { revalidateAdminPanel, revalidatePublicContent } from '@/app/admin/actions';
import type { Hotel } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { dummyCities } from '@/lib/dummy-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

const hotelFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  city: z.string().min(3, 'City is required.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  rating: z.coerce.number().min(1).max(5),
  amenities: z.string().min(3, 'Please provide at least one amenity.'),
  images: z.array(z.string()).min(1, { message: 'Please select at least one image.' }),
});

type HotelFormValues = z.infer<typeof hotelFormSchema>;

interface HotelFormProps {
  hotel?: Partial<Hotel>;
}

export function HotelForm({ hotel }: HotelFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const defaultValues = {
      name: hotel?.name || '',
      city: hotel?.city || '',
      description: hotel?.description || '',
      rating: hotel?.rating || 4,
      amenities: hotel?.amenities?.join(', ') || 'wifi, restaurant, parking',
      images: hotel?.images || [],
  };

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(hotelFormSchema),
    defaultValues,
    // Reset form if hotel changes (e.g., from add to edit)
    key: hotel?.id || 'new',
  });

  const onSubmit = (data: HotelFormValues) => {
    if (!firestore) return;
    startTransition(async () => {
      try {
        const hotelData = {
          ...data,
          amenities: data.amenities.split(',').map(s => s.trim()).filter(Boolean),
          images: data.images,
        };

        let redirectPath = '/admin';

        if (hotel && hotel.id) {
            // Update existing hotel
            const hotelRef = doc(firestore, 'hotels', hotel.id);
            await updateDoc(hotelRef, hotelData);
            toast({ title: 'Hotel Updated!', description: `${data.name} has been successfully updated.` });
        } else {
            // Create new hotel
            const id = data.name
              .toLowerCase()
              .replace(/&/g, 'and')
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-');
            const hotelRef = doc(firestore, 'hotels', id);
            await setDoc(hotelRef, { ...hotelData, id });
            toast({ title: 'Hotel Details Saved!', description: `Now you can add rooms for ${data.name}.` });
            redirectPath = `/admin/hotels/${id}/edit`;
        }
        
        await revalidateAdminPanel();
        await revalidatePublicContent();
        router.push(redirectPath);

      } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hotel Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. The Grand Palace" {...field} />
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
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A wonderful place to stay..." {...field} />
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
              <FormLabel>Rating (1-5)</FormLabel>
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amenities</FormLabel>
              <FormControl>
                <Input placeholder="wifi, pool, spa" {...field} />
              </FormControl>
               <p className="text-xs text-muted-foreground">Comma-separated values.</p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Image Gallery</FormLabel>
                <FormDescription>
                  Select the images for the hotel gallery from the available list.
                </FormDescription>
              </div>
              <ScrollArea className="h-60 w-full rounded-md border">
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PlaceHolderImages.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="images"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-center space-x-3 space-y-0"
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
                            <FormLabel className="font-normal text-sm flex items-center gap-2">
                               {item.id} <span className="text-xs text-muted-foreground">({item.imageHint})</span>
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => router.push('/admin')}>Cancel</Button>
            <Button type="submit" disabled={isPending || !firestore}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {hotel?.id ? 'Update Hotel' : 'Save and Continue'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
