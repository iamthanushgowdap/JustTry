import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, UserCheck } from 'lucide-react';
import type { Lead } from '@/lib/definitions';

export function RecentLeads({ leads }: { leads: Lead[] }) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case 'Loan':
        return 'border-sky-500/30 text-sky-600 bg-sky-50 dark:bg-sky-950/30 dark:text-sky-400';
      case 'Investment':
        return 'border-emerald-500/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400';
      case 'Insurance':
        return 'border-purple-500/30 text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400';
      default:
        return '';
    }
  };

  return (
    <Card className="shadow-xs overflow-hidden w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 pt-4">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold">Recent Leads</CardTitle>
          <CardDescription className="text-xs">Most recent customer inquiries across all pipelines.</CardDescription>
        </div>
        <Link href="/dashboard/leads">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        {leads.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[540px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Customer</TableHead>
                  <TableHead className="w-[110px]">Service</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[90px] hidden md:table-cell">Added</TableHead>
                  <TableHead className="text-right w-[90px]">Value</TableHead>
                  <TableHead className="text-right w-[50px]"><span className="sr-only">Action</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Link href={`/dashboard/leads/${lead.id}`} className="font-medium hover:underline flex flex-col">
                        <span className="truncate max-w-[170px] text-xs sm:text-sm font-semibold">{lead.name}</span>
                        <span className="text-[11px] text-muted-foreground truncate max-w-[170px]">{lead.email}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] px-2 py-0 ${getServiceColor(lead.serviceType)}`}>
                        {lead.serviceType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[11px] font-normal px-2 py-0">
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs sm:text-sm">
                      ${lead.value.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/leads/${lead.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="View Lead Details">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <UserCheck className="h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-xs">No leads found in local storage.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}