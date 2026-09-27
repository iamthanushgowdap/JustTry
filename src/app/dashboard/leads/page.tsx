'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getLeads, saveLeads, addFollowUp } from '@/lib/data';
import type { Lead, Document, ServiceType } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  PlusCircle,
  Upload,
  Eye,
  Search,
  CalendarPlus,
  Trash2,
  FileSpreadsheet,
  FilterX,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LeadForm } from '@/components/dashboard/lead-form';
import { DocumentUploadDialog } from '@/components/dashboard/document-upload-dialog';
import { useToast } from '@/hooks/use-toast';

export default function LeadsPage() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [serviceFilter, setServiceFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [editingLead, setEditingLead] = React.useState<Lead | undefined>(undefined);
  const [uploadLead, setUploadLead] = React.useState<Lead | undefined>(undefined);

  const router = useRouter();
  const { toast } = useToast();

  const loadLeads = React.useCallback(() => {
    setLeads(getLeads());
  }, []);

  React.useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleSaveLead = (lead: Lead) => {
    let updatedLeads: Lead[];
    const timestamp = new Date().toISOString();

    if (editingLead) {
      updatedLeads = leads.map((l) => (l.id === lead.id ? { ...lead, id: lead.id } : l));
      toast({
        title: 'Lead Updated',
        description: `Lead details for ${lead.name} have been updated.`,
      });
    } else {
      const newLead: Lead = {
        ...lead,
        id: `LEAD-${Date.now()}`,
        createdAt: timestamp,
        history: [
          {
            status: lead.status,
            timestamp: timestamp,
            user: lead.assignedTo || 'Sales Rep',
            remarks: 'New lead generated in CRM.',
          },
        ],
      };
      updatedLeads = [newLead, ...leads];
      toast({
        title: 'Lead Created',
        description: `Lead for ${lead.name} has been created successfully.`,
      });
    }

    setLeads(updatedLeads);
    saveLeads(updatedLeads);
    setIsFormOpen(false);
    setEditingLead(undefined);
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    const updatedLeads = leads.filter((l) => l.id !== id);
    setLeads(updatedLeads);
    saveLeads(updatedLeads);
    toast({
      title: 'Lead Deleted',
      description: `Lead ${name} removed from CRM records.`,
      variant: 'destructive',
    });
  };

  const handleOpenUpload = (lead: Lead) => {
    setUploadLead(lead);
    setIsUploadOpen(true);
  };

  const handleDocumentUpload = (leadId: string, documents: Document[]) => {
    const updatedLeads = leads.map((l) => (l.id === leadId ? { ...l, documents } : l));
    setLeads(updatedLeads);
    saveLeads(updatedLeads);
  };

  const handleQuickFollowUp = (lead: Lead) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    addFollowUp({
      leadId: lead.id,
      leadName: lead.name,
      email: lead.email,
      phone: lead.phone,
      serviceType: lead.serviceType,
      date: dateStr,
      time: '11:00 AM',
      notes: `Review ${lead.subCategory} requirements and confirm required documents.`,
      type: 'Call',
      status: 'Pending',
    });

    toast({
      title: 'Follow-up Scheduled',
      description: `Scheduled call with ${lead.name} for ${dateStr}.`,
    });
    router.push('/dashboard/follow-ups');
  };

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.companyName && lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesService = serviceFilter === 'all' || lead.serviceType === serviceFilter;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesService && matchesStatus;
  });

  const totalValue = filteredLeads.reduce((sum, l) => sum + l.value, 0);

  const getServiceBadgeClass = (type: string) => {
    switch (type) {
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
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads & Applications</h1>
          <p className="text-muted-foreground">
            View, filter, and advance clients across Loan, Investment, and Insurance pipelines.
          </p>
        </div>

        <Dialog
          open={isFormOpen}
          onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen);
            if (!isOpen) setEditingLead(undefined);
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingLead(undefined);
                setIsFormOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLead ? 'Edit Lead Profile' : 'Create New Client Lead'}</DialogTitle>
            </DialogHeader>
            <LeadForm onSave={handleSaveLead} lead={editingLead} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <p className="text-xs text-muted-foreground">Showing Leads</p>
          <p className="text-2xl font-bold mt-1">{filteredLeads.length} <span className="text-xs font-normal text-muted-foreground">/ {leads.length}</span></p>
        </div>
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <p className="text-xs text-muted-foreground">Total Filtered Value</p>
          <p className="text-2xl font-bold mt-1 text-primary">${totalValue.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <p className="text-xs text-muted-foreground">Avg. Lead Size</p>
          <p className="text-2xl font-bold mt-1">
            ${filteredLeads.length > 0 ? Math.round(totalValue / filteredLeads.length).toLocaleString() : '0'}
          </p>
        </div>
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <p className="text-xs text-muted-foreground">Pending Action</p>
          <p className="text-2xl font-bold mt-1 text-amber-500">
            {filteredLeads.filter(l => l.status === 'KYC Pending' || l.status === 'Documents Needed').length}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, email, phone, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Service Filter */}
            <div className="w-full md:w-48">
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="Loan">Loans</SelectItem>
                  <SelectItem value="Investment">Investments</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="KYC Pending">KYC Pending</SelectItem>
                  <SelectItem value="Documents Needed">Documents Needed</SelectItem>
                  <SelectItem value="Eligibility Check">Eligibility Check</SelectItem>
                  <SelectItem value="Risk Profiling">Risk Profiling</SelectItem>
                  <SelectItem value="Medical Check">Medical Check</SelectItem>
                  <SelectItem value="Underwriting">Underwriting</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Activated">Activated</SelectItem>
                  <SelectItem value="Policy Issued">Policy Issued</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || serviceFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setServiceFilter('all');
                  setStatusFilter('all');
                }}
                className="text-xs"
              >
                <FilterX className="mr-1 h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="shadow-xs overflow-hidden w-full">
        <CardContent className="p-0 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[700px]">
              <TableHeader>
              <TableRow>
                <TableHead>Customer / Company</TableHead>
                <TableHead>Service & Category</TableHead>
                <TableHead>Pipeline Stage</TableHead>
                <TableHead>Application Value</TableHead>
                <TableHead>Assigned Advisor</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="font-semibold">{lead.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {lead.email} • {lead.phone}
                      </div>
                      {lead.companyName && (
                        <div className="text-[11px] text-muted-foreground/80 font-medium">
                          🏢 {lead.companyName}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className={`w-fit text-xs ${getServiceBadgeClass(lead.serviceType)}`}>
                          {lead.serviceType}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-medium">{lead.subCategory}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="font-normal text-xs">
                        {lead.status}
                      </Badge>
                      {lead.documents && lead.documents.length > 0 && (
                        <span className="block text-[11px] text-muted-foreground mt-0.5">
                          📎 {lead.documents.length} doc{lead.documents.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-sm">${lead.value.toLocaleString()}</div>
                      {lead.annualIncome && (
                        <div className="text-[11px] text-muted-foreground">
                          Income: ${lead.annualIncome.toLocaleString()}/yr
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-medium">{lead.assignedTo}</span>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/leads/${lead.id}`)}>
                            <Eye className="mr-2 h-4 w-4 text-primary" />
                            View Full Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickFollowUp(lead)}>
                            <CalendarPlus className="mr-2 h-4 w-4 text-emerald-500" />
                            Schedule Follow-up
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenUpload(lead)}>
                            <Upload className="mr-2 h-4 w-4 text-sky-500" />
                            Upload Documents
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(lead)}>
                            Edit Lead Info
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(lead.id, lead.name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                    No leads match your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Dialog */}
      {uploadLead && (
        <DocumentUploadDialog
          isOpen={isUploadOpen}
          setIsOpen={setIsUploadOpen}
          lead={uploadLead}
          onUpload={handleDocumentUpload}
        />
      )}
    </div>
  );
}
