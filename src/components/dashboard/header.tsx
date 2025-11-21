'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Bell, PlusCircle, Moon, Sun } from 'lucide-react';
import type { User, UserRole } from '@/lib/definitions';
import { logout } from '@/lib/actions';
import { getUser } from '@/lib/data';
import { useTheme } from 'next-themes';
import { Skeleton } from '../ui/skeleton';

export function Header({ userRole }: { userRole: UserRole }) {
  const { setTheme, theme } = useTheme();
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    setUser(getUser(userRole));
  }, [userRole]);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>

      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search leads, contacts..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>

      <div className="flex items-center gap-2">
        {user?.role === 'sales' && (
             <Button size="sm" className="hidden sm:flex">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Lead
            </Button>
        )}
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              {user ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <Skeleton className="h-8 w-8 rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <form action={logout} className='w-full'>
                    <button type="submit" className='w-full text-left'>Logout</button>
                </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
