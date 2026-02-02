'use client';
import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, LayoutDashboard, Book, Menu, Sparkles, HelpCircle, Phone } from 'lucide-react';
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
import { Logo } from './Logo';
import React from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Hotels' },
  { href: '/tour-packages', label: 'Tours' },
  { href: '/vibe-match', label: 'Vibe Match™', premium: true },
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
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary/20">
            <Avatar className="h-9 w-9">
               <AvatarImage src={user.photoURL || ''} alt={userProfile?.displayName || 'User'} />
              <AvatarFallback className="bg-muted text-xs font-black">
                {userProfile?.displayName?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 mt-2 rounded-2xl p-2" align="end">
          <DropdownMenuLabel className="font-normal px-3 py-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none">{userProfile?.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {userProfile?.role === 'admin' && (
            <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => router.push('/admin')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => router.push('/my-bookings')}>
            <Book className="mr-2 h-4 w-4" />
            <span>My Bookings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="rounded-lg cursor-pointer text-destructive focus:text-destructive font-bold" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild className="rounded-full px-6 font-bold text-xs uppercase tracking-widest hidden sm:flex">
        <Link href="/login">Log in</Link>
      </Button>
      <Button asChild className="rounded-full px-6 bg-primary hover:bg-primary/90 shadow-sm font-bold text-xs uppercase tracking-widest">
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2 group">
                <Logo />
                <span className="font-heading text-xl font-bold tracking-tight hidden lg:block">
                    Uttarakhand Getaways
                </span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => (
                    <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-200",
                        pathname === link.href
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        link.premium && "text-accent bg-accent/5 hover:bg-accent/10 ml-2"
                    )}
                    >
                    <span className="flex items-center gap-1.5">
                        {link.premium && <Sparkles className="h-3.5 w-3.5" />}
                        {link.label}
                    </span>
                    </Link>
                ))}
            </nav>
        </div>

        <div className="flex items-center gap-2 lg:gap-6">
          <Link href="/contact" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            <HelpCircle className="h-4 w-4" />
            Help
          </Link>
          <div className="h-4 w-px bg-black/10 hidden md:block" />
          <UserNav />
           <div className="lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="rounded-l-[2rem]">
                    <nav className="grid gap-4 text-lg font-medium mt-12">
                        {navLinks.map((link) => (
                          <SheetClose asChild key={link.href}>
                            <Link
                              href={link.href}
                              className={cn(
                                "p-4 rounded-2xl transition-all font-black uppercase text-xs tracking-widest flex items-center gap-3",
                                pathname === link.href ? "bg-primary/5 text-primary" : "hover:bg-muted"
                              )}
                            >
                                {link.premium && <Sparkles className="h-4 w-4 text-accent" />}
                                {link.label}
                            </Link>
                          </SheetClose>
                        ))}
                        <SheetClose asChild>
                            <Link href="/contact" className="p-4 rounded-2xl transition-all font-black uppercase text-xs tracking-widest flex items-center gap-3 mt-4 text-muted-foreground">
                                <Phone className="h-4 w-4" /> Help & Support
                            </Link>
                        </SheetClose>
                    </nav>
                </SheetContent>
            </Sheet>
           </div>
        </div>
      </div>
    </header>
  );
}
