'use client';
import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, LayoutDashboard, Book, Menu, HelpCircle, Globe, Video } from 'lucide-react';
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
import React from 'react';
import { Logo } from './Logo';

const navLinks = [
  { href: '/search', label: 'Stays' },
  { href: '/tour-packages', label: 'Tours' },
  { href: '/blogs', label: 'Blogs' },
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
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-white/20">
            <Avatar className="h-10 w-10">
               <AvatarImage src={user.photoURL || ''} alt={userProfile?.displayName || 'User'} />
              <AvatarFallback className="bg-accent text-xs font-black text-white">
                {userProfile?.displayName?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 mt-2 rounded-[2rem] p-4 shadow-2xl border-black/5" align="end">
          <DropdownMenuLabel className="font-normal px-3 py-4">
            <div className="flex flex-col space-y-1">
              <p className="text-base font-black leading-none text-slate-900">{userProfile?.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground mt-1">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-2" />
          {userProfile?.role === 'admin' && (
            <DropdownMenuItem className="cursor-pointer rounded-xl h-12 font-bold" onClick={() => router.push('/admin')}>
              <LayoutDashboard className="mr-3 h-4 w-4 text-primary" />
              <span>Admin Extranet</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="cursor-pointer rounded-xl h-12 font-bold" onClick={() => router.push('/my-bookings')}>
            <Book className="mr-3 h-4 w-4 text-primary" />
            <span>My Collection</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive font-black h-12 rounded-xl" onClick={handleSignOut}>
            <LogOut className="mr-3 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="ghost" className="text-white hover:bg-white/10 font-black text-[11px] uppercase tracking-widest hidden sm:flex">
        <Link href="/login">Partner Access</Link>
      </Button>
      <Button asChild className="bg-white text-primary hover:bg-white/90 font-black text-[11px] uppercase tracking-widest rounded-full px-6 shadow-xl">
        <Link href="/signup">Join Harrier</Link>
      </Button>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-0 w-full bg-primary py-4 border-b border-white/10 shadow-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3 group">
                <Logo />
                <span className="font-heading text-2xl md:text-3xl font-bold text-white tracking-tighter transition-transform group-hover:scale-105 uppercase">
                    Northern <span className="text-accent">Harrier</span>
                </span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-2">
                {navLinks.map((link) => (
                    <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em] text-white px-5 py-2.5 rounded-full transition-all border border-transparent",
                        pathname === link.href ? "bg-white/20 border-white/20 shadow-inner" : "hover:bg-white/10"
                    )}
                    >
                    {link.label}
                    </Link>
                ))}
            </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full hidden md:flex">
            <Globe className="h-5 w-5" />
          </Button>
          <UserNav />
           <div className="lg:hidden ml-2">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-primary text-white border-0">
                    <nav className="grid gap-6 mt-16">
                        {navLinks.map((link) => (
                          <SheetClose asChild key={link.href}>
                            <Link
                              href={link.href}
                              className={cn(
                                "p-6 font-black text-2xl border-b border-white/10 uppercase tracking-widest italic",
                                pathname === link.href ? "bg-white/10 text-accent" : ""
                              )}
                            >
                                {link.label}
                            </Link>
                          </SheetClose>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
           </div>
        </div>
      </div>
    </header>
  );
}
