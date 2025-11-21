import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentLeads } from '@/components/dashboard/recent-leads';
import { leads } from '@/lib/data';
import { getSession } from '@/lib/actions';

export default async function DashboardPage() {
    const session = await getSession();
    const role = session?.role || 'sales';
  
    // In a real app, you would fetch data based on the role.
    // For now, we'll show the Sales dashboard content as the default.
  
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
