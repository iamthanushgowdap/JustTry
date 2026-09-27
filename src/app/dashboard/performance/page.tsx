'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  DollarSign,
  Award,
  Users,
  Target,
  BarChart3,
  PieChart as PieIcon,
} from 'lucide-react';
import { getLeads, getUsers } from '@/lib/data';
import type { Lead, User } from '@/lib/definitions';

export default function PerformancePage() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    setLeads(getLeads());
    setUsers(getUsers());
  }, []);

  // Compute Advisor Performance
  const advisorStats = users.map((user) => {
    const userLeads = leads.filter(
      (l) => l.assignedTo.toLowerCase() === user.name.toLowerCase()
    );
    const closed = userLeads.filter(
      (l) => l.status === 'Completed' || l.status === 'Policy Issued' || l.status === 'Approved' || l.status === 'Activated'
    );
    const closedValue = closed.reduce((sum, l) => sum + l.value, 0);
    const conversion = userLeads.length > 0 ? Math.round((closed.length / userLeads.length) * 100) : 0;

    return {
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      totalLeads: userLeads.length,
      closedDeals: closed.length,
      conversionRate: `${conversion}%`,
      conversionNum: conversion,
      closedValue,
    };
  });

  // Sort advisors by closed value
  const leaderboard = [...advisorStats].sort((a, b) => b.closedValue - a.closedValue);

  // Compute Service Distribution Data for Chart 2
  const serviceStats = [
    {
      name: 'Loans',
      value: leads
        .filter((l) => l.serviceType === 'Loan')
        .reduce((sum, l) => sum + l.value, 0),
      count: leads.filter((l) => l.serviceType === 'Loan').length,
      color: '#0ea5e9', // Sky blue
    },
    {
      name: 'Investments',
      value: leads
        .filter((l) => l.serviceType === 'Investment')
        .reduce((sum, l) => sum + l.value, 0),
      count: leads.filter((l) => l.serviceType === 'Investment').length,
      color: '#10b981', // Emerald green
    },
    {
      name: 'Insurance',
      value: leads
        .filter((l) => l.serviceType === 'Insurance')
        .reduce((sum, l) => sum + l.value, 0),
      count: leads.filter((l) => l.serviceType === 'Insurance').length,
      color: '#a855f7', // Purple
    },
  ];

  const totalClosedDeals = leads.filter(
    (l) => l.status === 'Completed' || l.status === 'Policy Issued' || l.status === 'Approved' || l.status === 'Activated'
  );
  const totalClosedValue = totalClosedDeals.reduce((sum, l) => sum + l.value, 0);
  const totalPipelineValue = leads.reduce((sum, l) => sum + l.value, 0);
  const overallConversion = leads.length > 0 ? Math.round((totalClosedDeals.length / leads.length) * 100) : 0;
  const topPerformer = leaderboard[0]?.name || 'Alex Sales';

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Performance & Revenue Analytics</h1>
        <p className="text-muted-foreground">
          Track conversion funnels, advisor quota attainment, and portfolio distribution.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Closed Deal Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalClosedValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {totalClosedDeals.length} finalized accounts
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Conversion</CardTitle>
            <Target className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallConversion}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalClosedDeals.length} of {leads.length} total applications
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Pipeline Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPipelineValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All in-flight opportunities
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Advisor</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{topPerformer}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Highest generated revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 1: Advisor Lead vs Closed deals */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Advisor Volume vs Closed Deals
                </CardTitle>
                <CardDescription>Comparison of assigned leads vs converted customers.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={advisorStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      val,
                      name === 'totalLeads' ? 'Total Leads' : 'Closed Deals',
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="totalLeads" fill="#0ea5e9" name="Total Leads" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="closedDeals" fill="#10b981" name="Closed Deals" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Pipeline Value by Service Type */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieIcon className="h-4 w-4 text-primary" />
                  Portfolio Value by Service Line
                </CardTitle>
                <CardDescription>Capital allocation across Loans, Wealth & Insurance.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={serviceStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={55}
                    paddingAngle={4}
                    label={(entry) => `${entry.name}: $${(entry.value / 1000).toFixed(0)}k`}
                    fontSize={11}
                  >
                    {serviceStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Portfolio Value']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advisor Leaderboard Table */}
      <Card className="shadow-sm overflow-hidden w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Advisor Quota & Conversion Leaderboard
          </CardTitle>
          <CardDescription>Detailed breakdown of individual performance metrics.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[620px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Advisor</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Assigned Leads</TableHead>
                <TableHead className="text-center">Closed Deals</TableHead>
                <TableHead className="text-center">Win Rate</TableHead>
                <TableHead className="text-right">Closed Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((advisor, index) => (
                <TableRow key={advisor.name} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-bold text-muted-foreground">
                    #{index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={advisor.avatar} />
                        <AvatarFallback>{advisor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-sm">{advisor.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-xs">
                      {advisor.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">{advisor.totalLeads}</TableCell>
                  <TableCell className="text-center font-medium text-emerald-600 dark:text-emerald-400">
                    {advisor.closedDeals}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {advisor.conversionRate}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${advisor.closedValue.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
