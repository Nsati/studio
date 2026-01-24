'use client';
import { useMemo, useState } from 'react';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser } from '@/firebase/auth/use-user';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function UserRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-10 w-28" /></TableCell>
        </TableRow>
    )
}

function RoleSelector({ user }: { user: UserProfile }) {
    const { user: currentUser } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);
    
    const handleRoleChange = async (newRole: 'user' | 'admin') => {
        if (!firestore || !currentUser) return;
        // Prevent users from changing their own role to avoid self-lockout
        if (user.uid === currentUser.uid) {
            toast({
                variant: 'destructive',
                title: 'Action Forbidden',
                description: 'You cannot change your own role.',
            });
            return;
        }

        setIsUpdating(true);
        const userRef = doc(firestore, 'users', user.uid);
        
        updateDoc(userRef, { role: newRole })
            .then(() => {
                toast({
                    title: 'Role Updated',
                    description: `${user.displayName || user.email}'s role has been changed to ${newRole}.`
                });
            })
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: userRef.path,
                    operation: 'update',
                    requestResourceData: { role: newRole },
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setIsUpdating(false);
            });
    };

    return (
         <Select 
            defaultValue={user.role} 
            onValueChange={(value: 'user' | 'admin') => handleRoleChange(value)}
            disabled={isUpdating}
        >
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
        </Select>
    )
}


export default function UsersPage() {
    const firestore = useFirestore();

    const usersQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: usersData, isLoading } = useCollection<UserProfile>(usersQuery);

    const users = useMemo(() => {
        if (!usersData) return null;
        return [...usersData].sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    }, [usersData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">User & Role Management</h1>
        <p className="text-muted-foreground">View users and manage their access roles.</p>
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
                            <TableCell className="font-medium">{user.displayName || '(No Name)'}</TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell className="font-mono text-xs">{user.uid}</TableCell>
                            <TableCell className="text-right">
                                <RoleSelector user={user} />
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
