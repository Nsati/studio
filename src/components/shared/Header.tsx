
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
  { href: '/search', label: 'HOTELS' },
  { href: '/tour-packages', label: 'EXPEDITIONS' },
  { href: '/blogs', label: 'JOURNAL' },
  { href: '/vibe-match', label: 'VIBE MATCH' },
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
    return <Skeleton className="h-10 w-10 rounded-full bg-white/5" />;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-auto rounded-full flex items-center gap-3 border border-white/10 hover:bg-white/5 px-2">
            <Avatar className="h-8 w-8">
               <AvatarImage src={user.photoURL || ''} alt={userProfile?.displayName || 'User'} />
              <AvatarFallback className="bg-primary text-background text-[10px] font-black">
                {userProfile?.displayName?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-black text-white hidden md:block uppercase tracking-widest">Protocol</span>
            <ChevronDown className="h-3 w-3 text-slate-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 mt-4 rounded-2xl shadow-2xl border-white/10 bg-slate-900 text-white" align="end">
          <DropdownMenuLabel className="font-normal p-6">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-black tracking-tight leading-none">{userProfile?.displayName}</p>
              <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/5" />
          <div className="p-2">
              {userProfile?.role === 'admin' && (
                <DropdownMenuItem className="cursor-pointer font-bold h-12 rounded-xl focus:bg-primary focus:text-background" onClick={() => router.push('/admin')}>
                  <LayoutDashboard className="mr-3 h-4 w-4" />
                  <span>ADMIN PANEL</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="cursor-pointer font-bold h-12 rounded-xl focus:bg-primary focus:text-background" onClick={() => router.push('/my-bookings')}>
                <Book className="mr-3 h-4 w-4" />
                <span>MY EXPEDITIONS</span>
              </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator className="bg-white/5" />
          <div className="p-2">
              <DropdownMenuItem className="cursor-pointer text-red-400 font-black h-12 rounded-xl focus:bg-red-500 focus:text-white" onClick={handleSignOut}>
                <LogOut className="mr-3 h-4 w-4" />
                <span>TERMINATE SESSION</span>
              </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/login" className="text-white/70 hover:text-white font-black text-[10px] tracking-widest uppercase hidden sm:block">
        Login
      </Link>
      <Button asChild className="bg-primary text-background hover:bg-white font-black text-[10px] tracking-[0.2em] rounded-full px-8 h-10 shadow-xl shadow-primary/20">
        <Link href="/signup">INITIALIZE</Link>
      </Button>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        isScrolled ? "bg-background/80 backdrop-blur-2xl border-b border-white/5 h-16" : "bg-transparent h-24"
      )}
    >
      <div className="container flex h-full items-center justify-between">
        <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-3 group">
                <Logo />
                <span className="font-heading text-xl md:text-2xl font-black text-white tracking-tighter uppercase group-hover:text-primary transition-colors">
                    TRIPZY
                </span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-10">
                {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                          "text-[10px] font-black tracking-[0.3em] transition-all",
                          pathname === link.href ? "text-primary" : "text-white/40 hover:text-white"
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
                    <Button variant="ghost" size="icon" className="text-white">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background border-l border-white/5 p-0">
                    <div className="h-full flex flex-col">
                        <div className="p-8 border-b border-white/5">
                            <Logo />
                        </div>
                        <nav className="flex-1 py-6">
                            {navLinks.map((link) => (
                              <SheetClose asChild key={link.href}>
                                <Link
                                  href={link.href}
                                  className={cn(
                                    "flex items-center justify-between p-8 font-black text-[11px] tracking-[0.4em] border-b border-white/5 uppercase",
                                    pathname === link.href ? "text-primary" : "text-white/60"
                                  )}
                                >
                                    <span>{link.label}</span>
                                </Link>
                              </SheetClose>
                            ))}
                        </nav>
                        <div className="p-8 bg-white/5 space-y-6">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Support Line</p>
                            <a href="tel:+916399902725" className="flex items-center gap-4 text-lg font-black text-primary">
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
