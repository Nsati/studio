'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Hotel,
  Book,
  Users2,
  Settings,
  Home,
  Star,
  Receipt,
  BarChart,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { AdminPasswordPrompt } from '@/components/admin/AdminPasswordPrompt';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/hotels', label: 'Hotels', icon: Hotel },
  { href: '/admin/bookings', label: 'Bookings', icon: Book },
  { href: '/admin/users', label: 'Users', icon: Users2 },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/payments', label: 'Payments', icon: Receipt },
  { href: '/admin/promotions', label: 'Promotions', icon: Tag },
  { href: '/admin/reports', label: 'Reports', icon: BarChart },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs only on the client-side
    const isAdmin = localStorage.getItem('admin_authenticated') === 'true';
    if (isAdmin) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    // Render a skeleton loader to prevent flash of un-authenticated content
    return <div className="flex h-screen w-full items-center justify-center"><Skeleton className="h-32 w-32 rounded-full" /></div>;
  }

  if (!process.env.NEXT_PUBLIC_ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD === 'changeme') {
      return (
          <div className="flex h-screen items-center justify-center bg-muted/40 p-4">
              <Alert variant="destructive" className="max-w-lg">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Configuration Error: Admin Panel is Insecure</AlertTitle>
                  <AlertDescription>
                      The admin password is not set or is still the default. Please set the 
                      <code className="font-mono bg-destructive/20 px-1 py-0.5 rounded">NEXT_PUBLIC_ADMIN_PASSWORD</code> 
                      environment variable to a strong, unique password in both your <code className="font-mono bg-destructive/20 px-1 py-0.5 rounded">.env</code> file and your deployment environment (e.g., Netlify) to secure the admin panel.
                  </AlertDescription>
              </Alert>
          </div>
      );
  }

  if (!isAuthenticated) {
    return <AdminPasswordPrompt onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <>{children}</>;
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {

  return (
    <AdminGuard>
        <div className="flex min-h-screen bg-muted/40">
        <aside className="hidden w-64 flex-col border-r bg-background p-4 sm:flex">
            <div className="mb-8">
            <Logo />
            </div>
            <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
                <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
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
        <main className="flex-1 p-8">{children}</main>
        </div>
    </AdminGuard>
  );
}
