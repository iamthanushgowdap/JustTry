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
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex flex-1 flex-col">
          <Header />
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
            <div className="w-full">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
