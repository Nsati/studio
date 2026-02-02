
'use client';

import * as React from 'react';
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  Hotel,
  ShieldAlert,
  Zap,
  Tag,
  Package,
} from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useRouter } from 'next/navigation';

export function AdminCommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <div 
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-black/5 rounded-full cursor-pointer transition-all w-64 group"
      >
        <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
        <span className="text-xs font-bold text-muted-foreground flex-1">Search God-Mode...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="System Controls">
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/settings'))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Global Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/bookings'))}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>View All Bookings</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/payments'))}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing & Revenue</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/hotels/new'))}>
              <Hotel className="mr-2 h-4 w-4" />
              <span>Add New Property</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/tour-packages/new'))}>
              <Package className="mr-2 h-4 w-4" />
              <span>Create Tour Package</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/promotions'))}>
              <Tag className="mr-2 h-4 w-4" />
              <span>Create Coupon</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Danger Zone">
            <CommandItem className="text-destructive" onSelect={() => runCommand(() => alert('Emergency Freeze Triggered (Logic pending database sync)'))}>
              <ShieldAlert className="mr-2 h-4 w-4" />
              <span>Emergency Freeze</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/users'))}>
              <User className="mr-2 h-4 w-4" />
              <span>User Role Management</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
