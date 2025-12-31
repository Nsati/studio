'use client';

import { useForm, useWatch, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
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
import { getCities, addHotel } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Upload, PlusCircle, Trash2 } from 'lucide-react';
import { generateDescriptionAction } from '@/app/admin/actions';
import { Badge } from '@/components/ui/badge';
import type { Room } from '@/lib/types';

const roomSchema = z.object({
    id: z.string().optional(), // for existing rooms
    type: z.enum(['Standard', 'Deluxe', 'Suite']),
    price: z.coerce.number().min(1, 'Price must be greater than 0.'),
    capacity: z.coerce.number().min(1, 'Capacity must be at least 1.'),
    totalRooms: z.coerce.number().min(1, 'Enter number of rooms.'),
  });

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  city: z.string().min(1, 'City is required.'),
  rating: z.coerce.number().min(1, 'Rating must be between 1 and 5.').max(5, 'Rating must be between 1 and 5.'),
  amenities: z.string().min(3, 'Enter at least one amenity.'),
  keywords: z.string().min(3, 'Enter at least one keyword.'),
  description: z.string().min(10, 'Description is required.'),
  images: z.any().optional(),
  rooms: z.array(roomSchema).min(1, 'Please add at least one room type.'),
});

type HotelFormValues = z.infer<typeof formSchema>;

export function HotelForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const cities = getCities();
  const router = useRouter();

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      city: '',
      rating: 4.0,
      amenities: '',
      keywords: '',
      description: '',
      rooms: [
        { type: 'Standard', price: 0, capacity: 2, totalRooms: 10 },
      ]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rooms"
  });

  const watchedImages = useWatch({ control: form.control, name: 'images' });

  const handleGenerateDescription = async () => {
    const { name, city, amenities, keywords } = form.getValues();
    if (!name || !city || !amenities || !keywords) {
      toast({
        title: 'Missing Information',
        description:
          'Please fill in Name, City, Amenities, and Keywords to generate a description.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateDescriptionAction({
        name,
        city,
        amenities,
        keywords,
      });
      if (result.description) {
        form.setValue('description', result.description, { shouldValidate: true });
        toast({
          title: 'Description Generated!',
          description: 'The AI-powered description has been added.',
        });
      } else {
        throw new Error('No description returned.');
      }
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Could not generate a description. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  function onSubmit(data: HotelFormValues) {
    try {
        const amenitiesArray = data.amenities.split(',').map(s => s.trim());
        
        // This is a mock implementation. In a real app, you would handle
        // file uploads to a server and get back URLs. Here we'll just
        // use a placeholder.
        const imageIds = ['hotel-new-1', 'hotel-new-2'];

        const newRooms: Room[] = data.rooms.map((room, index) => ({
            ...room,
            id: `r-new-${Date.now()}-${index}`,
        }))

        addHotel({
            name: data.name,
            city: data.city,
            description: data.description,
            images: imageIds, 
            amenities: amenitiesArray,
            rating: data.rating,
            rooms: newRooms
        });

        toast({
            title: 'Hotel Added!',
            description: `${data.name} has been successfully added.`,
        });
        
        form.reset();
        // Refresh the page or navigate to show the new hotel
        router.refresh();

    } catch (error) {
        toast({
            title: 'Failed to Add Hotel',
            description: 'Something went wrong. Please try again.',
            variant: 'destructive',
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
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
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="1" max="5" placeholder="e.g., 4.5" {...field} />
                </FormControl>
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
              <FormLabel>Hotel Images</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                    <Input
                        id="images"
                        type="file"
                        multiple
                        onChange={(e) => field.onChange(e.target.files)}
                        className="hidden"
                    />
                    <label htmlFor="images" className="flex items-center gap-2 cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md text-sm">
                        <Upload className="h-4 w-4" />
                        Choose Files
                    </label>
                </div>
              </FormControl>
              {watchedImages && watchedImages.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {Array.from(watchedImages).map((file: any, index: number) => (
                        <Badge key={index} variant="secondary">{file.name}</Badge>
                    ))}
                </div>
              )}
              <FormDescription>
                Upload one or more images for the hotel. This is currently a mock and won't save images.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
            <FormLabel>Room Types</FormLabel>
            <FormDescription className="mb-4">
                Define the rooms available at this hotel.
            </FormDescription>
            <div className="space-y-4">
            {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-9 gap-4 items-start border p-4 rounded-md relative">
                    <FormField
                        control={form.control}
                        name={`rooms.${index}.type`}
                        render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Room Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
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
                        <FormItem className="md:col-span-2">
                            <FormLabel>Price/night (₹)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="5000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name={`rooms.${index}.capacity`}
                        render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Capacity</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="2" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`rooms.${index}.totalRooms`}
                        render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Total Rooms</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="10" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="md:col-span-1 flex items-end h-full">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={fields.length <= 1}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove Room</span>
                        </Button>
                    </div>
                </div>
            ))}
             <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ type: 'Standard', price: 0, capacity: 2, totalRooms: 5 })}
                className="mt-2"
                >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Room Type
            </Button>
            <FormMessage>{form.formState.errors.rooms?.message}</FormMessage>
            </div>
        </div>

        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amenities</FormLabel>
              <FormControl>
                <Input placeholder="wifi, spa, pool, restaurant" {...field} />
              </FormControl>
              <FormDescription>
                Comma-separated list of amenities.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keywords</FormLabel>
              <FormControl>
                <Input placeholder="luxury, family-friendly, mountain view" {...field} />
              </FormControl>
              <FormDescription>
                Comma-separated list of keywords for AI generation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Description</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </Button>
              </div>
              <FormControl>
                <Textarea
                  placeholder="A stunning hotel nestled in the heart of..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add Hotel</Button>
      </form>
    </Form>
  );
}
