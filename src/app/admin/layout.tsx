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
  Menu,
  Package,
} from 'lucide-react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// Based on the user's document for a production-ready admin panel.
const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/admin/hotels', label: 'Hotels', icon: Hotel }, // Inventory part 1
  { href: '/admin/tour-packages', label: 'Tours', icon: Package },
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

  // This effect handles the redirection logic.
  useEffect(() => {
    // Don't do anything while loading.
    if (isLoading) {
      return;
    }
    
    // If loading is done, check auth state.
    if (!user) {
      // User is not logged in.
      router.replace('/login?redirect=/admin');
    } else if ((userProfile?.role ?? '').toLowerCase() !== 'admin') {
      // User is logged in, but is not an admin.
      // This safer check prevents crashes if userProfile or role is missing/null/undefined.
      router.replace('/');
    }
  }, [user, userProfile, isLoading, router]);

  // This block determines what UI to show based on the current state.
  if (isLoading) {
    // Show a loading skeleton while we verify credentials.
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <div className="flex items-center gap-4 text-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <p>Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (user && (userProfile?.role ?? '').toLowerCase() === 'admin') {
    // If the user is an admin, show the admin layout.
    return <>{children}</>;
  }

  // If the user is not loading and not an admin, they are denied access.
  // Show an access denied message while the useEffect above handles the redirect.
  return (
    <div className="flex h-screen items-center justify-center bg-muted/40 p-4">
      <Alert variant="destructive" className="max-w-lg">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have the required permissions to view this page. Redirecting...
        </AlertDescription>
      </Alert>
    </div>
  );
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminAuthGuard>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r bg-background md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/admin" className="flex items-center gap-2 font-semibold">
                <Hotel className="h-6 w-6 text-primary" />
                <span className="font-headline text-xl font-bold">Admin Panel</span>
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
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
            </div>
            <div className="mt-auto p-4">
               <Button asChild variant="outline" className="w-full">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Back to Main Site
                    </Link>
                </Button>
            </div>
          </div>
        </aside>
        <div className="flex flex-col">
           <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
             <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                  <nav className="grid gap-2 text-lg font-medium">
                    <div className="mb-4">
                       <Link href="/admin" className="flex items-center gap-2 font-semibold">
                            <Hotel className="h-6 w-6 text-primary" />
                            <span className="font-headline text-xl font-bold">Admin Panel</span>
                        </Link>
                    </div>
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                           pathname === item.href && "bg-muted text-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto">
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Back to Main Site
                        </Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
           </header>
           <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
