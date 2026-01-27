
'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { LayoutDashboard, Hotel, BookOpen, Users2, Tag, LogOut, ExternalLink, Map } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
    { href: '/admin/hotels', label: 'Hotels', icon: Hotel },
    { href: '/admin/tour-packages', label: 'Tour Packages', icon: Map },
    { href: '/admin/users', label: 'Users', icon: Users2 },
    { href: '/admin/promotions', label: 'Promotions', icon: Tag },
];

function AdminLayoutSkeleton() {
    return (
        <div className="flex min-h-screen">
            <aside className="w-64 border-r p-4 space-y-4">
                <Skeleton className="h-8 w-32" />
                <div className="space-y-2">
                    {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
            </aside>
            <main className="flex-1 p-8">
                <Skeleton className="h-64 w-full" />
            </main>
        </div>
    )
}

function NotAdmin() {
    const { user } = useUser();
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-muted">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Access Denied</CardTitle>
                    <CardDescription>You do not have permission to view the Admin Panel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This area is restricted to administrators. If you believe this is an error, please contact support.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Your current role: <span className="font-semibold text-foreground capitalize">{user?.isAnonymous ? 'Guest' : 'User'}</span>
                    </p>
                     <Button asChild>
                        <Link href="/">Back to Home</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/admin');
    }
  }, [user, isLoading, router]);


  if (isLoading) {
    return <AdminLayoutSkeleton />;
  }
  
  if (!user || userProfile?.role !== 'admin') {
      return <NotAdmin />;
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
        <div className="mb-8 flex items-center gap-2">
            <Hotel className="h-6 w-6 text-primary" />
            <h2 className="font-headline text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
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
        <div className="mt-auto space-y-2">
             <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/" target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" /> View Live Site
                </Link>
             </Button>
             <Button variant="ghost" asChild className="w-full justify-start text-muted-foreground hover:text-primary">
                <Link href="/my-bookings">
                    <LogOut className="mr-2 h-4 w-4" /> Exit Admin
                </Link>
             </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
