'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

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
import { getCities } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';
import { generateDescriptionAction } from '@/app/admin/actions';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  city: z.string().min(1, 'City is required.'),
  amenities: z.string().min(3, 'Enter at least one amenity.'),
  keywords: z.string().min(3, 'Enter at least one keyword.'),
  description: z.string(),
});

type HotelFormValues = z.infer<typeof formSchema>;

export function HotelForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const cities = getCities();

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      city: '',
      amenities: '',
      keywords: '',
      description: '',
    },
  });

  const watchedFields = useWatch({ control: form.control });

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
    console.log(data);
    toast({
      title: 'Hotel Submitted!',
      description: 'The new hotel has been added successfully.',
    });
    form.reset();
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
