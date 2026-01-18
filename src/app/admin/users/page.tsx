'use client';
import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function UserRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
        </TableRow>
    )
}

export default function UsersPage() {
    const firestore = useFirestore();

    const usersQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), orderBy('displayName'));
    }, [firestore]);

    const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">User Management</h1>
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
                        <TableHead>User ID</TableHead>
                        <TableHead className="text-right">Role</TableHead>
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
                            <TableCell className="font-medium">{user.displayName}</TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell className="font-mono text-xs">{user.uid}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className="capitalize">
                                    {user.role}
                                </Badge>
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
