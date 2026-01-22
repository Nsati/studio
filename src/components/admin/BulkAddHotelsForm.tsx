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

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dummyCities } from '@/lib/dummy-data';
import { Loader2, Trash2, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const hotelSchema = z.object({
  name: z.string().min(3, 'Name is too short'),
  city: z.string().min(1, 'Select a city'),
  description: z.string().min(10, 'Description is too short'),
  rating: z.coerce.number().min(1).max(5),
  amenities: z.string().min(3, 'Add at least one amenity'),
  images: z.string().min(10, 'Add at least one image URL'),
});

const formSchema = z.object({
  hotels: z.array(hotelSchema).min(1, 'Please add at least one hotel.'),
});

export function BulkAddHotelsForm() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hotels: [{ name: '', city: '', description: '', rating: 4, amenities: 'wifi, parking', images: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'hotels',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Firestore not available' });
        return;
    }

    setIsLoading(true);
    const batch = writeBatch(firestore);

    try {
        for (const hotel of values.hotels) {
            // Basic URL validation
            const imageUrls = hotel.images.split(',').map(url => url.trim()).filter(url => url);
            if (imageUrls.length === 0) {
              throw new Error(`No images provided for ${hotel.name}`);
            }
            for (const url of imageUrls) {
              try {
                new URL(url);
              } catch (_) {
                throw new Error(`Invalid URL found for ${hotel.name}: ${url}`);
              }
            }

            const hotelId = slugify(hotel.name, { lower: true, strict: true });
            const hotelRef = doc(firestore, 'hotels', hotelId);

            const amenitiesArray = hotel.amenities.split(',').map(a => a.trim().toLowerCase()).filter(Boolean);

            batch.set(hotelRef, {
                id: hotelId,
                name: hotel.name,
                city: hotel.city,
                description: hotel.description,
                rating: hotel.rating,
                amenities: amenitiesArray,
                images: imageUrls,
            });
        }

        await batch.commit();

        toast({
            title: 'Hotels Added!',
            description: `${values.hotels.length} hotels have been successfully added.`,
        });
        router.push('/admin/hotels');
        router.refresh();

    } catch (error: any) {
        console.error("Error bulk adding hotels: ", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Could not add the hotels. Please check the data and try again.',
        });
    } finally {
        setIsLoading(false);
    }
  }

  const addNewRow = () => {
    append({ name: '', city: '', description: '', rating: 4, amenities: 'wifi, parking', images: '' });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="w-full overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[200px] font-semibold">Name</TableHead>
                        <TableHead className="min-w-[150px] font-semibold">City</TableHead>
                        <TableHead className="min-w-[250px] font-semibold">Description</TableHead>
                        <TableHead className="min-w-[100px] font-semibold">Rating</TableHead>
                        <TableHead className="min-w-[200px] font-semibold">Amenities (CSV)</TableHead>
                        <TableHead className="min-w-[250px] font-semibold">Images (CSV)</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fields.map((field, index) => (
                        <TableRow key={field.id} className="align-top">
                            <TableCell className="p-2">
                                <FormField control={form.control} name={`hotels.${index}.name`} render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="Hotel Name" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </TableCell>
                            <TableCell className="p-2">
                                 <FormField control={form.control} name={`hotels.${index}.city`} render={({ field }) => (
                                    <FormItem>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger></FormControl>
                                            <SelectContent>{dummyCities.map(city => (<SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>))}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </TableCell>
                             <TableCell className="p-2">
                                <FormField control={form.control} name={`hotels.${index}.description`} render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="Short description" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </TableCell>
                            <TableCell className="p-2">
                                <FormField control={form.control} name={`hotels.${index}.rating`} render={({ field }) => (
                                    <FormItem><FormControl><Input type="number" step="0.1" min="1" max="5" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </TableCell>
                            <TableCell className="p-2">
                                <FormField control={form.control} name={`hotels.${index}.amenities`} render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="wifi, pool, spa" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </TableCell>
                            <TableCell className="p-2">
                                <FormField control={form.control} name={`hotels.${index}.images`} render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="https://.../img1.jpg, https://.../img2.jpg" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </TableCell>
                            <TableCell className="p-2 text-right">
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>

        <div className="flex items-center gap-4">
             <Button type="button" variant="outline" onClick={addNewRow}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Row
             </Button>
        </div>

        <div className="flex items-center justify-end border-t pt-6">
            <Button type="submit" disabled={isLoading} size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Saving...' : `Save ${fields.length} Hotels`}
            </Button>
        </div>
      </form>
    </Form>
  );
}
