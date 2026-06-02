'use client';
import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, LayoutDashboard, Book, Menu, ShieldCheck, ChevronRight, Phone } from 'lucide-react';
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
  { href: '/search', label: 'Stays' },
  { href: '/tour-packages', label: 'Expeditions' },
  { href: '/blogs', label: 'Journal' },
  { href: '/vibe-match', label: 'Vibe Match™' },
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
    return <Skeleton className="h-8 w-8 rounded-full bg-white/10" />;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-12 w-12 rounded-full ring-2 ring-primary/20 hover:ring-primary transition-all">
            <Avatar className="h-12 w-12">
               <AvatarImage src={user.photoURL || ''} alt={userProfile?.displayName || 'User'} />
              <AvatarFallback className="bg-primary text-background font-black text-xs">
                {userProfile?.displayName?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 mt-4 rounded-[2rem] p-4 shadow-2xl border-white/5 bg-background/95 backdrop-blur-xl" align="end">
          <DropdownMenuLabel className="font-normal px-3 py-4">
            <div className="flex flex-col space-y-1">
              <p className="text-base font-black leading-none text-white">{userProfile?.displayName}</p>
              <p className="text-xs leading-none text-white/40 mt-1">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-2 bg-white/5" />
          {userProfile?.role === 'admin' && (
            <DropdownMenuItem className="cursor-pointer rounded-xl h-12 font-bold hover:bg-primary/10 focus:bg-primary/10" onClick={() => router.push('/admin')}>
              <LayoutDashboard className="mr-3 h-4 w-4 text-primary" />
              <span>Admin Dashboard</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="cursor-pointer rounded-xl h-12 font-bold hover:bg-primary/10 focus:bg-primary/10" onClick={() => router.push('/my-bookings')}>
            <Book className="mr-3 h-4 w-4 text-primary" />
            <span>My Bookings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-2 bg-white/5" />
          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive font-black h-12 rounded-xl" onClick={handleSignOut}>
            <LogOut className="mr-3 h-4 w-4" />
            <span>Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="ghost" className="text-white hover:bg-white/10 font-black text-[11px] uppercase tracking-widest hidden sm:flex px-6 h-12 rounded-full">
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild className="bg-primary text-background hover:bg-primary/90 font-black text-[11px] uppercase tracking-widest rounded-full px-8 h-12 shadow-xl shadow-primary/20">
        <Link href="/signup">Join Harrier</Link>
      </Button>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full py-6 transition-all duration-500",
        isVisible ? "translate-y-0" : "-translate-y-full",
        lastScrollY > 50 ? "bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-2xl" : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-3 group">
                <Logo />
                <span className="font-heading text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
                    Northern <span className="text-primary">Harrier</span>
                </span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-2">
                {navLinks.map((link) => (
                    <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "text-[10px] font-black uppercase tracking-[0.3em] text-white/50 px-5 py-2.5 rounded-full transition-all border border-transparent",
                        pathname === link.href ? "text-primary bg-white/5 border-white/5" : "hover:text-white hover:bg-white/5"
                    )}
                    >
                    {link.label}
                    </Link>
                ))}
            </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 text-[9px] font-black text-primary uppercase tracking-widest mr-4">
             <ShieldCheck className="h-3.5 w-3.5" /> Elite Access Verified
          </div>
          <UserNav />
           <div className="lg:hidden ml-2">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-12 w-12">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background text-white border-0 p-0 overflow-hidden">
                    <div className="h-full flex flex-col bg-slate-900">
                        <div className="p-8 border-b border-white/5">
                            <Logo />
                        </div>
                        <nav className="flex-1 overflow-y-auto py-8">
                            {navLinks.map((link) => (
                              <SheetClose asChild key={link.href}>
                                <Link
                                  href={link.href}
                                  className={cn(
                                    "flex items-center justify-between p-8 font-black text-3xl border-b border-white/5 uppercase tracking-tighter transition-all group",
                                    pathname === link.href ? "text-primary bg-white/5" : "text-white/40 hover:text-white"
                                  )}
                                >
                                    <span>{link.label}</span>
                                    <ChevronRight className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                              </SheetClose>
                            ))}
                        </nav>
                        <div className="p-8 bg-white/5 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Need Assistance?</p>
                            <a href="tel:+916399902725" className="flex items-center gap-3 text-xl font-black text-white">
                                <Phone className="h-5 w-5 text-primary" /> +91 6399902725
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