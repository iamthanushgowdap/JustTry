'use client';

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
import type { User } from '@/lib/definitions';
import { logout } from '@/lib/actions';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const salesNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ClipboardCheck },
  { name: 'Follow-ups', href: '/dashboard/follow-ups', icon: Bell },
];

const backOfficeNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Verification Queue', href: '/dashboard/verification', icon: FileText },
    { name: 'Assigned Tasks', href: '/dashboard/tasks', icon: ClipboardCheck },
];

const adminNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'All Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Team Performance', href: '/dashboard/performance', icon: BarChart },
  { name: 'User Management', href: '/dashboard/users', icon: Briefcase },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname();
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
