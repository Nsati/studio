
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './Logo';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
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

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Explore Hotels' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, login, logout, isLoading } = useUser();

  const handleLogin = () => {
    // Mock login with a sample user
    login({
      id: 'u1', // This ID exists in bookingsData
      displayName: 'Ankit Sharma',
      email: 'ankit.sharma@example.com',
      role: 'user',
    });
    toast({ title: 'Login Successful', description: 'Welcome back, Ankit!' });
  };

  const handleAdminLogin = () => {
    // Mock admin login
    login({
      id: 'admin-007',
      displayName: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
    });
    toast({ title: 'Admin Login Successful', description: 'Welcome, Admin!' });
  };


  const handleLogout = () => {
    logout();
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  };


  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
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
          {user?.role === 'admin' && ( // Show Admin link only if user is admin
            <Link
              href="/admin"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            {!isLoading && user ? (
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
               </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel>Login as...</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogin}>
                       User (Ankit)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAdminLogin}>
                       Admin
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  {user?.role === 'admin' && (
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
                     {!isLoading && user ? (
                        <Button onClick={() => { handleLogout(); setIsMenuOpen(false);}} className="w-full justify-start">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </Button>
                     ) : (
                        <div className="space-y-2">
                             <Button onClick={() => { handleLogin(); setIsMenuOpen(false); }} className="w-full justify-start">
                                Login as User
                            </Button>
                             <Button onClick={() => { handleAdminLogin(); setIsMenuOpen(false); }} className="w-full justify-start" variant="secondary">
                                Login as Admin
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
