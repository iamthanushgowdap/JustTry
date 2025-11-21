'use client';

import * as React from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentLeads } from '@/components/dashboard/recent-leads';
import { getLeads } from '@/lib/data';
import type { Lead, UserRole } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/lib/actions';

export default function DashboardPage() {
  const [leads, setLeads] = React.useState<Lead[] | null>(null);
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      const session = await getSession();
      setUserRole(session?.role || 'sales');
      const allLeads = getLeads();
      if (session?.role === 'back-office') {
        setLeads(allLeads.filter(lead => lead.status !== 'New'));
      } else {
        setLeads(allLeads);
      }
    }
    fetchData();
  }, []);

  if (leads === null) {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here&apos;s an overview of your leads and activities.
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-96" />
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {userRole === 'back-office' ? 'Back Office Dashboard' : 'Sales Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your activities.
        </p>
      </div>
      <StatsCards leads={leads} />
      <RecentLeads leads={leads.slice(0, 5)} />
    </div>
  );
}
