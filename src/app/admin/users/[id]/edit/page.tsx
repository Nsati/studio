'use client';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getUserDetailsForAdmin, updateUserByAdmin, UpdateUserSchema, type UpdateUserInput } from '@/app/admin/users/actions';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, IndianRupee, Loader2 } from 'lucide-react';
import Link from 'next/link';

function StatCard({ title, value, icon: Icon, isLoading }: any) {
    return (
        <Card className="rounded-none border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-[#003580]" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-1/2 mt-1" />
                ) : (
                  <div className="text-2xl font-bold text-[#1a1a1a]">{value}</div>
                )}
            </CardContent>
        </Card>
    )
}

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;
    const { toast } = useToast();

    const [userData, setUserData] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<UpdateUserInput>({
        resolver: zodResolver(UpdateUserSchema),
        defaultValues: {
            displayName: '',
            email: '',
            mobile: '',
            role: 'user',
            status: 'pending',
        }
    });

    useEffect(() => {
        if (userId) {
            getUserDetailsForAdmin(userId)
                .then(data => {
                    setUserData(data);
                    // Explicit cast to handle status literal build error
                    form.reset({
                        displayName: data.displayName,
                        email: data.email,
                        mobile: data.mobile,
                        role: data.role,
                        status: data.status as any,
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
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (error || !userData) {
        return notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">Manage Explorer</h1>
                    <p className="text-muted-foreground text-sm font-medium">Modifying profile for {userData.displayName} ({userData.email})</p>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
                <StatCard 
                    title="Lifetime Revenue" 
                    value={(userData.totalRevenue).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} 
                    icon={IndianRupee} 
                    isLoading={isLoading} 
                />
                <StatCard 
                    title="Verified Stays" 
                    value={userData.totalBookings}
                    icon={BookOpen} 
                    isLoading={isLoading} 
                />
            </div>

            <Card className="rounded-none border-border bg-white shadow-sm">
                <CardHeader className="bg-muted/20 border-b p-6">
                    <CardTitle className="text-lg font-bold">Account Configuration</CardTitle>
                    <CardDescription>Administrative modifications are logged for audit purposes.</CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField control={form.control} name="displayName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Legal Name</FormLabel>
                                        <FormControl><Input {...field} className="rounded-none h-12 focus-visible:ring-[#003580]" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Access</FormLabel>
                                        <FormControl><Input {...field} type="email" className="rounded-none h-12 focus-visible:ring-[#003580]" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField control={form.control} name="mobile" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mobile Node</FormLabel>
                                        <FormControl><Input {...field} className="rounded-none h-12 focus-visible:ring-[#003580]" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="role" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger className="rounded-none h-12 focus:ring-[#003580]"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="user">User / Explorer</SelectItem>
                                                <SelectItem value="admin">Administrator</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Integrity Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger className="rounded-none h-12 focus:ring-[#003580]"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">Active (Full Access)</SelectItem>
                                                <SelectItem value="pending">Pending Verification</SelectItem>
                                                <SelectItem value="suspended">Suspended (Blocked)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                             <div className="flex items-center gap-4 pt-8 border-t mt-4">
                                <Button type="submit" disabled={isSaving} className="rounded-none h-12 px-8 font-bold bg-[#003580]">
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Synchronize Records
                                </Button>
                                <Button variant="ghost" asChild className="rounded-none h-12 px-8 font-bold">
                                    <Link href="/admin/users">Discard Changes</Link>
                                </Button>
                             </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
