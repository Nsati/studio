'use client';
import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, LayoutDashboard, Book, Menu, ChevronDown, Phone, Mountain, Sparkles } from 'lucide-react';
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
  { href: '/search', label: 'Destinations' },
  { href: '/tour-packages', label: 'Packages' },
  { href: '/blogs', label: 'Journal' },
  { href: '/vibe-match', label: 'Vibe Match' },
  { href: '/contact', label: 'Support' },
];

function UserNav({ isScrolled }: { isScrolled: boolean }) {
  const { user, userProfile, isLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-24 rounded-full bg-white/10" />;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn(
            "relative h-11 w-auto rounded-full flex items-center gap-3 border transition-all px-2 pr-4 group overflow-hidden",
            isScrolled 
              ? "border-primary/10 hover:bg-primary/5 hover:border-primary/30" 
              : "border-white/20 hover:bg-white/10 bg-black/30 backdrop-blur-md"
          )}>
            <Avatar className="h-8 w-8 ring-2 ring-accent/20 group-hover:scale-110 transition-transform duration-500">
               <AvatarImage src={user.photoURL || ''} alt={userProfile?.displayName || 'User'} />
              <AvatarFallback className="bg-primary text-white text-[10px] font-bold">
                {userProfile?.displayName?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest leading-none",
                  isScrolled ? "text-primary" : "text-white"
                )}>Explorer</span>
                <span className={cn(
                  "text-[10px] font-bold truncate max-w-[80px]",
                  isScrolled ? "text-primary/60" : "text-white/70"
                )}>{userProfile?.displayName?.split(' ')[0]}</span>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 mt-4 rounded-[1.5rem] shadow-2xl border-border/10 bg-white p-2" align="end">
          <DropdownMenuLabel className="font-normal p-4 pb-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-black text-primary uppercase tracking-tight">{userProfile?.displayName}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-2 bg-muted/50" />
          <div className="space-y-1">
              {userProfile?.role === 'admin' && (
                <DropdownMenuItem className="cursor-pointer font-bold h-12 rounded-xl focus:bg-primary focus:text-white gap-3 px-4" onClick={() => router.push('/admin')}>
                  <LayoutDashboard className="h-4 w-4 text-accent" />
                  <span className="text-xs uppercase tracking-widest">Admin Command</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="cursor-pointer font-bold h-12 rounded-xl focus:bg-primary focus:text-white gap-3 px-4" onClick={() => router.push('/my-bookings')}>
                <Book className="h-4 w-4 text-accent" />
                <span className="text-xs uppercase tracking-widest">My Journeys</span>
              </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator className="my-2 bg-muted/50" />
          <DropdownMenuItem className="cursor-pointer text-red-600 font-bold h-12 rounded-xl focus:bg-red-50 focus:text-red-700 gap-3 px-4" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest">Secure Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/login" className={cn(
        "font-black text-[10px] tracking-[0.2em] uppercase hidden sm:block hover:text-accent transition-colors relative py-1 group",
        isScrolled ? "text-primary" : "text-white"
      )}>
        Login
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
      </Link>
      <Button asChild className="bg-accent text-accent-foreground hover:bg-primary hover:text-white font-black text-[10px] tracking-widest rounded-full px-8 h-11 shadow-lg shadow-accent/10 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 saffron-glow">
        <Link href="/signup">SIGN UP</Link>
      </Button>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showSolidBackground = isScrolled || !isHomePage;

  return (
    <header 
      className={cn(
        "fixed top-0 z-[100] w-full transition-all duration-700 ease-in-out",
        showSolidBackground 
          ? "bg-white/95 backdrop-blur-xl border-b border-black/5 h-16 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)]" 
          : "bg-transparent h-24"
      )}
    >
      <div className="container flex h-full items-center justify-between">
        <div className="flex items-center gap-12 lg:gap-16">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-accent shadow-xl group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-500 ring-2 ring-white/10 group-hover:shadow-accent/20">
                   <Mountain className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "font-heading text-xl md:text-2xl font-black tracking-tighter uppercase transition-all duration-300",
                    showSolidBackground ? "text-primary" : "text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]",
                    "group-hover:text-accent"
                  )}>
                      NORTHERN <span className="text-accent italic font-spiritual capitalize">HARRIER</span>
                  </span>
                  {!showSolidBackground && (
                    <span className="text-[7px] font-black uppercase text-white/70 tracking-[0.4em] -mt-1 ml-0.5 animate-in fade-in slide-in-from-left-2 duration-1000">
                      Himalayan Specialists
                    </span>
                  )}
                </div>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-10">
                {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                          "text-[10px] font-black tracking-[0.2em] transition-all relative py-2 uppercase group",
                          pathname === link.href 
                            ? "text-accent" 
                            : (showSolidBackground ? "text-primary/70 hover:text-accent" : "text-white drop-shadow-md hover:text-accent")
                      )}
                    >
                      {link.label}
                      <span className={cn(
                        "absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-500 ease-out",
                        pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                      )} />
                    </Link>
                ))}
            </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className={cn(
            "hidden lg:flex items-center gap-3 font-black text-[9px] uppercase tracking-widest border-r pr-8 transition-opacity duration-300",
            showSolidBackground ? "text-primary/40 border-muted" : "text-white/60 border-white/10",
            !showSolidBackground && "opacity-80"
          )}>
            <div className="p-1.5 bg-accent/10 rounded-full">
              <Phone className="h-3 w-3 text-accent" />
            </div>
            <span className="hover:text-accent cursor-pointer transition-colors">+91-6399902725</span>
          </div>
          
          <UserNav isScrolled={showSolidBackground} />
          
           <div className="lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className={cn("h-11 w-11 hover:bg-white/10 rounded-full transition-all active:scale-90", showSolidBackground ? "text-primary" : "text-white")}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background border-l border-muted/50 p-0 overflow-hidden rounded-l-[2.5rem]">
                    <div className="h-full flex flex-col">
                        <div className="p-12 border-b border-muted/30 flex flex-col items-center justify-center bg-primary/5 gap-4">
                            <Logo />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Travel Protocol Desk</p>
                        </div>
                        <nav className="flex-1 py-8">
                            {navLinks.map((link) => (
                              <SheetClose asChild key={link.href}>
                                <Link
                                  href={link.href}
                                  className={cn(
                                    "flex items-center justify-between px-10 py-6 font-black text-xs tracking-[0.2em] border-b border-muted/10 uppercase transition-all group",
                                    pathname === link.href ? "text-accent bg-accent/5" : "text-primary/70 hover:bg-muted/30"
                                  )}
                                >
                                    <span>{link.label}</span>
                                    <ChevronDown className="h-4 w-4 -rotate-90 text-accent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0" />
                                </Link>
                              </SheetClose>
                            ))}
                        </nav>
                        <div className="p-10 bg-primary text-white space-y-4">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Emergency Liaison</p>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-accent" />
                                <span className="font-bold text-lg">+91-6399902725</span>
                            </div>
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
