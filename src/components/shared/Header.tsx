'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './Logo';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { User as AuthUser } from '@/lib/types';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Explore Hotels' },
];

// Mock user state
const useUser = (): { user: AuthUser | null; isUserLoading: boolean } => {
    // To mock a logged-in user, change this to:
    return { user: { displayName: 'Admin User', email: 'admin@example.com', role: 'admin' }, isUserLoading: false };
    // return { user: null, isUserLoading: false };
};


export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

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
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
