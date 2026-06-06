'use client';
import { useUser } from '@/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Hotel, Users2, Tag, LogOut, ExternalLink, BookOpen, Menu, LayoutDashboard, MapPin, X, Mountain } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Logo } from '@/components/shared/Logo';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
    { href: '/admin/hotels', label: 'Properties', icon: Hotel },
    { href: '/admin/tour-packages', label: 'Tour Packages', icon: MapPin },
    { href: '/admin/users', label: 'Members', icon: Users2 },
    { href: '/admin/promotions', label: 'Coupons', icon: Tag },
];

function AdminLayoutSkeleton() {
    return (
        <div className="flex min-h-screen bg-muted/20">
            <aside className="hidden md:block w-72 border-r bg-white">
                <div className="p-8 space-y-8">
                    <Skeleton className="h-10 w-40" />
                    <div className="space-y-4">
                        {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                    </div>
                </div>
            </aside>
            <main className="flex-1 p-10">
                <Skeleton className="h-full w-full rounded-3xl" />
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

  if (isLoading) return <AdminLayoutSkeleton />;
  if (!user || userProfile?.role !== 'admin') return null;

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="space-y-1 px-3">
      {navItems.map(item => {
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-4 px-5 py-4 text-xs font-black uppercase tracking-widest transition-all rounded-2xl",
              isActive 
                  ? "bg-primary text-white shadow-xl" 
                  : "text-slate-500 hover:bg-primary/5 hover:text-primary"
            )}
          >
            <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#fcfcfc] selection:bg-accent selection:text-white">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-primary z-[100] px-6 flex items-center justify-between shadow-lg">
        <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center text-accent"><Mountain className="h-4 w-4" /></div>
            <span className="text-white text-xs font-black tracking-tighter uppercase">Admin Panel</span>
        </Link>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-0 bg-white shadow-2xl rounded-r-[2.5rem] overflow-hidden">
                <SheetHeader className="p-8 bg-primary text-white text-left relative">
                    <SheetTitle className="text-white font-black uppercase tracking-widest text-lg">System Console</SheetTitle>
                    <SheetClose className="absolute right-6 top-8 text-white/50 hover:text-white"><X className="h-6 w-6" /></SheetClose>
                </SheetHeader>
                <div className="py-8">
                    <NavLinks onClick={() => setIsOpen(false)} />
                </div>
            </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r bg-white sticky top-0 h-screen shadow-sm">
        <div className="p-8 border-b bg-primary/5">
            <Link href="/" className="flex items-center gap-3 group">
                <Logo />
                <div className="flex flex-col">
                  <span className="text-primary text-sm font-black tracking-tighter uppercase leading-none">Northern Harrier</span>
                  <span className="text-[7px] font-black uppercase text-accent tracking-[0.3em] mt-1">Cloud Interface</span>
                </div>
            </Link>
        </div>

        <div className="flex-1 py-10 overflow-y-auto">
            <NavLinks />
        </div>

        <div className="mt-auto p-6 space-y-4">
             <div className="p-5 bg-muted/30 rounded-[1.5rem] border border-black/5">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Overseer</p>
                <p className="text-[10px] font-black truncate text-primary uppercase">{userProfile?.displayName}</p>
             </div>
             <Button variant="outline" asChild className="w-full justify-start rounded-2xl h-12 text-[9px] font-black uppercase tracking-widest border-black/5 hover:bg-primary hover:text-white transition-all">
                <Link href="/" target="_blank"><ExternalLink className="mr-3 h-4 w-4" /> Live Portal</Link>
             </Button>
             <Button variant="ghost" asChild className="w-full justify-start rounded-2xl h-12 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50">
                <Link href="/my-bookings"><LogOut className="mr-3 h-4 w-4" /> Logout</Link>
             </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
            {children}
        </div>
      </main>
    </div>
  );
}
