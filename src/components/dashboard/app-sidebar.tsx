'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/icons';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  Briefcase,
  Settings,
  BarChart,
  LogOut,
  Bell,
  ClipboardCheck,
} from 'lucide-react';
import type { User, UserRole } from '@/lib/definitions';
import { logout } from '@/lib/actions';
import { getUser } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';

const salesNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads & Pipeline', href: '/dashboard/leads', icon: Users },
  { name: 'Tasks & Checklist', href: '/dashboard/tasks', icon: ClipboardCheck },
  { name: 'Client Follow-ups', href: '/dashboard/follow-ups', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const backOfficeNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Verification Queue', href: '/dashboard/verification', icon: FileCheck2 },
  { name: 'All Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Assigned Tasks', href: '/dashboard/tasks', icon: ClipboardCheck },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const adminNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'All Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Verification Queue', href: '/dashboard/verification', icon: FileCheck2 },
  { name: 'Team Performance', href: '/dashboard/performance', icon: BarChart },
  { name: 'Tasks & Operations', href: '/dashboard/tasks', icon: ClipboardCheck },
  { name: 'User Management', href: '/dashboard/users', icon: Briefcase },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function AppSidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname();
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    setUser(getUser(userRole));
  }, [userRole]);

  if (!user) {
    return (
      <Sidebar className="border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <AppLogo />
            <span className="font-semibold text-lg">JustTry</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </SidebarContent>
        <SidebarFooter className="p-2">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    );
  }

  const navItems =
    user.role === 'admin' ? adminNav : user.role === 'back-office' ? backOfficeNav : salesNav;

  return (
    <Sidebar className="border-r">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2.5 p-2 hover:opacity-80 transition-opacity">
          <AppLogo />
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">JustTry</span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">FinTech CRM</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  className="w-full justify-start"
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/60 border">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col truncate">
            <span className="text-sm font-semibold truncate">{user.name}</span>
            <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Sign out"
            onClick={async () => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('justtry_active_role');
              }
              logout().catch(() => {});
              window.location.href = '/';
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
