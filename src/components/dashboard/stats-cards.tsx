'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart, TrendingUp, CircleDollarSign } from 'lucide-react';
import type { Lead } from '@/lib/definitions';

interface StatsCardsProps {
  leads: Lead[];
}

export function StatsCards({ leads }: StatsCardsProps) {
  const totalLeads = leads.length;
  const pipelineValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const closedDeals = leads.filter(
    (lead) =>
      lead.status === 'Completed' ||
      lead.status === 'Policy Issued' ||
      lead.status === 'Approved' ||
      lead.status === 'Activated'
  ).length;
  const conversionRate = totalLeads > 0 ? ((closedDeals / totalLeads) * 100).toFixed(1) : '0';

  const formatValue = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}k`;
    }
    return `$${value.toLocaleString()}`;
  };

  const stats = [
    { title: 'Total Leads', value: totalLeads.toString(), icon: Users, desc: 'Active pipeline volume', color: 'text-sky-500' },
    { title: 'Conversion Rate', value: `${conversionRate}%`, icon: BarChart, desc: `${closedDeals} closed deals`, color: 'text-emerald-500' },
    { title: 'Pipeline Value', value: formatValue(pipelineValue), icon: CircleDollarSign, desc: 'Gross portfolio value', color: 'text-purple-500' },
    { title: 'Deals Closed', value: closedDeals.toString(), icon: TrendingUp, desc: 'Finalized accounts', color: 'text-amber-500' },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-xs overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color} shrink-0`} />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">{stat.value}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stat.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
