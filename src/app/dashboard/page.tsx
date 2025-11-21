'use client';

import * as React from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentLeads } from '@/components/dashboard/recent-leads';
import { getLeads } from '@/lib/data';
import type { Lead } from '@/lib/definitions';

export default function DashboardPage() {
  const [leads, setLeads] = React.useState<Lead[]>([]);

  React.useEffect(() => {
    setLeads(getLeads());
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your leads and activities.
        </p>
      </div>
      <StatsCards />
      <RecentLeads leads={leads.slice(0, 5)} />
    </div>
  );
}