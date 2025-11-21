'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getLeads, saveLeads } from '@/lib/data';
import type { Lead, Document } from '@/lib/definitions';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Upload, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LeadForm } from '@/components/dashboard/lead-form';
import { DocumentUploadDialog } from '@/components/dashboard/document-upload-dialog';

export default function LeadsPage() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [editingLead, setEditingLead] = React.useState<Lead | undefined>(undefined);
  const [uploadLead, setUploadLead] = React.useState<Lead | undefined>(undefined);
  const router = useRouter();

  React.useEffect(() => {
    setLeads(getLeads());
  }, []);

  const handleSaveLead = (lead: Lead) => {
    let updatedLeads;
    const timestamp = new Date().toISOString();
    
    if (editingLead) {
      updatedLeads = leads.map((l) => (l.id === lead.id ? lead : l));
      // You might want to add a history item for editing, but for now we focus on status changes.
    } else {
      const newLead = { 
        ...lead, 
        id: `LEAD-${Date.now()}`, 
        createdAt: timestamp,
        history: [{
          status: lead.status,
          timestamp: timestamp,
          user: lead.assignedTo,
          remarks: 'Lead created.'
        }]
      };
      updatedLeads = [...leads, newLead];
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
  
  const handleDelete = (id: string) => {
    const updatedLeads = leads.filter(l => l.id !== id);
    setLeads(updatedLeads);
    saveLeads(updatedLeads);
  };

  const handleOpenUpload = (lead: Lead) => {
    setUploadLead(lead);
    setIsUploadOpen(true);
  };

  const handleDocumentUpload = (leadId: string, documents: Document[]) => {
    const updatedLeads = leads.map(l => l.id === leadId ? { ...l, documents } : l);
    setLeads(updatedLeads);
    saveLeads(updatedLeads);
  };

  const handleViewDetails = (leadId: string) => {
    router.push(`/dashboard/leads/${leadId}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage your leads and track their progress.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingLead(undefined);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingLead(undefined); setIsFormOpen(true); } }>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLead ? 'Edit Lead' : 'Create New Lead'}</DialogTitle>
            </DialogHeader>
            <LeadForm 
              onSave={handleSaveLead} 
              lead={editingLead}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {lead.email}
                    </div>
                  </TableCell>
                  <TableCell>{lead.serviceType}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.status}</Badge>
                  </TableCell>
                  <TableCell>${lead.value.toLocaleString()}</TableCell>
                  <TableCell>{lead.assignedTo}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(lead.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(lead)}>Edit</DropdownMenuItem>
                        {lead.status === 'Documents Needed' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleOpenUpload(lead)}>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Documents
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(lead.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
