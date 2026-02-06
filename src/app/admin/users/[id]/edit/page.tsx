
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getUserDetailsForAdmin, updateUserByAdmin, UpdateUserSchema, type UpdateUserInput } from '@/app/admin/users/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const uid = params.id as string;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<UpdateUserInput>({
        resolver: zodResolver(UpdateUserSchema),
        defaultValues: { displayName: '', email: '', mobile: '', role: 'user', status: 'pending' }
    });

    useEffect(() => {
        if (uid) {
            getUserDetailsForAdmin(uid).then(data => {
                form.reset({
                    displayName: data.displayName,
                    email: data.email,
                    mobile: data.mobile,
                    role: data.role as 'user' | 'admin',
                    status: data.status as 'pending' | 'active' | 'suspended'
                });
                setIsLoading(false);
            });
        }
    }, [uid, form]);

    async function onSubmit(values: UpdateUserInput) {
        setIsSaving(true);
        const res = await updateUserByAdmin(uid, values);
        if (res.success) {
            toast({ title: 'Success' });
            router.push('/admin/users');
        } else {
            toast({ variant: 'destructive', title: 'Error', description: res.message });
        }
        setIsSaving(false);
    }

    if (isLoading) return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Edit User Profile</h1>
            <Card>
                <CardContent className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField control={form.control} name="displayName" render={({ field }) => (
                                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem><FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                                </FormItem>
                            )} />
                            <Button type="submit" disabled={isSaving} className="w-full">
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
