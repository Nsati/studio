'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTransition, useState } from 'react';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import slugify from 'slugify';

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
import { revalidateAdminPanel } from '@/app/admin/actions';
import type { Hotel } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { generateHotelDescription } from '@/ai/flows/generate-hotel-description';

const hotelFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  city: z.string().min(3, 'City must be at least 3 characters.'),
  rating: z.coerce.number().min(0).max(5),
  amenities: z.string().min(3, 'Please provide at least one amenity.'),
  images: z.string().min(3, 'Please provide at least one image ID.'),
  description: z.string().optional(),
});

type HotelFormValues = z.infer<typeof hotelFormSchema>;

interface HotelFormProps {
  hotel: Hotel | null;
  onFinished: () => void;
}

export function HotelForm({ hotel, onFinished }: HotelFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(hotelFormSchema),
    defaultValues: hotel ? {
        ...hotel,
        amenities: hotel.amenities.join(', '),
        images: hotel.images.join(', '),
    } : {
        name: '',
        city: '',
        rating: 4.5,
        amenities: 'wifi, parking, restaurant',
        images: 'hotel-1-1, hotel-1-2',
        description: '',
    },
  });

  const handleGenerateDescription = async () => {
    const { name, city, amenities } = form.getValues();
    if (!name || !city) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please fill in the Hotel Name and City to generate a description.'
        });
        return;
    }

    setIsGenerating(true);
    try {
        const result = await generateHotelDescription({
            name,
            city,
            amenities,
            keywords: 'luxury, scenic view',
        });
        form.setValue('description', result.description);
        toast({ title: 'Description Generated!', description: 'The AI has written a description for you.' });
    } catch(e: any) {
        toast({ variant: 'destructive', title: 'Generation Failed', description: e.message });
    } finally {
        setIsGenerating(false);
    }
  }

  const onSubmit = (data: HotelFormValues) => {
    if (!firestore) return;

    startTransition(async () => {
      try {
        const hotelData = {
          name: data.name,
          city: data.city,
          description: data.description || '',
          rating: data.rating,
          amenities: data.amenities.split(',').map(s => s.trim().toLowerCase()),
          images: data.images.split(',').map(s => s.trim()),
        };

        if (hotel) {
          // Update existing hotel
          const hotelRef = doc(firestore, 'hotels', hotel.id);
          await updateDoc(hotelRef, hotelData);
          toast({ title: 'Hotel Updated!', description: `${data.name} has been successfully updated.` });
        } else {
          // Create new hotel
          const slug = slugify(data.name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
          const hotelRef = doc(firestore, 'hotels', slug);
          await setDoc(hotelRef, hotelData);
          toast({ title: 'Hotel Created!', description: `${data.name} has been successfully created.` });
        }
        
        await revalidateAdminPanel();
        onFinished();
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Grand Himalayan" {...field} />
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
                  <FormControl>
                    <Input placeholder="e.g., Nainital" {...field} />
                  </FormControl>
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
              <FormLabel className="flex justify-between items-center">
                <span>Description</span>
                <Button type="button" size="sm" variant="ghost" onClick={handleGenerateDescription} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4 text-amber-500" />}
                    Generate with AI
                </Button>
              </FormLabel>
              <FormControl>
                <Textarea placeholder="A wonderful place to stay..." {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" min="0" max="5" {...field} />
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
                    <Input placeholder="wifi, parking, spa" {...field} />
                  </FormControl>
                  <FormDescription>Comma-separated list of amenities.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image IDs</FormLabel>
              <FormControl>
                <Input placeholder="hero, hotel-1-1, hotel-1-2" {...field} />
              </FormControl>
              <FormDescription>Comma-separated list of image IDs from placeholder-images.json.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onFinished}>Cancel</Button>
            <Button type="submit" disabled={isPending || !firestore}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {hotel ? 'Update Hotel' : 'Create Hotel'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
