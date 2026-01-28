
'use client';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getUserDetailsForAdmin, updateUserByAdmin, UpdateUserSchema, type UpdateUserInput } from '@/app/admin/users/actions';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, IndianRupee, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface UserDetails extends UserProfile {
    totalRevenue: number;
    totalBookings: number;
}

function StatCard({ title, value, icon: Icon, isLoading }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-1/2 mt-1" />
                ) : (
                  <div className="text-2xl font-bold">{value}</div>
                )}
            </CardContent>
        </Card>
    )
}

function EditUserPageSkeleton() {
    return (
      <div className="space-y-6">
          <Skeleton className="h-9 w-1/3 mb-2" />
          <Skeleton className="h-5 w-1/2 mb-8" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Revenue" isLoading={true} icon={IndianRupee} />
            <StatCard title="Total Bookings" isLoading={true} icon={BookOpen} />
          </div>
          <Card>
              <CardHeader><CardTitle>Edit User Details</CardTitle></CardHeader>
              <CardContent className="pt-6">
                  <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-10 w-32" />
                  </div>
              </CardContent>
          </Card>
      </div>
    );
}

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;
    const { toast } = useToast();

    const [user, setUser] = useState<UserDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<UpdateUserInput>({
        resolver: zodResolver(UpdateUserSchema),
        defaultValues: {
            displayName: '',
            mobile: '',
            role: 'user',
            status: 'pending',
        }
    });

    useEffect(() => {
        if (userId) {
            getUserDetailsForAdmin(userId)
                .then(data => {
                    setUser(data);
                    form.reset({
                        displayName: data.displayName,
                        mobile: data.mobile,
                        role: data.role,
                        status: data.status,
                    });
                    setIsLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setIsLoading(false);
                });
        }
    }, [userId, form]);

    async function onSubmit(values: UpdateUserInput) {
        setIsSaving(true);
        const result = await updateUserByAdmin(userId, values);
        if (result.success) {
            toast({
                title: 'Success',
                description: result.message,
            });
            router.push('/admin/users');
        } else {
            toast({
                variant: 'destructive',
                title: 'Error updating user',
                description: result.message,
            });
        }
        setIsSaving(false);
    }

    if (isLoading) {
        return <EditUserPageSkeleton />;
    }

    if (error) {
        return notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Manage User</h1>
                <p className="text-muted-foreground">Editing profile for &quot;{user?.displayName}&quot;.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
                <StatCard 
                    title="Lifetime Revenue" 
                    value={(user?.totalRevenue ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} 
                    icon={IndianRupee} 
                    isLoading={isLoading} 
                />
                <StatCard 
                    title="Total Bookings" 
                    value={user?.totalBookings ?? 0}
                    icon={BookOpen} 
                    isLoading={isLoading} 
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit User Details</CardTitle>
                    <CardDescription>Changes made here will be permanent.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="displayName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="mobile" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mobile Number</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="role" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                             <div className="flex items-center gap-4 pt-4 border-t">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Save Changes
                                </Button>
                                <Button variant="ghost" asChild>
                                    <Link href="/admin/users">Cancel</Link>
                                </Button>
                             </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
