
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getUserDetailsForAdmin, updateUserByAdmin, deleteUserByAdmin } from '@/app/admin/users/actions';
import { UpdateUserSchema, type UpdateUserInput } from '@/app/admin/schemas';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShieldAlert, Check, Trash2, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
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
} from "@/components/ui/alert-dialog";
import Link from 'next/link';

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const uid = params.id as string;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [userName, setUserName] = useState('');

    const form = useForm<UpdateUserInput>({
        resolver: zodResolver(UpdateUserSchema),
        defaultValues: { displayName: '', email: '', mobile: '', role: 'user', status: 'pending' }
    });

    useEffect(() => {
        if (uid) {
            getUserDetailsForAdmin(uid).then(data => {
                setUserName(data.displayName);
                form.reset({
                    displayName: data.displayName,
                    email: data.email,
                    mobile: data.mobile,
                    role: data.role as 'user' | 'admin',
                    status: data.status as 'pending' | 'active' | 'suspended'
                });
                setIsLoading(false);
            }).catch(e => {
                toast({ variant: 'destructive', title: 'Fetch Error', description: e.message });
                router.push('/admin/users');
            });
        }
    }, [uid, form, router, toast]);

    async function onSubmit(values: UpdateUserInput) {
        setIsSaving(true);
        const res = await updateUserByAdmin(uid, values);
        if (res.success) {
            toast({ title: 'Profile Synchronized', description: res.message });
            router.push('/admin/users');
        } else {
            toast({ variant: 'destructive', title: 'Error', description: res.message });
        }
        setIsSaving(false);
    }

    const handlePurge = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteUserByAdmin(uid);
            if (res.success) {
                toast({ title: 'Explorer Node Purged', description: res.message });
                router.push('/admin/users');
            } else {
                toast({ variant: 'destructive', title: 'Purge Failed', description: res.message });
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Critical Error', description: e.message });
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-1/4" /><Skeleton className="h-96 w-full" /></div>;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex flex-col gap-1">
                <Link href="/admin/users" className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-1 hover:underline">
                    <ArrowLeft className="h-3 w-3" /> Back to Directory
                </Link>
                <h1 className="text-4xl font-black tracking-tighter text-[#1a1a1a]">Modify Explorer Profile</h1>
                <p className="text-muted-foreground font-medium text-sm">Editing access protocols for <strong>{userName}</strong>.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card className="rounded-none border-border">
                        <CardHeader className="bg-muted/10 border-b">
                            <CardTitle className="text-xl font-black uppercase tracking-widest">Protocol Identity</CardTitle>
                            <CardDescription className="text-xs">Update legal name and communication nodes.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <FormField control={form.control} name="displayName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Legal Name</FormLabel>
                                    <FormControl><Input {...field} className="h-12 rounded-none bg-muted/20" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sync Email Node</FormLabel>
                                        <FormControl><Input {...field} className="h-12 rounded-none bg-muted/20" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="mobile" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Node</FormLabel>
                                        <FormControl><Input {...field} className="h-12 rounded-none bg-muted/20" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="role" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Level</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent className="rounded-none">
                                                <SelectItem value="user" className="font-bold">STANDARD EXPLORER</SelectItem>
                                                <SelectItem value="admin" className="font-bold text-primary">ADMINISTRATOR</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription className="text-[9px] font-bold">Caution: Administrators have full cloud access.</FormDescription>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sync Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent className="rounded-none">
                                                <SelectItem value="active" className="font-bold text-green-600">ACTIVE</SelectItem>
                                                <SelectItem value="pending" className="font-bold text-amber-600">PENDING</SelectItem>
                                                <SelectItem value="suspended" className="font-bold text-red-600">SUSPENDED</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription className="text-[9px] font-bold">Suspended nodes cannot initiate new travel protocols.</FormDescription>
                                    </FormItem>
                                )} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-20">
                        <Button type="submit" disabled={isSaving || isDeleting} className="w-full md:w-auto h-14 px-12 rounded-none font-black text-lg bg-[#003580] hover:bg-[#002b60] shadow-xl">
                            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                            Synchronize Explorer Profile
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive" disabled={isDeleting || isSaving} className="w-full md:w-auto h-14 px-8 rounded-none font-black text-lg border-2 border-red-600 bg-transparent text-red-600 hover:bg-red-600 hover:text-white transition-all">
                                    {isDeleting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Trash2 className="mr-2 h-5 w-5" />}
                                    Purge Explorer Node
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-none border-0 shadow-2xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-2xl font-black flex items-center gap-3">
                                        <ShieldAlert className="h-6 w-6 text-red-600" /> Confirm Purge Protocol
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground font-medium text-base leading-relaxed">
                                        This will permanently wipe <strong>{userName}</strong> from Northern Harrier cloud database and authentication records. All credentials will be revoked immediately.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-6">
                                    <AlertDialogCancel className="rounded-none h-11 font-bold">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handlePurge} className="bg-red-600 hover:bg-red-700 text-white rounded-none h-11 font-black px-8">Confirm Purge</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </form>
            </Form>
        </div>
    );
}
