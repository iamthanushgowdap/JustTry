
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
    (lead) => lead.status === 'Completed' || lead.status === 'Policy Issued' || lead.status === 'Approved'
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
    { title: 'New Leads', value: totalLeads.toString(), icon: Users, change: 'from last month' },
    { title: 'Conversion Rate', value: `${conversionRate}%`, icon: BarChart, change: 'from last month' },
    { title: 'Pipeline Value', value: formatValue(pipelineValue), icon: CircleDollarSign, change: 'from last month' },
    { title: 'Closed Deals', value: closedDeals.toString(), icon: TrendingUp, change: 'from last month' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{/* Placeholder for change */}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
