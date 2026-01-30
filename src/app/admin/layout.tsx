'use client';
import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { LayoutDashboard, Hotel, Users2, Tag, LogOut, ExternalLink, Map, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
            <Card className="w-full max-w-md text-center rounded-[2rem] shadow-apple border-black/5">
                <CardHeader>
                    <CardTitle className="text-3xl font-black tracking-tight text-destructive">Access Denied</CardTitle>
                    <CardDescription className="font-medium">Admin permissions required.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        This area is restricted to administrators. If you are logged in as <strong>{user?.email}</strong> and still cannot see the panel, please ensure your account has the correct role.
                    </p>
                    <div className="p-4 bg-muted rounded-xl text-xs font-mono break-all text-left">
                        <div className="flex justify-between border-b pb-1 mb-1"><span>UID:</span> <span>{user?.uid}</span></div>
                        <div className="flex justify-between"><span>Email:</span> <span>{user?.email || 'N/A'}</span></div>
                    </div>
                     <Button asChild className="w-full rounded-full h-12">
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

  // GOD MODE MASTER BYPASS (Hardcoded Email & UID)
  const isMasterAdminEmail = user?.email === 'mistrikumar42@gmail.com';
  const isMasterAdminUid = user?.uid === 'kk7Tsg8Ag3g1YMMR79rgrHUxq2W2';
  const hasAdminRole = userProfile?.role === 'admin';
  
  const isAuthorized = isMasterAdminEmail || isMasterAdminUid || hasAdminRole;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/admin');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <AdminLayoutSkeleton />;
  }
  
  if (!user || !isAuthorized) {
      return <NotAdmin />;
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="hidden w-64 flex-col border-r bg-background p-6 md:flex">
        <div className="mb-10 flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white">
                <LayoutDashboard className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-black tracking-tight">Admin Console</h2>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200",
                pathname === item.href 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-3 pt-6 border-t border-black/5">
             <Button variant="outline" asChild className="w-full justify-start rounded-xl font-bold border-black/10">
                <Link href="/" target="_blank">
                    <ExternalLink className="mr-3 h-4 w-4" /> View Site
                </Link>
             </Button>
             <Button variant="ghost" asChild className="w-full justify-start rounded-xl font-bold text-muted-foreground hover:text-destructive">
                <Link href="/my-bookings">
                    <LogOut className="mr-3 h-4 w-4" /> Exit God-Mode
                </Link>
             </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-10 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
}