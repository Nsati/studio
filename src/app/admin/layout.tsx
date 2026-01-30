'use client';
import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { LayoutDashboard, Hotel, Users2, Tag, LogOut, ExternalLink, Map, BookOpen, ShieldAlert, ShieldCheck } from 'lucide-react';
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
        <div className="flex min-h-screen bg-muted/20">
            <aside className="w-72 border-r p-8 space-y-8 bg-white">
                <Skeleton className="h-12 w-48 rounded-2xl" />
                <div className="space-y-4 pt-10">
                    {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-2xl" />)}
                </div>
            </aside>
            <main className="flex-1 p-12">
                <Skeleton className="h-96 w-full rounded-[3rem]" />
            </main>
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

  // SUPERUSER MASTER BYPASS (Instant Access)
  const isMasterAdminEmail = user?.email === 'mistrikumar42@gmail.com';
  const isMasterAdminUid = user?.uid === 'kk7Tsg8Ag3g1YMMR79rgrHUxq2W2';
  const hasAdminRole = userProfile?.role === 'admin';
  
  // GOD MODE: We allow access if it's the master account, even if we're still loading profile
  const isAuthorized = isMasterAdminEmail || isMasterAdminUid || hasAdminRole;

  // We removed the forced redirect to /login to allow the panel to be more resilient
  // Data will still be protected by Firestore Rules if not logged in.

  if (isLoading && !user) {
    return <AdminLayoutSkeleton />;
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Editorial Sidebar */}
      <aside className="hidden w-80 flex-col border-r bg-white p-8 md:flex sticky top-0 h-screen">
        <div className="mb-16 flex items-center gap-4 group">
            <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <LayoutDashboard className="h-7 w-7" />
            </div>
            <div className="space-y-0.5">
                <h2 className="text-xl font-black tracking-tight leading-none">Console</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Superuser Mode</p>
            </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 rounded-2xl px-6 py-4 text-sm font-black transition-all duration-300",
                pathname === item.href 
                    ? "bg-primary text-white shadow-xl shadow-primary/20 translate-x-2" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="tracking-tight">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-10 border-t border-black/5">
             {!isAuthorized && (
                <div className="p-4 bg-destructive/10 rounded-2xl mb-4">
                    <p className="text-[10px] font-black text-destructive uppercase tracking-widest leading-relaxed">
                        Security Warning: Restricted Data Access. Please Login as Master.
                    </p>
                </div>
             )}
             <Button variant="outline" asChild className="w-full justify-start rounded-2xl h-14 font-black border-black/10 hover:bg-muted transition-all">
                <Link href="/" target="_blank">
                    <ExternalLink className="mr-4 h-5 w-5" /> Live Site
                </Link>
             </Button>
             <Button variant="ghost" asChild className="w-full justify-start rounded-2xl h-14 font-black text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
                <Link href="/my-bookings">
                    <LogOut className="mr-4 h-5 w-5" /> Exit Console
                </Link>
             </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-16 max-w-[1800px]">
        {children}
      </main>
    </div>
  );
}