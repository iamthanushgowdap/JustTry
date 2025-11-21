
'use client';
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
} from 'recharts';
import { TrendingDown } from 'lucide-react';

const performanceData: any[] = [];

export default function PerformancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Performance</h1>
        <p className="text-muted-foreground">
          Monitor your team&apos;s sales performance.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Leads vs. Closed Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="leads" fill="hsl(var(--primary))" name="Total Leads" />
                    <Bar dataKey="closed" fill="hsl(var(--accent-foreground))" name="Deals Closed" />
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center h-full">
                    <TrendingDown className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No Performance Data</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Performance data will be shown here once there are leads and activities.
                    </p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
