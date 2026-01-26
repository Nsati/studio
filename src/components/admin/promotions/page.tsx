
'use client';
import { useMemo, useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Promotion } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, Trash2, Edit, Tag, Percent, IndianRupee } from 'lucide-react';

const promotionSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters.").max(20).transform(v => v.toUpperCase()),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().positive("Discount value must be a positive number."),
  isActive: z.boolean().default(true),
});

function PromotionForm({
  promotion,
  onOpenChange,
}: {
  promotion?: Promotion & { id: string } | null;
  onOpenChange: (open: boolean) => void;
}) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = !!promotion;

    const form = useForm<z.infer<typeof promotionSchema>>({
        resolver: zodResolver(promotionSchema),
        defaultValues: {
            code: promotion?.code || '',
            description: promotion?.description || '',
            discountType: promotion?.discountType || 'percentage',
            discountValue: promotion?.discountValue || 10,
            isActive: promotion?.isActive ?? true,
        },
    });

    async function onSubmit(values: z.infer<typeof promotionSchema>) {
        if (!firestore) return;
        setIsLoading(true);

        const docId = values.code;
        const promotionRef = doc(firestore, 'promotions', docId);

        try {
            if (isEditing) {
                if (promotion.id !== docId) {
                    // If code/id changes, we need to delete the old and create a new one
                    const oldRef = doc(firestore, 'promotions', promotion.id);
                    await deleteDoc(oldRef);
                    await setDoc(promotionRef, values);
                } else {
                    await updateDoc(promotionRef, values);
                }
            } else {
                await setDoc(promotionRef, values);
            }
            toast({
                title: isEditing ? 'Promotion Updated' : 'Promotion Created',
                description: `Coupon code "${values.code}" has been saved.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error saving promotion:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Could not save the promotion.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="code" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Coupon Code</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. GET10" {...field} />
                        </FormControl>
                        <FormDescription>This is what users will type. It will be uppercased.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. 10% off on all bookings" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="discountType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Discount Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="discountValue" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="10 or 500" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Activate Coupon</FormLabel>
                        <FormDescription>
                          Inactive coupons cannot be used by customers.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange}/>
                      </FormControl>
                    </FormItem>
                  )} />

                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    )
}

function PromotionsTable({ promotions, onEdit, onDelete }: { promotions: (Promotion & {id: string})[], onEdit: (p: Promotion & {id: string}) => void, onDelete: (p: Promotion & {id: string}) => void }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {promotions.map(p => (
                    <TableRow key={p.id}>
                        <TableCell className="font-mono text-sm font-semibold">{p.code}</TableCell>
                        <TableCell>{p.description}</TableCell>
                        <TableCell className="font-semibold">
                            {p.discountType === 'percentage' ? (
                                <div className="flex items-center gap-1">{p.discountValue}<Percent className="h-4 w-4 text-muted-foreground" /></div>
                            ) : (
                                <div className="flex items-center gap-1"><IndianRupee className="h-4 w-4 text-muted-foreground" />{p.discountValue}</div>
                            )}
                        </TableCell>
                        <TableCell>
                            <Badge variant={p.isActive ? 'default' : 'destructive'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" onClick={() => onEdit(p)}><Edit className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon" onClick={() => onDelete(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}


export default function PromotionsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const promotionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'promotions');
    }, [firestore]);
    const { data: promotions, isLoading } = useCollection<Promotion>(promotionsQuery);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<(Promotion & {id: string}) | null>(null);
    const [deletingPromotion, setDeletingPromotion] = useState<(Promotion & {id: string})| null>(null);

    const handleEdit = (p: Promotion & {id: string}) => {
        setEditingPromotion(p);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingPromotion(null);
        setIsFormOpen(true);
    }

    const handleDelete = async () => {
        if (!firestore || !deletingPromotion) return;
        try {
            await deleteDoc(doc(firestore, 'promotions', deletingPromotion.id));
            toast({
                title: 'Promotion Deleted',
                description: `Coupon "${deletingPromotion.code}" has been deleted.`,
            });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setDeletingPromotion(null);
        }
    }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="font-headline text-3xl font-bold">Promotions & Offers</h1>
            <p className="text-muted-foreground">Create and manage discount codes and special offers.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Promotion
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{editingPromotion ? 'Edit Promotion' : 'Add New Promotion'}</DialogTitle>
                    <DialogDescription>
                        {editingPromotion ? `Update details for the "${editingPromotion.code}" coupon.` : 'Create a new coupon code that customers can use.'}
                    </DialogDescription>
                </DialogHeader>
                <PromotionForm promotion={editingPromotion} onOpenChange={setIsFormOpen} />
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Promotions</CardTitle>
          <CardDescription>This is a list of all available coupon codes.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading && (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            )}
            {promotions && promotions.length > 0 && (
                <PromotionsTable promotions={promotions} onEdit={handleEdit} onDelete={setDeletingPromotion} />
            )}
            {!isLoading && (!promotions || promotions.length === 0) && (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed bg-transparent rounded-lg">
                    <Tag className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">No promotions found. Click "Add Promotion" to create one.</p>
                </div>
            )}
        </CardContent>
      </Card>
      <AlertDialog open={!!deletingPromotion} onOpenChange={(open) => !open && setDeletingPromotion(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the coupon code <span className="font-mono font-bold">{deletingPromotion?.code}</span>. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Yes, delete it</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
