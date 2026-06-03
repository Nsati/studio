
'use client';
import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, LayoutDashboard, Book, Menu, ShieldCheck, ChevronDown, Phone, Globe } from 'lucide-react';
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
          <Button variant="ghost" className="relative h-11 w-auto rounded-full flex items-center gap-3 border border-white/10 hover:bg-white/5 px-2">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20">
               <AvatarImage src={user.photoURL || ''} alt={userProfile?.displayName || 'User'} />
              <AvatarFallback className="bg-primary text-background text-[10px] font-black">
                {userProfile?.displayName?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-black text-white hidden lg:block uppercase tracking-[0.2em] ml-1">Explorer Console</span>
            <ChevronDown className="h-3 w-3 text-slate-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 mt-4 rounded-2xl shadow-2xl border-white/10 bg-slate-950 text-white" align="end">
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
    <div className="flex items-center gap-6">
      <Link href="/login" className="text-white/60 hover:text-white font-black text-[10px] tracking-widest uppercase hidden sm:block transition-colors">
        Login
      </Link>
      <Button asChild className="bg-primary text-background hover:bg-white font-black text-[10px] tracking-[0.3em] rounded-full px-10 h-11 shadow-xl shadow-primary/20">
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
        "fixed top-0 z-50 w-full transition-all duration-700",
        isScrolled ? "bg-background/90 backdrop-blur-3xl border-b border-white/5 h-20" : "bg-transparent h-32"
      )}
    >
      <div className="container flex h-full items-center justify-between">
        <div className="flex items-center gap-16">
            <Link href="/" className="flex items-center gap-4 group">
                <Logo />
                <span className="font-heading text-2xl md:text-3xl font-black text-white tracking-tighter uppercase group-hover:text-primary transition-all duration-500">
                    TRIPZY
                </span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-12">
                {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                          "text-[11px] font-black tracking-[0.4em] transition-all relative py-2",
                          pathname === link.href ? "text-primary" : "text-white/40 hover:text-white"
                      )}
                    >
                      {link.label}
                      {pathname === link.href && (
                          <motion.div layoutId="nav-underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                      )}
                    </Link>
                ))}
            </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 text-white/30 font-black text-[9px] uppercase tracking-widest border-r border-white/10 pr-6">
            <Globe className="h-3 w-3" /> Uttarakhand Node
          </div>
          <UserNav />
           <div className="lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white h-12 w-12 hover:bg-white/5 rounded-full">
                        <Menu className="h-8 w-8" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background border-l border-white/5 p-0">
                    <div className="h-full flex flex-col">
                        <div className="p-10 border-b border-white/5 flex items-center justify-center">
                            <Logo />
                        </div>
                        <nav className="flex-1 py-10">
                            {navLinks.map((link) => (
                              <SheetClose asChild key={link.href}>
                                <Link
                                  href={link.href}
                                  className={cn(
                                    "flex items-center justify-between px-10 py-8 font-black text-[12px] tracking-[0.5em] border-b border-white/5 uppercase transition-all",
                                    pathname === link.href ? "text-primary bg-primary/5" : "text-white/60 hover:text-white"
                                  )}
                                >
                                    <span>{link.label}</span>
                                </Link>
                              </SheetClose>
                            ))}
                        </nav>
                        <div className="p-10 bg-white/5 space-y-8">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Support</p>
                            <a href="tel:+916399902725" className="flex items-center gap-4 text-xl font-black text-primary hover:text-white transition-colors">
                                <Phone className="h-6 w-6" /> +91 6399902725
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
