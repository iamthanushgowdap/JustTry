import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { Header } from '@/components/dashboard/header';
import { getSession } from '@/lib/actions';
import type { UserRole } from '@/lib/definitions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const userRole = session?.role as UserRole || 'sales';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar userRole={userRole} />
        <main className="flex flex-1 flex-col">
          <Header userRole={userRole} />
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
