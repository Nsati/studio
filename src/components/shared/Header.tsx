'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogIn, LogOut, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './Logo';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Explore Hotels' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      if (pathname.startsWith('/admin') || pathname.startsWith('/my-bookings')) {
          router.push('/');
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Logout Failed', description: 'An error occurred while logging out.' });
    }
  };


  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === link.href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
          {user && (
             <Link
              href="/my-bookings"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname.startsWith('/my-bookings') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              My Bookings
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            {!isUserLoading && user ? (
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                       {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || ''} />}
                       <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     {user.email === 'admin@example.com' && (
                        <DropdownMenuItem onClick={() => router.push('/admin')}>
                            Admin Dashboard
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
               </DropdownMenu>
            ) : (
             <div className="flex items-center gap-2">
                <Button asChild variant="ghost">
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button asChild>
                   <Link href="/signup">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Link>
                </Button>
             </div>
            )}
          </div>
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
                  {user && (
                    <Link
                        href="/my-bookings"
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                        'text-lg font-medium transition-colors hover:text-primary',
                        pathname.startsWith('/my-bookings') ? 'text-primary' : 'text-foreground'
                      )}
                    >
                        My Bookings
                    </Link>
                  )}
                  {user?.email === 'admin@example.com' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        'text-lg font-medium transition-colors hover:text-primary',
                        pathname.startsWith('/admin') ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="mt-6 pt-6 border-t">
                     {!isUserLoading && user ? (
                        <Button onClick={() => { handleLogout(); setIsMenuOpen(false);}} className="w-full justify-start">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </Button>
                     ) : (
                        <div className="space-y-2">
                             <Button asChild className="w-full justify-start">
                                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Login
                                </Link>
                            </Button>
                             <Button asChild variant="secondary" className="w-full justify-start">
                                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Sign Up
                                </Link>
                            </Button>
                        </div>
                     )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
