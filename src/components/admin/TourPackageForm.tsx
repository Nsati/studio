
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { useFirestore, type WithId } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import slugify from 'slugify';
import { useState, useEffect } from 'react';
import type { TourPackage } from '@/lib/types';

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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, Trash2, MapPin, Hotel, Calendar, Clock, ListChecks, ShieldCheck, IndianRupee } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '../ui/separator';

const tourImagePlaceholders = PlaceHolderImages.filter(p => p.id.startsWith('tour-') || p.id === 'hero');

const itinerarySchema = z.object({
  day: z.number(),
  title: z.string().min(5, 'Title required'),
  description: z.string().min(10, 'Description required'),
  distance: z.string().optional(),
  travelTime: z.string().optional(),
});

const hotelDetailSchema = z.object({
  city: z.string().min(2, 'City required'),
  hotelName: z.string().min(2, 'Hotel name required'),
  category: z.string(),
  roomType: z.string(),
  mealPlan: z.string(),
});

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  duration: z.string().min(3, 'e.g. 5N/6D'),
  price: z.coerce.number().min(1),
  gst: z.coerce.number().default(5),
  image: z.string().min(1),
  description: z.string().min(20),
  destinations: z.string().min(3),
  persons: z.coerce.number().min(1),
  rooms: z.coerce.number().min(1),
  cabType: z.string().min(2),
  itinerary: z.array(itinerarySchema).min(1),
  hotels: z.array(hotelDetailSchema).optional(),
  inclusions: z.string().describe('Comma separated'),
  exclusions: z.string().describe('Comma separated'),
  policies: z.object({
    tcs: z.string().min(10),
    cancellation: z.string().min(10),
    payment: z.string().min(10),
    terms: z.string().min(10),
  }),
});

type TourPackageFormProps = {
  initialData?: WithId<TourPackage>;
};

export function TourPackageForm({ initialData }: TourPackageFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      destinations: initialData.destinations.join(', '),
      inclusions: initialData.inclusions.join(', '),
      exclusions: initialData.exclusions.join(', '),
    } : {
      title: '',
      duration: '',
      price: 0,
      gst: 5,
      image: '',
      description: '',
      destinations: '',
      persons: 2,
      rooms: 1,
      cabType: 'Sedan (Swift Dzire)',
      itinerary: [{ day: 1, title: '', description: '', distance: '', travelTime: '' }],
      hotels: [{ city: '', hotelName: '', category: '3 Star', roomType: 'Standard', mealPlan: 'Breakfast Only' }],
      inclusions: 'Stay, Breakfast, Cab, Driver, Fuel, Toll Tax',
      exclusions: 'Lunch, Dinner, Entry Tickets, Any personal expense',
      policies: {
        tcs: '5% TCS extra as per govt norms.',
        cancellation: '30 days before: 10% charge. 15 days before: 50% charge.',
        payment: '25% advance to book. Balance 7 days before travel.',
        terms: 'Rooms are subject to availability. ID proof is mandatory.',
      }
    },
  });

  const { fields: itineraryFields, append: appendDay, remove: removeDay } = useFieldArray({
    control: form.control,
    name: 'itinerary',
  });

  const { fields: hotelFields, append: appendHotel, remove: removeHotel } = useFieldArray({
    control: form.control,
    name: 'hotels',
  });

  const basePrice = form.watch('price');
  const gstPercent = form.watch('gst');
  const totalCost = basePrice + (basePrice * (gstPercent / 100));

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    setIsLoading(true);

    const destinationsArray = values.destinations.split(',').map(d => d.trim()).filter(Boolean);
    const inclusionsArray = values.inclusions.split(',').map(i => i.trim()).filter(Boolean);
    const exclusionsArray = values.exclusions.split(',').map(e => e.trim()).filter(Boolean);

    const finalData = {
      ...values,
      destinations: destinationsArray,
      inclusions: inclusionsArray,
      exclusions: exclusionsArray,
      totalCost,
    };

    try {
      const packageId = isEditing ? initialData.id : slugify(values.title, { lower: true, strict: true });
      const packageRef = doc(firestore, 'tourPackages', packageId);
      
      if (isEditing) {
        await updateDoc(packageRef, finalData);
      } else {
        await setDoc(packageRef, finalData);
      }

      toast({ title: isEditing ? 'Package Updated' : 'Package Created', description: `"${values.title}" has been saved.` });
      router.push('/admin/tour-packages');
      router.refresh();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto gap-2 bg-muted/50 p-1 mb-8">
            <TabsTrigger value="general" className="py-3">General Info</TabsTrigger>
            <TabsTrigger value="itinerary" className="py-3">Itinerary</TabsTrigger>
            <TabsTrigger value="hotels" className="py-3">Hotels</TabsTrigger>
            <TabsTrigger value="pricing" className="py-3">Pricing & Inclusions</TabsTrigger>
            <TabsTrigger value="policies" className="py-3">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-xl">Basic Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Package Title</FormLabel><FormControl><Input placeholder="e.g. Best of Nainital & Mussoorie" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="duration" render={({ field }) => (
                    <FormItem><FormLabel>Duration (N/D)</FormLabel><FormControl><Input placeholder="e.g. 5N/6D" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="destinations" render={({ field }) => (
                    <FormItem><FormLabel>Destinations</FormLabel><FormControl><Input placeholder="Nainital, Mussoorie, Corbett" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <FormField control={form.control} name="persons" render={({ field }) => (
                    <FormItem><FormLabel>Persons</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="rooms" render={({ field }) => (
                    <FormItem><FormLabel>Rooms</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="cabType" render={({ field }) => (
                    <FormItem><FormLabel>Cab Type</FormLabel><FormControl><Input placeholder="e.g. Swift Dzire" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="image" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select image" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {tourImagePlaceholders.map(img => <SelectItem key={img.id} value={img.id}>{img.description}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Overview</FormLabel><FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="itinerary" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Day-wise Plan</h3>
              <Button type="button" variant="outline" onClick={() => appendDay({ day: itineraryFields.length + 1, title: '', description: '', distance: '', travelTime: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Day
              </Button>
            </div>
            {itineraryFields.map((field, index) => (
              <Card key={field.id} className="relative">
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeDay(index)}><Trash2 className="h-4 w-4" /></Button>
                <CardHeader><CardTitle className="text-lg">Day {index + 1}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                   <FormField control={form.control} name={`itinerary.${index}.title`} render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Arrival and sightseeing" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name={`itinerary.${index}.distance`} render={({ field }) => (
                      <FormItem><FormLabel>Distance (km)</FormLabel><FormControl><Input placeholder="150 km" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`itinerary.${index}.travelTime`} render={({ field }) => (
                      <FormItem><FormLabel>Travel Time</FormLabel><FormControl><Input placeholder="4-5 hours" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                   <FormField control={form.control} name={`itinerary.${index}.description`} render={({ field }) => (
                    <FormItem><FormLabel>What happens today?</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="hotels" className="space-y-6">
             <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Stay Details</h3>
              <Button type="button" variant="outline" onClick={() => appendHotel({ city: '', hotelName: '', category: '3 Star', roomType: 'Standard', mealPlan: 'Breakfast Only' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add City Stay
              </Button>
            </div>
            {hotelFields.map((field, index) => (
               <Card key={field.id} className="relative">
                 <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeHotel(index)}><Trash2 className="h-4 w-4" /></Button>
                 <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`hotels.${index}.city`} render={({ field }) => (
                      <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`hotels.${index}.hotelName`} render={({ field }) => (
                      <FormItem><FormLabel>Hotel Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`hotels.${index}.category`} render={({ field }) => (
                      <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`hotels.${index}.roomType`} render={({ field }) => (
                      <FormItem><FormLabel>Room Type</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                 </CardContent>
               </Card>
            ))}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Pricing Strategy</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Base Price (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="gst" render={({ field }) => (
                    <FormItem><FormLabel>GST (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="bg-primary/5 p-6 rounded-lg border border-primary/20 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase">Estimated Final Cost</p>
                    <h4 className="text-3xl font-black text-primary">₹{totalCost.toLocaleString()}</h4>
                  </div>
                  <IndianRupee className="h-10 w-10 text-primary opacity-20" />
                </div>
                <Separator />
                <FormField control={form.control} name="inclusions" render={({ field }) => (
                  <FormItem><FormLabel>Inclusions (Comma separated)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="exclusions" render={({ field }) => (
                  <FormItem><FormLabel>Exclusions (Comma separated)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Legal & Policies</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="policies.tcs" render={({ field }) => (
                  <FormItem><FormLabel>TCS Policy</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="policies.cancellation" render={({ field }) => (
                  <FormItem><FormLabel>Cancellation Policy</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="policies.payment" render={({ field }) => (
                  <FormItem><FormLabel>Payment Policy</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="policies.terms" render={({ field }) => (
                  <FormItem><FormLabel>Terms & Conditions</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                )} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50 flex justify-center">
            <Button type="submit" disabled={isLoading} size="lg" className="w-full max-w-xl h-14 rounded-full font-black text-lg">
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                {isEditing ? 'Update Full Package' : 'Save Full Package'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
