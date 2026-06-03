'use client';
import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, LayoutDashboard, Book, Menu, ShieldCheck, ChevronDown, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';

const navLinks = [
  { href: '/search', label: 'Hotels' },
  { href: '/tour-packages', label: 'Vacations' },
  { href: '/blogs', label: 'Guides' },
  { href: '/vibe-match', label: 'Vibe Match' },
];

function UserNav() {
  const { user, userProfile, isLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-auto rounded-full flex items-center gap-2 border hover:bg-slate-50 px-2">
            <Avatar className="h-8 w-8">
               <AvatarImage src={user.photoURL || ''} alt={userProfile?.displayName || 'User'} />
              <AvatarFallback className="bg-primary text-white text-[10px] font-bold">
                {userProfile?.displayName?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-bold text-slate-700 hidden md:block">Account</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 mt-2 rounded-xl shadow-xl border-slate-100 bg-white" align="end">
          <DropdownMenuLabel className="font-normal px-4 py-3">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-bold leading-none">{userProfile?.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground mt-1">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {userProfile?.role === 'admin' && (
            <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => router.push('/admin')}>
              <LayoutDashboard className="mr-3 h-4 w-4 text-primary" />
              <span>Admin Panel</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => router.push('/my-bookings')}>
            <Book className="mr-3 h-4 w-4 text-primary" />
            <span>My Trips</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-destructive font-bold" onClick={handleSignOut}>
            <LogOut className="mr-3 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="ghost" className="text-slate-700 hover:text-primary font-bold text-sm hidden sm:flex">
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild className="bg-primary text-white hover:bg-blue-700 font-bold text-sm rounded-full px-6 shadow-md shadow-blue-200">
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm h-16" : "bg-transparent h-20"
      )}
    >
      <div className="container flex h-full items-center justify-between">
        <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
                <Logo />
                <span className="font-heading text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    Tripzy
                </span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-6">
                {navLinks.map((link) => (
                    <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "text-sm font-bold transition-all",
                        pathname === link.href ? "text-primary" : "text-slate-600 hover:text-primary"
                    )}
                    >
                    {link.label}
                    </Link>
                ))}
            </nav>
        </div>

        <div className="flex items-center gap-4">
          <UserNav />
           <div className="lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-900">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-white border-0 p-0">
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b">
                            <Logo />
                        </div>
                        <nav className="flex-1 py-4">
                            {navLinks.map((link) => (
                              <SheetClose asChild key={link.href}>
                                <Link
                                  href={link.href}
                                  className={cn(
                                    "flex items-center justify-between p-6 font-bold text-xl border-b border-slate-50",
                                    pathname === link.href ? "text-primary" : "text-slate-700"
                                  )}
                                >
                                    <span>{link.label}</span>
                                </Link>
                              </SheetClose>
                            ))}
                        </nav>
                        <div className="p-6 bg-slate-50 space-y-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Support</p>
                            <a href="tel:+916399902725" className="flex items-center gap-3 text-lg font-bold text-primary">
                                <Phone className="h-5 w-5" /> +91 6399902725
                            </a>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
           </div>
        </div>
      </div>
    </header>
  );
}
