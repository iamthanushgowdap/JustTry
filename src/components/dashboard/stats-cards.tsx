import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart, TrendingUp, CircleDollarSign } from 'lucide-react';

const stats = [
  { title: 'New Leads', value: '45', icon: Users, change: '+12.5%' },
  { title: 'Conversion Rate', value: '25.3%', icon: BarChart, change: '+2.1%' },
  { title: 'Pipeline Value', value: '$1.2M', icon: CircleDollarSign, change: '-5.2%' },
  { title: 'Closed Deals', value: '12', icon: TrendingUp, change: '+10%' },
];

export function StatsCards() {
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
            <p className="text-xs text-muted-foreground">{stat.change} from last month</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
