
'use client';
import { useMemo, useState } from 'react';
import { useFirestore, useCollection, useUser, useMemoFirebase, type WithId } from '@/firebase';
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
    const { userProfile } = useUser();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore || userProfile?.role !== 'admin') return null;
        return collection(firestore, 'users');
    }, [firestore, userProfile]);

    const { data: usersData, isLoading } = useCollection<UserProfile>(usersQuery);

    const users = useMemo(() => {
        if (!usersData) return null;
        return [...usersData].sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    }, [usersData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">User & Role Management</h1>
        <p className="text-muted-foreground">View users and manage their access roles and details.</p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
                This is a list of all registered users on the platform.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <>
                            <UserRowSkeleton />
                            <UserRowSkeleton />
                            <UserRowSkeleton />
                        </>
                    )}
                    {users && users.map(user => (
                        <TableRow key={user.uid}>
                            <TableCell className="font-medium">{user.displayName || '(No Name)'}</TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{user.role}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={user.status === 'active' ? 'outline' : 'destructive'} className={cn("capitalize", user.status === 'active' && 'border-green-600 text-green-600')}>{user.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                               <Button asChild variant="outline" size="sm">
                                    <Link href={`/admin/users/${user.uid}/edit`}>Edit</Link>
                               </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             {!isLoading && users?.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    No users found.
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
