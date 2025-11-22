'use client';

import * as React from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentLeads } from '@/components/dashboard/recent-leads';
import { getLeads, getLeadsByAssignedUser, getUserByEmail } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import type { Lead, UserRole } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [leads, setLeads] = React.useState<Lead[] | null>(null);
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log('Auth user email:', authUser?.email);
      let role: UserRole = 'sales';
      let userId: string | null = null;
      let userServiceTypes: string[] = [];

      if (authUser?.email) {
        const userData = await getUserByEmail(authUser.email);
        console.log('User data from DB:', userData);
        role = userData?.role || 'sales';
        userId = userData?.id || null;
        userServiceTypes = userData?.serviceTypes || [];
      }

      console.log('Setting role to:', role);
      console.log('User ID:', userId);
      console.log('User service types:', userServiceTypes);
      setUserRole(role);

      let filteredLeads: Lead[] = [];

      if (role === 'sales' && userId) {
        // Sales users only see their assigned leads
        filteredLeads = await getLeadsByAssignedUser(userId);
      } else if (role === 'back-office') {
        // Back-office users see leads of their assigned service types, excluding 'New' status
        const allLeads = await getLeads();
        console.log('All leads count:', allLeads.length);
        filteredLeads = allLeads.filter(lead => {
          const matchesStatus = lead.status !== 'New';
          const matchesServiceType = userServiceTypes.length === 0 || userServiceTypes.includes(lead.serviceType);
          console.log(`Lead ${lead.id}: ${lead.serviceType}, status: ${lead.status} → ${matchesStatus && matchesServiceType ? 'INCLUDE' : 'EXCLUDE'}`);
          return matchesStatus && matchesServiceType;
        });
        console.log('Filtered leads for back-office:', filteredLeads.length);
      } else {
        // Admin and other roles see all leads
        filteredLeads = await getLeads();
      }

      setLeads(filteredLeads);
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
