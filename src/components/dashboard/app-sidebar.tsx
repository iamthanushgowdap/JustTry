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
  FileText,
  Briefcase,
  Settings,
  BarChart,
  LogOut,
  Bell,
  ClipboardCheck,
} from 'lucide-react';
import type { User, UserRole } from '@/lib/definitions';
import { logout } from '@/lib/actions';
import { getUserByEmail } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';

const salesNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ClipboardCheck },
  { name: 'Follow-ups', href: '/dashboard/follow-ups', icon: Bell },
];

const backOfficeNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Verification Queue', href: '/dashboard/verification', icon: FileText },
    { name: 'Assigned Tasks', href: '/dashboard/back-office/tasks', icon: ClipboardCheck },
];

const adminNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'All Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Team Performance', href: '/dashboard/admin/performance', icon: BarChart },
  { name: 'User Management', href: '/dashboard/admin/users', icon: Briefcase },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function AppSidebar({}: {}) {
  const pathname = usePathname();
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.email) {
        const userData = await getUserByEmail(authUser.email);
        setUser(userData);
      }
    }
    fetchUser();
  }, []);

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
        <div className="flex items-center gap-2 p-2">
          <AppLogo />
          <span className="font-semibold text-lg">JustTry</span>
        </div>
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
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted">
            <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
            </div>
            <form action={logout} className="ml-auto">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
