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
    if (!isLoading) {
      if (!user) {
        // Not logged in, redirect to login page for authentication.
        router.replace('/login?redirect=/admin');
      } else if (userProfile && userProfile.role !== 'admin') {
        // Logged in but not an admin, redirect to home page.
        router.replace('/');
      }
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
  
  if (!user || userProfile?.role !== 'admin') {
     // This state is temporary while redirecting
    return (
        <div className="flex h-screen items-center justify-center bg-muted/40 p-4">
              <Alert variant="destructive" className="max-w-lg">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Access Denied</AlertTitle>
                  <AlertDescription>
                     You must be an administrator to access this page. You will be redirected shortly.
                  </AlertDescription>
              </Alert>
          </div>
    );
  }
  
  // If we reach here, user is an authenticated admin.
  return <>{children}</>;
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
