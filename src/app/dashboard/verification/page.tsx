'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileCheck2,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Search,
  FilterX,
  AlertTriangle,
} from 'lucide-react';
import { getLeads, saveLeads } from '@/lib/data';
import type { Lead, PipelineStatus } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';

export default function VerificationPage() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const router = useRouter();
  const { toast } = useToast();

  const loadLeads = React.useCallback(() => {
    const allLeads = getLeads();
    // Verification queue shows leads in verification, underwriting, or document phases
    const queue = allLeads.filter(
      (l) =>
        l.status === 'KYC Pending' ||
        l.status === 'Documents Needed' ||
        l.status === 'Eligibility Check' ||
        l.status === 'Medical Check' ||
        l.status === 'Underwriting' ||
        l.status === 'KYC Verification' ||
        l.status === 'Risk Profiling'
    );
    setLeads(queue);
  }, []);

  React.useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleProcessClick = (leadId: string) => {
    router.push(`/dashboard/leads/${leadId}`);
  };

  const handleQuickApproveKYC = (lead: Lead) => {
    const allLeads = getLeads();
    const timestamp = new Date().toISOString();

    // Determine next status based on service
    let nextStatus: PipelineStatus = 'Approved';
    if (lead.serviceType === 'Loan') {
      nextStatus = 'Approved';
    } else if (lead.serviceType === 'Investment') {
      nextStatus = 'Portfolio Creation';
    } else if (lead.serviceType === 'Insurance') {
      nextStatus = 'Underwriting';
    }

    // Mark all documents as verified
    const updatedDocs = (lead.documents || []).map((doc) => ({
      ...doc,
      status: 'Verified' as const,
      verifiedBy: 'Betty Office (KYC Lead)',
    }));

    const updatedLead: Lead = {
      ...lead,
      status: nextStatus,
      documents: updatedDocs,
      history: [
        ...(lead.history || []),
        {
          status: nextStatus,
          timestamp,
          user: 'Betty Office',
          remarks: 'KYC verified & documents cleared. File forwarded to next stage.',
        },
      ],
    };

    const updated = allLeads.map((l) => (l.id === lead.id ? updatedLead : l));
    saveLeads(updated);
    loadLeads();

    toast({
      title: 'Verification Approved',
      description: `KYC for ${lead.name} has been verified and moved to ${nextStatus}.`,
    });
  };

  const handleRequestMoreDocs = (lead: Lead) => {
    const allLeads = getLeads();
    const timestamp = new Date().toISOString();

    const updatedLead: Lead = {
      ...lead,
      status: 'Documents Needed',
      history: [
        ...(lead.history || []),
        {
          status: 'Documents Needed',
          timestamp,
          user: 'Betty Office',
          remarks: 'Back office review flagged missing or incomplete proofs. Requested resubmission.',
        },
      ],
    };

    const updated = allLeads.map((l) => (l.id === lead.id ? updatedLead : l));
    saveLeads(updated);
    loadLeads();

    toast({
      title: 'Documents Flagged',
      description: `Requested additional documents for ${lead.name}.`,
    });
  };

  const filtered = leads.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serviceType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">KYC & Document Verification</h1>
            <Badge variant="secondary" className="font-semibold">
              Operations
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Review customer identity proofs, financial audits, and approve compliance workflows.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border bg-card shadow-sm">
          <p className="text-xs text-muted-foreground">Queue Backlog</p>
          <p className="text-2xl font-bold mt-1 text-primary">{leads.length}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-sm">
          <p className="text-xs text-muted-foreground">KYC Pending Action</p>
          <p className="text-2xl font-bold mt-1 text-amber-500">
            {leads.filter((l) => l.status === 'KYC Pending' || l.status === 'KYC Verification').length}
          </p>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-sm">
          <p className="text-xs text-muted-foreground">Underwriting / Audit</p>
          <p className="text-2xl font-bold mt-1 text-purple-500">
            {leads.filter((l) => l.status === 'Underwriting' || l.status === 'Eligibility Check').length}
          </p>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-sm">
          <p className="text-xs text-muted-foreground">Avg. SLA Time</p>
          <p className="text-2xl font-bold mt-1 text-emerald-500">&lt; 4 Hours</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search queue by customer, ID, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="w-full md:w-56">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pending Review</SelectItem>
                  <SelectItem value="KYC Pending">KYC Pending</SelectItem>
                  <SelectItem value="Documents Needed">Documents Needed</SelectItem>
                  <SelectItem value="Eligibility Check">Eligibility Check</SelectItem>
                  <SelectItem value="Medical Check">Medical Check</SelectItem>
                  <SelectItem value="Underwriting">Underwriting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-xs"
              >
                <FilterX className="mr-1 h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm overflow-hidden w-full">
        <CardContent className="p-0 overflow-hidden">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Application File</TableHead>
                  <TableHead>Service Line</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Uploaded Proofs</TableHead>
                  <TableHead>Exposure Value</TableHead>
                  <TableHead className="text-right">Verification Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => {
                  const docCount = item.documents?.length || 0;
                  const verifiedCount = item.documents?.filter((d) => d.status === 'Verified').length || 0;

                  return (
                    <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: <span className="font-mono">{item.id}</span>
                        </div>
                        {item.companyName && (
                          <div className="text-[11px] text-muted-foreground/80 mt-0.5">
                            🏢 {item.companyName}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.serviceType}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.subCategory}</div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className="text-xs font-normal">
                          {item.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {verifiedCount} / {docCount} verified
                          </span>
                        </div>
                        {docCount === 0 && (
                          <span className="text-[10px] text-amber-500 font-medium">Awaiting upload</span>
                        )}
                      </TableCell>

                      <TableCell className="font-semibold text-sm">
                        ${item.value.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-right space-x-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          onClick={() => handleQuickApproveKYC(item)}
                          title="Quick Approve and advance"
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Verify & Pass
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 text-xs"
                          onClick={() => handleProcessClick(item.id)}
                        >
                          Review <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <ShieldCheck className="h-12 w-12 text-emerald-500/70 mb-3" />
              <h3 className="text-base font-semibold text-foreground">Verification Queue is Cleared!</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                No client applications currently require KYC or document review. All records are up to date.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}