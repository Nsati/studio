'use client';
import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, LayoutDashboard, Book, Menu, ShieldCheck, ChevronDown, Phone, Globe, MessageSquare, Mountain } from 'lucide-react';
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
  { href: '/search', label: 'DESTINATIONS' },
  { href: '/tour-packages', label: 'PACKAGES' },
  { href: '/blogs', label: 'JOURNAL' },
  { href: '/vibe-match', label: 'VIBE MATCH' },
  { href: '/contact', label: 'REVIEWS' },
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
    return <Skeleton className="h-10 w-10 rounded-full bg-primary/10" />;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-11 w-auto rounded-full flex items-center gap-3 border border-border/10 hover:bg-primary/5 px-2">
            <Avatar className="h-9 w-9 ring-2 ring-accent/20">
               <AvatarImage src={user.photoURL || ''} alt={userProfile?.displayName || 'User'} />
              <AvatarFallback className="bg-primary text-white text-[10px] font-bold">
                {userProfile?.displayName?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-bold text-primary hidden lg:block uppercase tracking-widest ml-1">Account</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 mt-4 rounded-2xl shadow-2xl border-border/10 bg-white text-primary" align="end">
          <DropdownMenuLabel className="font-normal p-6">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-bold tracking-tight leading-none">{userProfile?.displayName}</p>
              <p className="text-[10px] font-medium text-slate-500 mt-2 uppercase tracking-widest">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-muted" />
          <div className="p-2">
              {userProfile?.role === 'admin' && (
                <DropdownMenuItem className="cursor-pointer font-bold h-12 rounded-xl focus:bg-primary focus:text-white" onClick={() => router.push('/admin')}>
                  <LayoutDashboard className="mr-3 h-4 w-4" />
                  <span>ADMIN PANEL</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="cursor-pointer font-bold h-12 rounded-xl focus:bg-primary focus:text-white" onClick={() => router.push('/my-bookings')}>
                <Book className="mr-3 h-4 w-4" />
                <span>MY JOURNEYS</span>
              </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator className="bg-muted" />
          <div className="p-2">
              <DropdownMenuItem className="cursor-pointer text-red-600 font-bold h-12 rounded-xl focus:bg-red-50 focus:text-red-700" onClick={handleSignOut}>
                <LogOut className="mr-3 h-4 w-4" />
                <span>LOGOUT</span>
              </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <Link href="/login" className="text-primary font-bold text-[10px] tracking-widest uppercase hidden sm:block hover:text-accent transition-colors">
        Login
      </Link>
      <Button asChild className="bg-accent text-accent-foreground hover:bg-primary hover:text-white font-bold text-[10px] tracking-widest rounded-full px-8 h-10 shadow-lg shadow-accent/20">
        <Link href="/signup">SIGN UP</Link>
      </Button>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        isScrolled ? "bg-background/90 backdrop-blur-xl border-b border-muted/50 h-16" : "bg-transparent h-24"
      )}
    >
      <div className="container flex h-full items-center justify-between">
        <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-accent shadow-lg group-hover:rotate-12 transition-transform">
                   <Mountain className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading text-xl md:text-2xl font-bold text-primary tracking-tighter uppercase group-hover:text-accent transition-all">
                      NORTHERN <span className="text-accent italic font-spiritual capitalize">HARRIER</span>
                  </span>
                  {!isScrolled && <span className="text-[7px] font-black uppercase text-white/60 tracking-[0.4em] -mt-1 ml-0.5">Uttarakhand Specialists</span>}
                </div>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-8">
                {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                          "text-[10px] font-bold tracking-widest transition-all relative py-2 uppercase",
                          pathname === link.href ? "text-accent border-b-2 border-accent" : (isScrolled ? "text-primary/70 hover:text-accent" : "text-white/70 hover:text-accent")
                      )}
                    >
                      {link.label}
                    </Link>
                ))}
            </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className={cn("hidden lg:flex items-center gap-2 font-bold text-[9px] uppercase tracking-widest border-r pr-6", isScrolled ? "text-primary/40 border-muted" : "text-white/40 border-white/10")}>
            <Phone className="h-3 w-3" /> +91-XXXXXXXXXX
          </div>
          <UserNav />
           <div className="lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className={cn("h-10 w-10 hover:bg-primary/5 rounded-full", isScrolled ? "text-primary" : "text-white")}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background border-l border-muted/50 p-0">
                    <div className="h-full flex flex-col">
                        <div className="p-10 border-b border-muted/50 flex items-center justify-center bg-primary/10">
                            <Logo />
                        </div>
                        <nav className="flex-1 py-6">
                            {navLinks.map((link) => (
                              <SheetClose asChild key={link.href}>
                                <Link
                                  href={link.href}
                                  className={cn(
                                    "flex items-center justify-between px-8 py-6 font-bold text-[12px] tracking-widest border-b border-muted/20 uppercase transition-all",
                                    pathname === link.href ? "text-accent bg-accent/5" : "text-primary/70 hover:bg-muted"
                                  )}
                                >
                                    <span>{link.label}</span>
                                </Link>
                              </SheetClose>
                            ))}
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
           </div>
        </div>
      </div>
    </header>
  );
}