'use client';
import { useUser } from '@/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Hotel, Users2, Tag, LogOut, ExternalLink, BookOpen, Menu, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/bookings', label: 'Reservations', icon: BookOpen },
    { href: '/admin/hotels', label: 'Properties', icon: Hotel },
    { href: '/admin/users', label: 'Users', icon: Users2 },
    { href: '/admin/promotions', label: 'Coupons', icon: Tag },
];

function AdminLayoutSkeleton() {
    return (
        <div className="flex min-h-screen bg-muted/20">
            <aside className="hidden md:block w-64 border-r bg-white">
                <div className="p-6 space-y-6">
                    <Skeleton className="h-8 w-32" />
                    <div className="space-y-2">
                        {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                </div>
            </aside>
            <main className="flex-1 p-8">
                <Skeleton className="h-full w-full rounded-lg" />
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
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || userProfile?.role !== 'admin')) {
      router.push('/login?redirect=' + pathname);
    }
  }, [user, userProfile, isLoading, router, pathname]);

  if (isLoading) {
    return <AdminLayoutSkeleton />;
  }

  if (!user || userProfile?.role !== 'admin') return null;

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="space-y-1">
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors",
            pathname === item.href 
                ? "bg-[#003580] text-white" 
                : "text-[#1a1a1a] hover:bg-muted"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#003580] z-50 px-4 flex items-center justify-between text-white">
        <span className="font-bold tracking-tight">Admin Console</span>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 border-0">
                <SheetHeader className="p-6 bg-[#003580] text-white">
                    <SheetTitle className="text-white">Management</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                    <NavLinks onClick={() => setIsOpen(false)} />
                </div>
            </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white sticky top-0 h-screen">
        <div className="p-6 border-b bg-[#003580]">
            <Link href="/" className="text-white text-xl font-bold tracking-tight block">
                Uttarakhand<span className="opacity-70">Getaways</span>
            </Link>
            <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-1">Admin Extranet</p>
        </div>

        <div className="flex-1 py-6 overflow-y-auto">
            <NavLinks />
        </div>

        <div className="mt-auto border-t p-4 space-y-4">
             <div className="px-4 py-2 bg-muted rounded-sm">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Active User</p>
                <p className="text-xs font-bold truncate">{userProfile?.displayName}</p>
             </div>
             <Button variant="outline" asChild className="w-full justify-start rounded-none h-10 text-xs font-bold">
                <Link href="/" target="_blank"><ExternalLink className="mr-2 h-4 w-4" /> Live Site</Link>
             </Button>
             <Button variant="ghost" asChild className="w-full justify-start rounded-none h-10 text-xs font-bold text-destructive hover:bg-destructive/5">
                <Link href="/my-bookings"><LogOut className="mr-2 h-4 w-4" /> Exit Portal</Link>
             </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
}