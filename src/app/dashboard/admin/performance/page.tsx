'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Target, Award, Zap } from 'lucide-react';
import { getUsers, getLeads } from '@/lib/data';
import type { User, Lead } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminTeamPerformancePage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [usersData, leadsData] = await Promise.all([
          getUsers(),
          getLeads()
        ]);
        setUsers(usersData);
        setLeads(leadsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Calculate performance metrics
  const performanceMetrics = React.useMemo(() => {
    if (!users.length || !leads.length) return null;

    const salesUsers = users.filter(u => u.role === 'sales');
    const backOfficeUsers = users.filter(u => u.role === 'back-office');

    // Calculate metrics for each sales user
    const userPerformance = salesUsers.map(user => {
      const userLeads = leads.filter(lead => lead.assignedTo === user.id);
      const closedDeals = userLeads.filter(lead => lead.status === 'Closed');
      const totalValue = closedDeals.reduce((sum, lead) => sum + (lead.value || 0), 0);
      const conversionRate = userLeads.length > 0 ? (closedDeals.length / userLeads.length) * 100 : 0;

      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        totalLeads: userLeads.length,
        closedDeals: closedDeals.length,
        totalValue,
        conversionRate: Math.round(conversionRate),
        department: user.department
      };
    });

    // Monthly performance data (mock data for now - in real app would be from database)
    const monthlyData = [
      { month: 'Jan', leads: 45, closed: 12, revenue: 125000 },
      { month: 'Feb', leads: 52, closed: 18, revenue: 180000 },
      { month: 'Mar', leads: 48, closed: 15, revenue: 165000 },
      { month: 'Apr', leads: 61, closed: 22, revenue: 245000 },
      { month: 'May', leads: 55, closed: 19, revenue: 210000 },
      { month: 'Jun', leads: 67, closed: 28, revenue: 320000 }
    ];

    // Service type distribution
    const serviceDistribution = [
      { name: 'Loan', value: 35, color: '#0088FE' },
      { name: 'Investment', value: 28, color: '#00C49F' },
      { name: 'Insurance', value: 37, color: '#FFBB28' }
    ];

    return {
      userPerformance,
      monthlyData,
      serviceDistribution,
      totalRevenue: userPerformance.reduce((sum, user) => sum + user.totalValue, 0),
      totalLeads: leads.length,
      totalClosed: leads.filter(l => l.status === 'Closed').length,
      avgConversionRate: userPerformance.length > 0 ?
        userPerformance.reduce((sum, user) => sum + user.conversionRate, 0) / userPerformance.length : 0
    };
  }, [users, leads]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Performance</h1>
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!performanceMetrics) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Performance</h1>
          <p className="text-muted-foreground">Monitor your team's sales performance.</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center h-[400px]">
          <Users className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No Performance Data</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Performance data will be shown here once users and leads are available.
          </p>
        </div>
      </div>
    );
  }

  const { userPerformance, monthlyData, serviceDistribution, totalRevenue, totalLeads, totalClosed, avgConversionRate } = performanceMetrics;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Performance</h1>
        <p className="text-muted-foreground">
          Comprehensive overview of your sales team's performance and achievements.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClosed}</div>
            <p className="text-xs text-muted-foreground">
              {((totalClosed / totalLeads) * 100).toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Team average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Trend</CardTitle>
            <CardDescription>Revenue and lead generation over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? `$${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : name === 'leads' ? 'Total Leads' : 'Closed Deals'
                  ]} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Line yAxisId="right" type="monotone" dataKey="leads" stroke="#82ca9d" strokeWidth={3} />
                  <Line yAxisId="right" type="monotone" dataKey="closed" stroke="#ffc658" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Type Distribution</CardTitle>
            <CardDescription>Lead distribution by service category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Performance</CardTitle>
          <CardDescription>Detailed breakdown of each team member's performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userPerformance.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{user.totalLeads}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{user.closedDeals}</p>
                    <p className="text-xs text-muted-foreground">Closed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">${user.totalValue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <div className="text-center">
                    <Badge variant={user.conversionRate >= 30 ? "default" : user.conversionRate >= 20 ? "secondary" : "destructive"}>
                      {user.conversionRate}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">Conversion</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Performers This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {userPerformance
              .sort((a, b) => b.totalValue - a.totalValue)
              .slice(0, 3)
              .map((user, index) => (
                <div key={user.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground">${user.totalValue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
