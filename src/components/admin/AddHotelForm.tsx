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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dummyCities } from '@/lib/dummy-data';
import { Loader2, Trash2, PlusCircle, Link as LinkIcon, Check } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardHeader } from '../ui/card';

const allAmenities = ['wifi', 'parking', 'restaurant', 'bar', 'spa', 'pool', 'gym', 'mountain-view', 'garden', 'library', 'river-view', 'ghat', 'adventure', 'trekking', 'skiing', 'heritage', 'safari'];

const roomSchema = z.object({
  type: z.string().min(2, 'Room type is required'),
  price: z.coerce.number().min(1, 'Price must be positive.'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1.'),
  totalRooms: z.coerce.number().min(1, 'Total rooms must be at least 1.'),
});

const formSchema = z.object({
  name: z.string().min(3, 'Hotel name must be at least 3 characters long.'),
  city: z.string().min(1, 'Please select a city.'),
  address: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  rating: z.coerce.number().min(1).max(5).positive(),
  discount: z.coerce.number().min(0).max(100).optional(),
  amenities: z.array(z.string()).min(1, 'Please select at least one amenity.'),
  imagesRaw: z.string().min(1, 'Please add at least one image link.'),
  rooms: z.array(roomSchema).min(1, 'Please add at least one room type.'),
});

export function AddHotelForm() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      city: '',
      description: '',
      address: '',
      rating: 4,
      discount: 0,
      amenities: [],
      imagesRaw: '',
      rooms: [{ type: 'Standard', price: 5000, capacity: 2, totalRooms: 10 }],
    },
  });

  const { fields: roomFields, append: appendRoom, remove: removeRoom } = useFieldArray({
    control: form.control,
    name: 'rooms',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Firestore not available' });
        return;
    }
    setIsLoading(true);

    try {
        const hotelId = slugify(values.name, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 5);
        const batch = writeBatch(firestore);
        const imagesArray = values.imagesRaw.split(',').map(url => url.trim()).filter(Boolean);
        const minPrice = Math.min(...values.rooms.map(r => r.price));

        const hotelRef = doc(firestore, 'hotels', hotelId);
        const { rooms, imagesRaw, ...hotelData } = values;
        
        batch.set(hotelRef, {
            ...hotelData,
            images: imagesArray,
            minPrice,
            mountainSafetyScore: 80,
            landslideRisk: 'Low',
            roadCondition: 'Good',
            networkJio: true,
            networkAirtel: true,
            networkBsnl: false,
            isSnowFriendly: true,
            isElderlySafe: true,
            hasPowerBackup: true,
            nearestAtmKm: 2,
            cabFareToCenter: 300,
            balconyWorthIt: true,
            createdAt: new Date().toISOString()
        });

        for (const room of rooms) {
            const roomId = slugify(`${values.name} ${room.type} ${Math.random().toString(36).substring(2, 7)}`, { lower: true, strict: true });
            const roomRef = doc(firestore, 'hotels', hotelId, 'rooms', roomId);
            batch.set(roomRef, {
                hotelId: hotelId,
                ...room,
                availableRooms: room.totalRooms,
            });
        }
    
        await batch.commit();
        toast({ title: 'Hotel Added!', description: `${values.name} node has been established.` });
        router.push('/admin/hotels');
        router.refresh();
      } catch (error: any) {
        console.error("Error adding hotel:", error);
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not add hotel node.' });
      } finally {
        setIsLoading(false);
      }
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
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hotel Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. The Grand Himalayan" {...field} className="h-12 rounded-none" />
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
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">City Hub</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-none">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dummyCities.map(city => (
                      <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detailed Summary</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the property node..." className="resize-y min-h-[150px] rounded-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-black tracking-tight text-primary uppercase">Gallery Image Links</h3>
          </div>
          <FormField
            control={form.control}
            name="imagesRaw"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Photos URLs (Comma Separated)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="https://img1.jpg, https://img2.jpg" 
                    className="min-h-[120px] rounded-none font-sans" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />
        
        <div>
          <h3 className="text-lg font-black tracking-tight text-primary uppercase">Standard Amenities</h3>
          <FormDescription className="text-[10px] font-bold uppercase">Select facilities available at this node.</FormDescription>
        </div>
        
        <FormField
          control={form.control}
          name="amenities"
          render={() => (
            <FormItem>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 border bg-muted/10 rounded-none">
                {allAmenities.map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="amenities"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item])
                                : field.onChange((field.value || [])?.filter((value) => value !== item))
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-[10px] font-black uppercase tracking-tight cursor-pointer">
                          {item.replace('-', ' ')}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-lg font-black tracking-tight text-primary uppercase">Inventory Configuration</h3>
          <FormDescription className="text-[10px] font-bold uppercase">Define available room types and pricing.</FormDescription>

          {roomFields.map((field, index) => (
            <Card key={field.id} className="rounded-none border-border bg-white shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-muted/10 border-b p-4">
                <h4 className="text-xs font-black uppercase tracking-widest">Room Cluster {index + 1}</h4>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeRoom(index)} className="h-8 w-8 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name={`rooms.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type Label</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Standard Deluxe" {...field} className="h-10 rounded-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`rooms.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Net Price</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="h-10 rounded-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`rooms.${index}.capacity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Max Pax</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="h-10 rounded-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`rooms.${index}.totalRooms`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inventory Units</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="h-10 rounded-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            className="rounded-none font-bold" 
            onClick={() => appendRoom({ type: 'Standard', price: 5000, capacity: 2, totalRooms: 10 })}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Room Category
          </Button>
        </div>

        <div className="flex items-center justify-start pt-8 border-t">
          <Button type="submit" disabled={isLoading} className="h-14 px-12 rounded-none font-black text-lg bg-primary shadow-xl">
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
            {isLoading ? 'Synchronizing...' : 'Initialize Property'}
          </Button>
        </div>
      </form>
    </Form>
  );
}