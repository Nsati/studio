
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
import { firebaseConfig } from '@/firebase/config';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/admin/hotels', label: 'Hotels', icon: Hotel },
  { href: '/admin/tour-packages', label: 'Tours', icon: Package },
  { href: '/admin/users', label: 'Customers', icon: Users2 },
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
    // This effect handles the case where the user is not logged in at all.
    // It waits for the auth state to be resolved (`isLoading` is false).
    if (isLoading) return;
    if (!user) {
      router.replace('/login?redirect=/admin');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    // Show a loading state while we verify the user's credentials.
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <div className="flex items-center gap-4 text-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <p>Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // If the user is logged in and has the 'admin' role, show the admin panel.
  if (user && userProfile && userProfile.role === 'admin') {
    return <>{children}</>;
  }

  // If the user is logged in but is NOT an admin, show a helpful message
  // instead of just redirecting them away. This guides them on how to fix it.
  if (user && !isLoading) {
    const consoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/data/~2Fusers~2F${user.uid}`;
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-lg border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl text-destructive">
              <ShieldAlert className="h-6 w-6" />
              Admin Access Required
            </CardTitle>
            <CardDescription>
              Your account (<span className="font-semibold">{user.email}</span>) does not have administrator privileges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              For security, the admin role must be assigned manually. To enable admin access for your account, please follow these steps.
            </p>
            <div>
              <h4 className="font-semibold text-foreground">How to Grant Admin Access:</h4>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 mt-2">
                <li>Go to your Firebase project console.</li>
                <li>Navigate to the <code className="font-mono bg-muted p-1 rounded">Firestore Database</code> section.</li>
                <li>In the <code className="font-mono bg-muted p-1 rounded">users</code> collection, find the document with your user ID ({user.uid}).</li>
                <li>Add or edit the <code className="font-mono bg-muted p-1 rounded">role</code> field and set its value to the string <code className="font-mono bg-muted p-1 rounded">"admin"</code>.</li>
                <li>Refresh this page.</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild>
              <a href={consoleUrl} target="_blank" rel="noopener noreferrer">
                Go to Your User Document
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Fallback for the brief moment before the redirect effect runs.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40">
      <p>Redirecting to login...</p>
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
