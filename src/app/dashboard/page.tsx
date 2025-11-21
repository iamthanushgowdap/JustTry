
'use client';

import * as React from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentLeads } from '@/components/dashboard/recent-leads';
import { getLeads } from '@/lib/data';
import type { Lead } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [leads, setLeads] = React.useState<Lead[] | null>(null);
  
  React.useEffect(() => {
    setLeads(getLeads());
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
        <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your leads and activities.
        </p>
      </div>
      <StatsCards leads={leads} />
      <RecentLeads leads={leads.slice(0, 5)} />
    </div>
  );
}
