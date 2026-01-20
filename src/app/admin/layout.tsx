'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Hotel,
  BookOpen,
  Users2,
  Settings,
  Home,
  Star,
  Receipt,
  BarChart,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import { useUser } from '@/firebase';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Based on the user's document for a production-ready admin panel.
const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/admin/hotels', label: 'Hotels', icon: Hotel }, // Inventory part 1
  // For now, Rooms will be managed within each hotel's edit page.
  { href: '/admin/users', label: 'Customers', icon: Users2 }, // Customers / Users & Roles
  { href: '/admin/payments', label: 'Payments', icon: Receipt },
  { href: '/admin/promotions', label: 'Promotions', icon: Tag },
  { href: '/admin/reports', label: 'Reports', icon: BarChart },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, userProfile, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait until loading is done

    if (!user) {
      // Not logged in, redirect to login page for authentication.
      router.replace('/login?redirect=/admin');
    } else if (!userProfile || userProfile.role !== 'admin') {
      // Logged in but not an admin (or profile is missing), redirect to home page.
      router.replace('/');
    }
  }, [user, userProfile, isLoading, router]);

  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/40">
            <div className="flex items-center gap-4 text-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <p>Verifying credentials...</p>
            </div>
        </div>
    );
  }
  
  if (userProfile?.role === 'admin') {
    // User is logged in and is an admin.
    return <>{children}</>;
  }
  
  // If we reach here, the user is not an admin. Show a detailed error message.
  // This UI is shown temporarily before the useEffect redirect kicks in.
  let errorDescription;
  if (!user) {
    errorDescription = "You are not logged in. Redirecting to login page..."
  } else if (!userProfile) {
    errorDescription = `Your user account was found, but a profile document is missing from the database. This document should be in the 'users' collection with the ID '${user.uid}'. Please ask an administrator to create it. You will be redirected to the homepage.`;
  } else {
    errorDescription = `Your account role is '${userProfile.role}'. You must have the 'admin' role to access this page. Please contact a super-administrator to upgrade your role. You will be redirected to the homepage.`;
  }

  return (
      <div className="flex h-screen items-center justify-center bg-muted/40 p-4">
            <Alert variant="destructive" className="max-w-lg">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                   {errorDescription}
                </AlertDescription>
            </Alert>
        </div>
  );
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminAuthGuard>
        <div className="flex min-h-screen bg-muted/40">
        <aside className="hidden w-64 flex-col border-r bg-background p-4 sm:flex">
            <div className="mb-8">
            <Logo />
            </div>
            <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
                <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === item.href && "bg-muted text-primary"
                )}
                >
                <item.icon className="h-4 w-4" />
                {item.label}
                </Link>
            ))}
            </nav>
            <div className="mt-auto flex flex-col gap-4">
                <Button asChild variant="outline">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Back to Main Site
                    </Link>
                </Button>
            </div>
        </aside>
        <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
    </AdminAuthGuard>
  );
}
