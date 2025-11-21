'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const performanceData = [
  { name: 'Alex Sales', leads: 45, closed: 12 },
  { name: 'Sam Jones', leads: 32, closed: 8 },
  { name: 'Jessie Smith', leads: 28, closed: 10 },
];

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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
