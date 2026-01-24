'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UserCircle, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './Logo';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { signOut } from 'firebase/auth';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Hotels' },
  { href: '/tour-packages', label: 'Tour Packages' },
  { href: '/my-bookings', label: 'My Bookings' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, isLoading } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === link.href ? 'text-primary font-semibold' : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-primary" />
                  {userProfile?.displayName || user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-bookings">My Bookings</Link>
                </DropdownMenuItem>
                {userProfile?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button asChild variant="outline">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                 <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <div className="p-4">
                <Logo />
                <div className="mt-10 flex flex-col gap-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={`mobile-${link.href}`}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        'text-lg font-medium transition-colors hover:text-primary',
                        pathname === link.href ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                 <div className="mt-8 border-t pt-6">
                    {isLoading ? <Skeleton className="h-10 w-full" /> : user ? (
                       <div className="flex flex-col gap-4">
                           <p className="text-lg font-medium">{userProfile?.displayName || user.email}</p>
                           <Link href="/my-bookings" onClick={() => setIsMenuOpen(false)} className="text-base text-muted-foreground">My Bookings</Link>
                            {userProfile?.role === 'admin' && (
                                <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="text-base text-muted-foreground">Admin Dashboard</Link>
                            )}
                           <Button onClick={() => { handleLogout(); setIsMenuOpen(false); }} variant="outline">Logout</Button>
                       </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <Button onClick={() => { router.push('/login'); setIsMenuOpen(false); }}>Log In</Button>
                            <Button onClick={() => { router.push('/signup'); setIsMenuOpen(false); }} variant="outline">Sign Up</Button>
                        </div>
                    )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
