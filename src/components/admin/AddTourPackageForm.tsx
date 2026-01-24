'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import slugify from 'slugify';
import { useState } from 'react';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const tourImagePlaceholders = PlaceHolderImages.filter(p => p.id.startsWith('tour-'));

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  duration: z.string().min(3, 'Please enter a duration.'),
  price: z.coerce.number().min(1, 'Price must be a positive number.'),
  image: z.string().min(1, 'Please select an image.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  destinations: z.string().min(3, 'Enter at least one destination.'),
});

export function AddTourPackageForm() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      duration: '',
      price: 0,
      image: '',
      description: '',
      destinations: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Firestore not available' });
        return;
    }
    setIsLoading(true);

    const packageId = slugify(values.title, { lower: true, strict: true });
    const destinationsArray = values.destinations.split(',').map(d => d.trim()).filter(d => d);

    try {
        const packageRef = doc(firestore, 'tourPackages', packageId);
        await setDoc(packageRef, {
            id: packageId,
            title: values.title,
            duration: values.duration,
            price: values.price,
            image: values.image,
            description: values.description,
            destinations: destinationsArray,
        });

        toast({
            title: 'Tour Package Added!',
            description: `"${values.title}" has been successfully added.`,
        });
        router.push('/admin/tour-packages');
        router.refresh();
    } catch (error) {
        console.error("Error adding tour package: ", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not add the tour package. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Package Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Amazing Uttarakhand Tour" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField control={form.control} name="duration" render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 6 Nights / 7 Days" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting Price (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 18000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
            )} />
        </div>
        
        <FormField control={form.control} name="destinations" render={({ field }) => (
            <FormItem>
              <FormLabel>Destinations Covered</FormLabel>
              <FormControl>
                <Input placeholder="Haridwar, Mussoorie, Rishikesh" {...field} />
              </FormControl>
              <FormDescription>Enter destinations separated by a comma.</FormDescription>
              <FormMessage />
            </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A short and catchy description of the tour." className="resize-y" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
        )} />

        <FormField control={form.control} name="image" render={({ field }) => (
            <FormItem>
              <FormLabel>Package Image</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a representative image" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tourImagePlaceholders.map(img => (
                    <SelectItem key={img.id} value={img.id}>{img.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Choose from a list of pre-defined placeholder images.</FormDescription>
              <FormMessage />
            </FormItem>
        )} />

        <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Saving...' : 'Add Tour Package'}
        </Button>
      </form>
    </Form>
  );
}
