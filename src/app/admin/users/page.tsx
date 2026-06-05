
'use client';
import { useMemo, useState } from 'react';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Trash2, Edit, Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteUserByAdmin } from './actions';
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

function UserRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-9 w-20" /></TableCell>
        </TableRow>
    )
}

export default function UsersPage() {
    const firestore = useFirestore();
    const { userProfile: adminProfile } = useUser();
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const usersQuery = useMemoFirebase(() => {
        if (!firestore || adminProfile?.role !== 'admin') return null;
        return collection(firestore, 'users');
    }, [firestore, adminProfile]);

    const { data: usersData, isLoading } = useCollection<UserProfile>(usersQuery);

    const users = useMemo(() => {
        if (!usersData) return null;
        return [...usersData].sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    }, [usersData]);

    const handlePurge = async (uid: string) => {
        if (uid === adminProfile?.uid) {
            toast({ variant: 'destructive', title: 'Action Denied', description: 'You cannot purge your own administrative node.' });
            return;
        }

        setIsDeleting(uid);
        try {
            const res = await deleteUserByAdmin(uid);
            if (res.success) {
                toast({ title: 'Explorer Purged', description: res.message });
            } else {
                toast({ variant: 'destructive', title: 'Sync Failed', description: res.message });
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'System Error', description: e.message });
        } finally {
            setIsDeleting(null);
        }
    }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#003580]">
                <Users className="h-3 w-3" /> Population Control
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[#1a1a1a]">Member Directory</h1>
          <p className="text-muted-foreground text-sm font-medium">Manage all registered explorers and administrative nodes.</p>
      </div>

      <Card className="rounded-none border border-black/5 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-muted/10 border-b p-6">
            <CardTitle className="text-lg font-black tracking-tight">Active Accounts</CardTitle>
            <CardDescription className="text-xs font-medium">
                Total population: {users?.length || 0} explorers synchronized.
            </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-muted/5">
                    <TableRow>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider px-6">Display Name</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider">Email Node</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-center">Protocol Role</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-center">Sync Status</TableHead>
                        <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider px-6">Direct Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <>
                            <UserRowSkeleton />
                            <UserRowSkeleton />
                            <UserRowSkeleton />
                        </>
                    ) : users && users.map(user => (
                        <TableRow key={user.uid} className="hover:bg-muted/5">
                            <TableCell className="font-bold text-sm px-6">{user.displayName || '(Unnamed)'}</TableCell>
                            <TableCell className="text-xs font-medium text-[#1E90FF]">{user.email}</TableCell>
                            <TableCell className="text-center">
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="rounded-none text-[9px] font-black uppercase tracking-widest border-0">
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline" className={cn(
                                    "rounded-none text-[9px] font-black uppercase tracking-widest", 
                                    user.status === 'active' ? 'border-green-600/20 text-green-600 bg-green-50' : 'border-red-600/20 text-red-600 bg-red-50'
                                )}>
                                    {user.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right px-6">
                               <div className="flex justify-end gap-2">
                                    <Button asChild variant="outline" size="sm" className="h-8 rounded-none px-4 text-[10px] font-black uppercase border-black/10">
                                        <Link href={`/admin/users/${user.uid}/edit`}><Edit className="h-3 w-3 mr-1.5" /> Edit</Link>
                                    </Button>
                                    
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-muted-foreground/40 hover:text-red-600 hover:bg-red-50" disabled={isDeleting === user.uid}>
                                                {isDeleting === user.uid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-none border-0 shadow-2xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter">Purge Account Node?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed">
                                                    This will permanently delete <strong>{user.displayName}</strong> from the Northern Harrier cloud and authentication registry. This action cannot be reversed.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="mt-6">
                                                <AlertDialogCancel className="rounded-none font-bold">Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handlePurge(user.uid)} className="bg-red-600 hover:bg-red-700 text-white rounded-none font-black px-8">Confirm Purge</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                               </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             {!isLoading && (!users || users.length === 0) && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Zero explorers detected in cloud.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
