'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';

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
import {
  getCities,
  addHotel,
  updateHotel,
} from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, PlusCircle, Trash2 } from 'lucide-react';
import type { Room, Hotel } from '@/lib/types';
import Image from 'next/image';

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
  rating: z.coerce
    .number()
    .min(1, 'Rating must be between 1 and 5.')
    .max(5, 'Rating must be between 1 and 5.'),
  amenities: z.string().min(3, 'Enter at least one amenity.'),
  description: z.string().min(10, 'Description is required.'),
  images: z
    .any()
    .refine(
      files => files?.length > 0,
      'At least one image is required.'
    ),
  rooms: z.array(roomSchema).min(1, 'Please add at least one room type.'),
});

type HotelFormValues = z.infer<typeof formSchema>;

interface HotelFormProps {
  hotelToEdit?: Hotel;
  onFormSubmit?: () => void;
}

export function HotelForm({ hotelToEdit, onFormSubmit }: HotelFormProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { toast } = useToast();
  const cities = getCities();
  const isEditMode = !!hotelToEdit;

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      city: '',
      rating: 4.0,
      amenities: '',
      description: '',
      images: undefined,
      rooms: [{ type: 'Standard', price: 0, capacity: 2, totalRooms: 10 }],
    },
  });

  useEffect(() => {
    if (isEditMode) {
      form.reset({
        name: hotelToEdit.name,
        city: hotelToEdit.city,
        rating: hotelToEdit.rating,
        amenities: hotelToEdit.amenities.join(', '),
        description: hotelToEdit.description,
        rooms: hotelToEdit.rooms,
        // For images, we can't pre-populate the file input.
        // We'll just require them to be re-uploaded on edit.
        images: undefined,
      });
    }
  }, [isEditMode, hotelToEdit, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rooms',
  });

  function onSubmit(data: HotelFormValues) {
    const amenitiesArray = data.amenities.split(',').map(s => s.trim());
    
    // In a real app, image handling would be more robust.
    // Here we create new IDs/placeholders for simplicity.
    const imageIds = Array.from(data.images as FileList).map(
      (file: any, index: number) => {
        return `new-hotel-${Date.now()}-${index}`;
      }
    );

    if (isEditMode) {
        const updatedRooms: Room[] = data.rooms.map((room, index) => ({
            ...room,
            id: room.id || `r-updated-${Date.now()}-${index}`,
            hotelId: hotelToEdit.id
        }));

      updateHotel(hotelToEdit.id, {
        ...hotelToEdit,
        name: data.name,
        city: data.city,
        description: data.description,
        // On edit, we replace images. A real app might allow managing existing images.
        images: imageIds, 
        amenities: amenitiesArray,
        rating: data.rating,
        rooms: updatedRooms,
      });
      toast({
        title: 'Hotel Updated!',
        description: `${data.name} has been successfully updated.`,
      });
    } else {
        const newRooms: Room[] = data.rooms.map((room, index) => ({
            ...room,
            id: `r-new-${Date.now()}-${index}`,
            hotelId: '', // This will be set by addHotel
        }));
      addHotel({
        name: data.name,
        city: data.city,
        description: data.description,
        images: imageIds,
        amenities: amenitiesArray,
        rating: data.rating,
        rooms: newRooms,
      });
      toast({
        title: 'Hotel Added!',
        description: `${data.name} has been successfully added.`,
      });
    }

    form.reset();
    setImagePreviews([]);
    if (onFormSubmit) {
      onFormSubmit();
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      form.setValue('images', files);
      const fileArray = Array.from(files);
      const previews = fileArray.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities.map(city => (
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
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="e.g., 4.5"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <FormLabel>Hotel Images</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="images"
                    className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-secondary/80"
                  >
                    <Upload className="h-4 w-4" />
                    Choose Files
                  </label>
                </div>
              </FormControl>
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4 md:grid-cols-5">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square w-full overflow-hidden rounded-md"
                    >
                      <Image
                        src={preview}
                        alt={`Preview ${index}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              <FormDescription>
                {isEditMode
                  ? 'Re-upload images to replace existing ones.'
                  : 'Upload one or more images for the hotel.'}
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
              <div
                key={field.id}
                className="relative grid grid-cols-1 items-start gap-4 border p-4 rounded-md md:grid-cols-9"
              >
                <FormField
                  control={form.control}
                  name={`rooms.${index}.type`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Room Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
                <div className="flex h-full items-end md:col-span-1">
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
              onClick={() =>
                append({ type: 'Standard', price: 0, capacity: 2, totalRooms: 5 })
              }
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Description</FormLabel>
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
        <Button type="submit">
          {isEditMode ? 'Update Hotel' : 'Add Hotel'}
        </Button>
      </form>
    </Form>
  );
}
