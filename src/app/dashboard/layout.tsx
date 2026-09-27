'use client';

import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { Header } from '@/components/dashboard/header';
import { getSession } from '@/lib/actions';
import type { UserRole } from '@/lib/definitions';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userRole, setUserRole] = React.useState<UserRole>('sales');
  const pathname = usePathname();

  React.useEffect(() => {
    async function fetchSession() {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('justtry_active_role') as UserRole | null;
        if (local && (local === 'sales' || local === 'back-office' || local === 'admin')) {
          setUserRole(local);
          return;
        }
      }
      const session = await getSession();
      setUserRole(session?.role || 'sales');
    }
    fetchSession();
  }, [pathname]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background overflow-hidden">
        {userRole && <AppSidebar userRole={userRole} />}
        <main className="flex flex-1 flex-col min-w-0 w-full overflow-hidden">
          {userRole && <Header userRole={userRole} />}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-8 bg-background">
            <div className="max-w-7xl mx-auto w-full min-w-0">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
