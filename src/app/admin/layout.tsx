'use client';
import { useUser } from '@/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Hotel, Users2, Tag, LogOut, ExternalLink, Map, BookOpen, Menu } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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
            <aside className="hidden md:block w-72 border-r p-8 space-y-8 bg-white">
                <Skeleton className="h-12 w-48 rounded-2xl" />
                <div className="space-y-4 pt-10">
                    {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-2xl" />)}
                </div>
            </aside>
            <main className="flex-1 p-6 md:p-12">
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
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=' + pathname);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return <AdminLayoutSkeleton />;
  }

  if (!user) return null;

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="space-y-2">
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
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
  );

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <LayoutDashboard className="h-5 w-5" />
            </div>
            <span className="font-black text-sm uppercase tracking-widest">Console</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
                <SheetHeader className="p-8 border-b text-left">
                    <SheetTitle className="font-black flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <LayoutDashboard className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span>Admin Panel</span>
                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Mobile Access</span>
                        </div>
                    </SheetTitle>
                </SheetHeader>
                <div className="p-6">
                    <NavLinks onClick={() => setIsOpen(false)} />
                    <div className="mt-8 pt-8 border-t space-y-4">
                        <Button variant="outline" asChild className="w-full justify-start rounded-xl font-black h-12">
                            <Link href="/"><ExternalLink className="mr-3 h-4 w-4" /> Site</Link>
                        </Button>
                        <Button variant="ghost" asChild className="w-full justify-start rounded-xl font-black text-destructive h-12">
                            <Link href="/my-bookings"><LogOut className="mr-3 h-4 w-4" /> Exit</Link>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-80 flex-col border-r bg-white p-8 sticky top-0 h-screen overflow-y-auto">
        <div className="mb-16 flex items-center gap-4 group">
            <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <LayoutDashboard className="h-7 w-7" />
            </div>
            <div className="space-y-0.5">
                <h2 className="text-xl font-black tracking-tight leading-none text-foreground">Console</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Superuser Mode</p>
            </div>
        </div>

        <div className="flex-1">
            <NavLinks />
        </div>

        <div className="mt-auto space-y-4 pt-10 border-t border-black/5">
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
      <main className="flex-1 p-4 md:p-8 lg:p-16 max-w-[1800px] mt-16 md:mt-0">
        {children}
      </main>
    </div>
  );
}
