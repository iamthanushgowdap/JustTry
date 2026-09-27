'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Bell, PlusCircle, Moon, Sun, Shield, User, Briefcase, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import type { User as UserType, UserRole } from '@/lib/definitions';
import { logout, login } from '@/lib/actions';
import { getUser, getTasks, getFollowUps } from '@/lib/data';
import { useTheme } from 'next-themes';
import { Skeleton } from '../ui/skeleton';
import { InteractiveTutorial } from '@/components/interactive-tutorial';

export function Header({ userRole }: { userRole: UserRole }) {
  const { setTheme, theme } = useTheme();
  const [user, setUser] = React.useState<UserType | null>(null);
  const [pendingTasksCount, setPendingTasksCount] = React.useState(0);
  const [pendingFollowUpsCount, setPendingFollowUpsCount] = React.useState(0);
  const [searchVal, setSearchVal] = React.useState('');
  const [isTutorialOpen, setIsTutorialOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setUser(getUser(userRole));
    const tasks = getTasks();
    const followUps = getFollowUps();
    setPendingTasksCount(tasks.filter((t) => !t.completed).length);
    setPendingFollowUpsCount(followUps.filter((f) => f.status === 'Pending').length);
  }, [userRole]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/dashboard/leads`);
    }
  };

  const handleRoleSwitch = (role: UserRole) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('justtry_active_role', role);
    }
    login(role).catch(() => {});
    window.location.href = '/dashboard';
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between gap-2 sm:gap-4 border-b bg-card px-3 sm:px-6 shadow-xs">
      <div className="flex items-center gap-2 shrink-0">
        <SidebarTrigger className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground" />
      </div>

      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs sm:max-w-md min-w-0 mx-2">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          type="search"
          placeholder="Search leads, tasks..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="w-full rounded-lg bg-background pl-8 text-xs sm:text-sm h-9"
        />
      </form>

      <InteractiveTutorial
        isOpen={isTutorialOpen}
        onOpenChange={setIsTutorialOpen}
        onSelectRole={handleRoleSwitch}
      />

      <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
        {/* Interactive Tutorial Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsTutorialOpen(true)}
          className="h-8 sm:h-9 text-xs border-primary/30 text-primary hover:bg-primary/10 px-2 sm:px-3"
          title="Open interactive walkthrough guide"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary sm:mr-1.5" />
          <span className="hidden sm:inline">Tour Guide</span>
        </Button>

        {/* Quick New Lead Button */}
        <Link href="/dashboard/leads" className="hidden sm:inline-flex">
          <Button size="sm" className="h-9 text-xs">
            <PlusCircle className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            New Lead
          </Button>
        </Link>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle Theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              {(pendingTasksCount > 0 || pendingFollowUpsCount > 0) && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 sm:w-80 p-0 shadow-lg z-50">
            <div className="p-3 border-b bg-muted/40">
              <h4 className="font-semibold text-xs sm:text-sm">Notifications & Reminders</h4>
              <p className="text-[11px] text-muted-foreground">Action items requiring attention</p>
            </div>
            <div className="p-2 sm:p-3 space-y-1.5 text-xs">
              <Link
                href="/dashboard/tasks"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-500 shrink-0" />
                  <span>Pending Tasks</span>
                </div>
                <Badge variant="secondary" className="text-xs">{pendingTasksCount}</Badge>
              </Link>
              <Link
                href="/dashboard/follow-ups"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Scheduled Follow-ups</span>
                </div>
                <Badge variant="secondary" className="text-xs">{pendingFollowUpsCount}</Badge>
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        {/* Role Quick Switch & User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-9 sm:w-9">
              {user ? (
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <Skeleton className="h-8 w-8 rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 z-50">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold text-sm leading-tight">{user?.name}</span>
                <span className="text-[11px] text-muted-foreground capitalize mt-0.5">
                  {user?.role} Mode
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[11px] font-normal text-muted-foreground py-1">
              Switch Role View:
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleRoleSwitch('sales')} className="cursor-pointer text-xs">
              <User className="mr-2 h-3.5 w-3.5 text-sky-500 shrink-0" />
              Sales Advisor
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleSwitch('back-office')} className="cursor-pointer text-xs">
              <Briefcase className="mr-2 h-3.5 w-3.5 text-purple-500 shrink-0" />
              Back Office & KYC
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleSwitch('admin')} className="cursor-pointer text-xs">
              <Shield className="mr-2 h-3.5 w-3.5 text-emerald-500 shrink-0" />
              Executive Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="text-xs cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs text-destructive cursor-pointer"
              onClick={async () => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('justtry_active_role');
                }
                logout().catch(() => {});
                window.location.href = '/';
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
