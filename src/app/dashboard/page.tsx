'use client';

import * as React from 'react';
import Link from 'next/link';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentLeads } from '@/components/dashboard/recent-leads';
import { getLeads, getTasks, getFollowUps, resetToDemoData } from '@/lib/data';
import type { Lead, UserRole, Task, FollowUp } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Sparkles, CheckCircle2, Clock, RotateCcw, ArrowRight, ShieldCheck, DollarSign, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [leads, setLeads] = React.useState<Lead[] | null>(null);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [followUps, setFollowUps] = React.useState<FollowUp[]>([]);
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const { toast } = useToast();

  const loadData = React.useCallback(async () => {
    const session = await getSession();
    const role = session?.role || 'sales';
    setUserRole(role);
    const allLeads = getLeads();
    if (role === 'back-office') {
      setLeads(allLeads.filter(lead => lead.status !== 'New'));
    } else {
      setLeads(allLeads);
    }
    setTasks(getTasks());
    setFollowUps(getFollowUps());
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetData = () => {
    resetToDemoData();
    loadData();
    toast({
      title: 'Demo Data Restored',
      description: 'Clean demo records, tasks, and follow-ups have been loaded into local storage.',
    });
  };

  if (leads === null) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FinTech CRM Dashboard</h1>
          <p className="text-muted-foreground">Loading workspace data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Calculate metrics by service type
  const loanLeads = leads.filter(l => l.serviceType === 'Loan');
  const investLeads = leads.filter(l => l.serviceType === 'Investment');
  const insuranceLeads = leads.filter(l => l.serviceType === 'Insurance');

  const pendingTasks = tasks.filter(t => !t.completed);
  const pendingFollowUps = followUps.filter(f => f.status === 'Pending');

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {userRole === 'admin'
                ? 'Executive Admin Dashboard'
                : userRole === 'back-office'
                ? 'Back Office & KYC Operations'
                : 'Sales & Advisory Dashboard'}
            </h1>
            <Badge variant={userRole === 'admin' ? 'default' : userRole === 'back-office' ? 'secondary' : 'outline'} className="capitalize">
              {userRole} Mode
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {userRole === 'back-office'
              ? 'Review pending customer verifications, KYC proofs, and underwriting workflows.'
              : userRole === 'admin'
              ? 'Real-time overview of portfolio pipeline, closing conversions, and team metrics.'
              : 'Track active leads, upcoming client follow-ups, and pipeline conversions.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetData} title="Reset demo dataset in local storage">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset Demo Data
          </Button>
          <Link href="/dashboard/leads">
            <Button size="sm">
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Manage Leads
            </Button>
          </Link>
        </div>
      </div>

      {/* Main KPI Stats */}
      <StatsCards leads={leads} />

      {/* Service Pipeline Breakdown Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-sky-500 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Retail & Business Loans</CardTitle>
              <DollarSign className="h-4 w-4 text-sky-500" />
            </div>
            <CardDescription>{loanLeads.length} active applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${loanLeads.reduce((acc, l) => acc + l.value, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Personal, Home, Business & Vehicle Loans
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Wealth & Investments</CardTitle>
              <Briefcase className="h-4 w-4 text-emerald-500" />
            </div>
            <CardDescription>{investLeads.length} active portfolios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${investLeads.reduce((acc, l) => acc + l.value, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mutual Funds, SIPs, Demat & Fixed Deposits
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Insurance & Protection</CardTitle>
              <ShieldCheck className="h-4 w-4 text-purple-500" />
            </div>
            <CardDescription>{insuranceLeads.length} policies in pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${insuranceLeads.reduce((acc, l) => acc + l.value, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Health, Term Life & General Insurance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Recent Leads + Quick Tasks & Follow-ups */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentLeads leads={leads.slice(0, 6)} />
        </div>

        <div className="space-y-6">
          {/* Action Tasks Widget */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Pending Tasks ({pendingTasks.length})
                </CardTitle>
                <Link href="/dashboard/tasks">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    View all <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="p-3 rounded-lg border bg-muted/30 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium line-clamp-1">{task.title}</span>
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
                      {task.priority}
                    </Badge>
                  </div>
                  {task.leadName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Lead: <span className="font-medium">{task.leadName}</span> ({task.serviceType})
                    </p>
                  )}
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">All tasks are caught up!</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Follow-ups Widget */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Next Follow-ups ({pendingFollowUps.length})
                </CardTitle>
                <Link href="/dashboard/follow-ups">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    View all <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingFollowUps.slice(0, 3).map((fu) => (
                <div key={fu.id} className="p-3 rounded-lg border bg-muted/30 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{fu.leadName}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {fu.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{fu.notes}</p>
                  <p className="text-[11px] text-primary font-medium mt-1">
                    Scheduled: {fu.date} {fu.time || ''}
                  </p>
                </div>
              ))}
              {pendingFollowUps.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No pending follow-ups scheduled.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
