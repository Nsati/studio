'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useFirestore, type WithId } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import slugify from 'slugify';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { TourPackage } from '@/lib/types';
import { saveTourPackageAction, deleteTourPackageAction } from '@/app/admin/tour-packages/actions';

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
import { Loader2, PlusCircle, Trash2, MapPin, IndianRupee, ShieldCheck, ImageIcon } from 'lucide-react';
import { Separator } from '../ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  image: z.string().min(1, 'Image URL required'),
  description: z.string().min(20),
  destinations: z.string().min(3),
  persons: z.coerce.number().min(1),
  rooms: z.coerce.number().min(1),
  cabType: z.string().min(2),
  travelDate: z.string().optional(),
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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
  const imageUrl = form.watch('image');
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const calculated = basePrice + (basePrice * (gstPercent / 100));
    setTotalCost(calculated);
  }, [basePrice, gstPercent]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
      const result = await saveTourPackageAction(packageId, finalData);

      if (result.success) {
          toast({ 
            title: isEditing ? 'Package Synchronized' : 'Package Created', 
            description: `"${values.title}" has been successfully pushed to the live site.` 
          });
          router.push('/admin/tour-packages');
          router.refresh();
      } else {
          throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Action Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!initialData) return;
    setIsDeleting(true);
    try {
      const res = await deleteTourPackageAction(initialData.id);
      if (res.success) {
        toast({ title: 'Removed', description: res.message });
        router.push('/admin/tour-packages');
        router.refresh();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: res.message });
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Critical Failure', description: e.message });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto gap-2 bg-muted/50 p-1 mb-8">
            <TabsTrigger value="general" className="py-3 font-bold">General Info</TabsTrigger>
            <TabsTrigger value="itinerary" className="py-3 font-bold">Itinerary</TabsTrigger>
            <TabsTrigger value="hotels" className="py-3 font-bold">Hotels</TabsTrigger>
            <TabsTrigger value="pricing" className="py-3 font-bold">Pricing</TabsTrigger>
            <TabsTrigger value="policies" className="py-3 font-bold">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="rounded-none border-border">
              <CardHeader className="bg-muted/10 border-b"><CardTitle className="text-xl font-black">Basic Package Details</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Package Name</FormLabel><FormControl><Input placeholder="e.g. Best of Nainital & Mussoorie" {...field} className="rounded-none h-12" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="duration" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Duration (Nights/Days)</FormLabel><FormControl><Input placeholder="e.g. 5N/6D" {...field} className="rounded-none h-12" /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="destinations" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Destinations (Comma Separated)</FormLabel><FormControl><Input placeholder="Nainital, Mussoorie, Corbett" {...field} className="rounded-none h-12" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <FormField control={form.control} name="persons" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Persons</FormLabel><FormControl><Input type="number" {...field} className="rounded-none h-12" /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="rooms" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rooms</FormLabel><FormControl><Input type="number" {...field} className="rounded-none h-12" /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="cabType" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cab Type</FormLabel><FormControl><Input placeholder="e.g. Swift Dzire" {...field} className="rounded-none h-12" /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="travelDate" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Travel Date</FormLabel><FormControl><Input type="date" {...field} className="rounded-none h-12" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <Separator />
                
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-black uppercase tracking-widest">Expedition Visual</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <FormField control={form.control} name="image" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Direct Image URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Paste image URL (Pexels, Unsplash, etc.)" {...field} className="rounded-none h-12" />
                                    </FormControl>
                                    <FormDescription className="text-[9px] font-bold">
                                        Paste a direct link to a high-resolution image.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live Visual Preview</label>
                            <div className="relative aspect-video w-full border-2 border-dashed border-black/10 rounded-sm overflow-hidden bg-muted flex items-center justify-center">
                                {imageUrl && imageUrl.startsWith('http') ? (
                                    <Image 
                                        src={imageUrl} 
                                        alt="Preview" 
                                        fill 
                                        unoptimized={true}
                                        className="object-cover"
                                        onError={() => toast({ variant: 'destructive', title: 'Image Load Error', description: 'The provided URL is not a direct image link.' })}
                                    />
                                ) : (
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">No Valid URL Set</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Overview Description</FormLabel><FormControl><Textarea className="min-h-[150px] rounded-none" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="itinerary" className="space-y-6">
            <div className="flex justify-between items-center bg-muted/20 p-4 border">
              <h3 className="text-xl font-black">Day-wise Planning</h3>
              <Button type="button" variant="outline" className="rounded-none border-primary text-primary font-bold" onClick={() => appendDay({ day: itineraryFields.length + 1, title: '', description: '', distance: '', travelTime: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Next Day
              </Button>
            </div>
            {itineraryFields.map((field, index) => (
              <Card key={field.id} className="relative rounded-none border-border">
                <Button type="button" variant="ghost" size="icon" className="absolute top-4 right-4 text-destructive" onClick={() => removeDay(index)}><Trash2 className="h-4 w-4" /></Button>
                <CardHeader className="bg-muted/5"><CardTitle className="text-lg font-black uppercase tracking-widest">Day {index + 1}</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-6">
                   <FormField control={form.control} name={`itinerary.${index}.title`} render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Activity Title</FormLabel><FormControl><Input placeholder="e.g. Arrival in Nainital & Local Sightseeing" {...field} className="rounded-none h-12" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name={`itinerary.${index}.distance`} render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Approx. Distance (km)</FormLabel><FormControl><Input placeholder="e.g. 150 km" {...field} className="rounded-none h-12" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`itinerary.${index}.travelTime`} render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Travel Time (hours)</FormLabel><FormControl><Input placeholder="e.g. 4-5 hours" {...field} className="rounded-none h-12" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                   <FormField control={form.control} name={`itinerary.${index}.description`} render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Daily Activity Log</FormLabel><FormControl><Textarea className="rounded-none min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="hotels" className="space-y-6">
             <div className="flex justify-between items-center bg-muted/20 p-4 border">
              <h3 className="text-xl font-black">Stay Inventory Mapping</h3>
              <Button type="button" variant="outline" className="rounded-none border-primary text-primary font-bold" onClick={() => appendHotel({ city: '', hotelName: '', category: '3 Star', roomType: 'Standard', mealPlan: 'Breakfast Only' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Destination Hotel
              </Button>
            </div>
            {hotelFields.map((field, index) => (
               <Card key={field.id} className="relative rounded-none border-border overflow-hidden">
                 <Button type="button" variant="ghost" size="icon" className="absolute top-4 right-4 text-destructive z-10" onClick={() => removeHotel(index)}><Trash2 className="h-4 w-4" /></Button>
                 <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField control={form.control} name={`hotels.${index}.city`} render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">City</FormLabel><FormControl><Input {...field} className="rounded-none h-12" /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`hotels.${index}.hotelName`} render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hotel Name</FormLabel><FormControl><Input {...field} className="rounded-none h-12" /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`hotels.${index}.category`} render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="rounded-none h-12"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="3 Star">3 Star</SelectItem>
                                <SelectItem value="4 Star">4 Star</SelectItem>
                                <SelectItem value="5 Star">5 Star</SelectItem>
                                <SelectItem value="Premium Homestay">Premium Homestay</SelectItem>
                            </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`hotels.${index}.roomType`} render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Room Type</FormLabel><FormControl><Input {...field} className="rounded-none h-12" /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`hotels.${index}.mealPlan`} render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Meal Plan</FormLabel><FormControl><Input {...field} className="rounded-none h-12" /></FormControl></FormItem>
                    )} />
                 </CardContent>
               </Card>
            ))}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card className="rounded-none border-border">
              <CardHeader className="bg-muted/10 border-b"><CardTitle className="font-black uppercase tracking-widest text-lg">Financial Structure</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Base Net Price (₹)</FormLabel><FormControl><Input type="number" {...field} className="rounded-none h-12" /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="gst" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">GST Slab (%)</FormLabel>
                        <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value.toString()}>
                            <FormControl><SelectTrigger className="rounded-none h-12"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="0">0% (GST Exempt)</SelectItem>
                                <SelectItem value="5">5% (Economy Cab/Stay)</SelectItem>
                                <SelectItem value="12">12% (Standard Package)</SelectItem>
                                <SelectItem value="18">18% (Luxury Package)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <div className="bg-[#f0f6ff] p-8 border border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Live Quotation</p>
                    <h4 className="text-4xl font-black text-[#003580] tracking-tighter">₹{totalCost.toLocaleString('en-IN')}</h4>
                    <p className="text-[10px] font-bold text-green-700 italic">Inclusive of GST + All Platform Charges</p>
                  </div>
                  <IndianRupee className="h-16 w-16 text-[#003580] opacity-10" />
                </div>

                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField control={form.control} name="inclusions" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inclusions (Comma Separated)</FormLabel><FormControl><Textarea className="rounded-none min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="exclusions" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Exclusions (Comma Separated)</FormLabel><FormControl><Textarea className="rounded-none min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <Card className="rounded-none border-border">
              <CardHeader className="bg-muted/10 border-b"><CardTitle className="font-black uppercase tracking-widest text-lg">Terms & Compliance</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-6">
                <FormField control={form.control} name="policies.tcs" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">TCS Policy</FormLabel><FormControl><Textarea className="rounded-none h-24" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="policies.cancellation" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cancellation Policy</FormLabel><FormControl><Textarea className="rounded-none h-24" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="policies.payment" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Schedule</FormLabel><FormControl><Textarea className="rounded-none h-24" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="policies.terms" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Master Terms & Conditions</FormLabel><FormControl><Textarea className="rounded-none h-40" {...field} /></FormControl></FormItem>
                )} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t z-50 flex justify-center gap-4">
            {isEditing && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" size="lg" className="rounded-none h-14 px-8 font-black uppercase tracking-widest border-2 border-red-600 bg-transparent text-red-600 hover:bg-red-600 hover:text-white" disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Purge Itinerary
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-none">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Permanent Deletion?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will wipe this expedition itinerary from the production node. This action cannot be reversed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-none">Confirm Purge</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button type="submit" disabled={isLoading} size="lg" className="flex-1 max-w-xl h-14 rounded-none font-black text-lg bg-[#003580] hover:bg-[#002b60] shadow-xl">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                {isEditing ? 'SYNC UPDATED PACKAGE' : 'INITIALIZE PRODUCTION PACKAGE'}
            </Button>
        </div>
      </form>
    </Form>
  );
}