'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTransition } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

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
import { revalidateAdminPanel, revalidatePublicContent } from '@/app/admin/actions';
import type { City } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const cityFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  image: z.string().min(3, 'Image ID is required.'),
});

type CityFormValues = z.infer<typeof cityFormSchema>;

interface CityFormProps {
  city?: City;
  onFinished: () => void;
}

export function CityForm({ city, onFinished }: CityFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();

  const defaultValues = city ? {
      ...city,
  } : {
      name: '',
      image: '',
  };

  const form = useForm<CityFormValues>({
    resolver: zodResolver(cityFormSchema),
    defaultValues,
  });

  const onSubmit = (data: CityFormValues) => {
    if (!firestore) return;
    startTransition(async () => {
      try {
        const cityData = {
          name: data.name,
          image: data.image,
        };

        const id = city?.id || data.name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        const cityRef = doc(firestore, 'cities', id);

        if (city && city.id) {
            await updateDoc(cityRef, cityData);
            toast({ title: 'City Updated!', description: `${data.name} has been successfully updated.` });
        } else {
            await setDoc(cityRef, { ...cityData, id });
            toast({ title: 'City Added!', description: `${data.name} has been successfully added.` });
        }
        
        await revalidateAdminPanel();
        await revalidatePublicContent();
        onFinished();
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Nainital" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g. city-nainital" {...field} />
              </FormControl>
               <p className="text-xs text-muted-foreground">ID from placeholder-images.json.</p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onFinished}>Cancel</Button>
            <Button type="submit" disabled={isPending || !firestore}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {city ? 'Update City' : 'Create City'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
