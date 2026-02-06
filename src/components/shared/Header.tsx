'use client';
import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, LayoutDashboard, Book, Menu, HelpCircle, Globe } from 'lucide-react';
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

const navLinks = [
  { href: '/search', label: 'Stays' },
  { href: '/tour-packages', label: 'Tours' },
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
          <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-2 ring-white/20">
            <Avatar className="h-8 w-8">
               <AvatarImage src={user.photoURL || ''} alt={userProfile?.displayName || 'User'} />
              <AvatarFallback className="bg-muted text-xs font-bold text-primary">
                {userProfile?.displayName?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 mt-2 rounded-lg p-2" align="end">
          <DropdownMenuLabel className="font-normal px-3 py-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none">{userProfile?.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {userProfile?.role === 'admin' && (
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/admin')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/my-bookings')}>
            <Book className="mr-2 h-4 w-4" />
            <span>My Bookings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive font-bold" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" asChild className="text-white hover:bg-white/10 font-bold text-sm hidden sm:flex">
        <Link href="/login">List your property</Link>
      </Button>
      <Button asChild className="bg-white text-primary hover:bg-white/90 font-bold text-sm rounded-none px-4">
        <Link href="/signup">Register</Link>
      </Button>
      <Button variant="ghost" asChild className="text-white hover:bg-white/10 font-bold text-sm rounded-none px-4 border border-white">
        <Link href="/login">Sign in</Link>
      </Button>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#003580] py-4 border-b border-white/10">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
                <span className="text-3xl font-black text-white tracking-tighter">
                    Trip<span className="text-[#febb02]">zy</span>
                </span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-4">
                {navLinks.map((link) => (
                    <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "text-sm font-semibold text-white px-4 py-2 rounded-full transition-all border border-transparent",
                        pathname === link.href ? "border-white bg-white/10" : "hover:bg-white/10"
                    )}
                    >
                    {link.label}
                    </Link>
                ))}
            </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hidden md:flex">
            <Globe className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hidden md:flex">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <UserNav />
           <div className="lg:hidden ml-2">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-[#003580] text-white border-0">
                    <nav className="grid gap-4 mt-12">
                        {navLinks.map((link) => (
                          <SheetClose asChild key={link.href}>
                            <Link
                              href={link.href}
                              className={cn(
                                "p-4 font-bold text-lg border-b border-white/10",
                                pathname === link.href ? "bg-white/10" : ""
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
