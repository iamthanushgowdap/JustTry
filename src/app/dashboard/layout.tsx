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
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    async function fetchSession() {
      const session = await getSession();
      setUserRole(session?.role || 'sales');
    }
    fetchSession();
  }, [pathname]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {userRole && <AppSidebar userRole={userRole} />}
        <main className="flex flex-1 flex-col">
          {userRole && <Header userRole={userRole} />}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
