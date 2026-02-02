'use client';
import { useUser } from '@/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Hotel, Users2, Tag, LogOut, ExternalLink, BookOpen, Menu, ShieldCheck, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AdminCommandPalette } from '@/components/admin/AdminCommandPalette';

const navItems = [
    { href: '/admin', label: 'Intelligence', icon: Zap },
    { href: '/admin/bookings', label: 'Reservations', icon: BookOpen },
    { href: '/admin/hotels', label: 'Inventory', icon: Hotel },
    { href: '/admin/users', label: 'Explorers', icon: Users2 },
    { href: '/admin/promotions', label: 'Campaigns', icon: Tag },
];

function AdminLayoutSkeleton() {
    return (
        <div className="flex min-h-screen bg-muted/20">
            <aside className="hidden md:block w-80 border-r p-10 space-y-10 bg-white">
                <Skeleton className="h-14 w-56 rounded-2xl" />
                <div className="space-y-6 pt-12">
                    {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                </div>
            </aside>
            <main className="flex-1 p-10 md:p-20">
                <Skeleton className="h-full w-full rounded-[4rem]" />
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
    <nav className="space-y-3">
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
          className={cn(
            "flex items-center gap-5 rounded-[1.5rem] px-8 py-5 text-sm font-black transition-all duration-500",
            pathname === item.href 
                ? "bg-primary text-white shadow-2xl shadow-primary/30 -translate-y-0.5 scale-105" 
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
          )}
        >
          <item.icon className="h-5 w-5" />
          <span className="tracking-tight">{item.label}</span>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-muted/10">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-2xl border-b z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Zap className="h-6 w-6" />
            </div>
            <span className="font-black text-xs uppercase tracking-[0.2em]">GOD MODE</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-muted">
                    <Menu className="h-7 w-7" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] p-0 border-0 rounded-r-[3rem] overflow-hidden">
                <SheetHeader className="p-10 border-b bg-muted/10">
                    <SheetTitle className="font-black flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30">
                            <Zap className="h-7 w-7" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl">Console</span>
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin Access</span>
                        </div>
                    </SheetTitle>
                </SheetHeader>
                <div className="p-8">
                    <NavLinks onClick={() => setIsOpen(false)} />
                    <div className="mt-12 pt-10 border-t space-y-4">
                        <Button variant="outline" asChild className="w-full justify-start rounded-2xl font-black h-14 border-black/5 hover:bg-muted">
                            <Link href="/"><ExternalLink className="mr-4 h-5 w-5" /> Live Site</Link>
                        </Button>
                        <Button variant="ghost" asChild className="w-full justify-start rounded-2xl font-black text-destructive h-14 hover:bg-destructive/5">
                            <Link href="/my-bookings"><LogOut className="mr-4 h-5 w-5" /> Exit Console</Link>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-85 flex-col border-r bg-white p-10 sticky top-0 h-screen overflow-y-auto">
        <div className="mb-16 flex items-center gap-5 group">
            <div className="h-14 w-14 bg-primary rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-primary/30 transition-transform duration-500 group-hover:scale-110">
                <Zap className="h-8 w-8" />
            </div>
            <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tighter leading-none text-foreground">God-Mode</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground opacity-50">Operational Core</p>
            </div>
        </div>

        <div className="mb-12">
            <AdminCommandPalette />
        </div>

        <div className="flex-1">
            <NavLinks />
        </div>

        <div className="mt-auto space-y-6 pt-12 border-t border-black/5">
             <div className="p-6 bg-muted/30 rounded-[2rem] border border-black/5 mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Active Admin</span>
                </div>
                <p className="text-xs font-black text-foreground truncate">{userProfile?.displayName}</p>
             </div>
             <div className="flex flex-col gap-3">
                <Button variant="outline" asChild className="w-full justify-start rounded-2xl h-16 font-black border-black/10 hover:bg-muted transition-all text-xs">
                    <Link href="/" target="_blank">
                        <ExternalLink className="mr-4 h-5 w-5 opacity-50" /> Live Environment
                    </Link>
                </Button>
                <Button variant="ghost" asChild className="w-full justify-start rounded-2xl h-16 font-black text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all text-xs">
                    <Link href="/my-bookings">
                        <LogOut className="mr-4 h-5 w-5 opacity-50" /> Close Console
                    </Link>
                </Button>
             </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 lg:p-20 max-w-[1920px] mt-20 md:mt-0 overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full">
            {children}
        </div>
      </main>
    </div>
  );
}
