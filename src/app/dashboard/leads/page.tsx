'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getLeads, getLeadsByAssignedUser, getUserByEmail, getSalesUsers, saveLeads } from '../../../lib/data';
import { supabase } from '@/lib/supabase';
import type { Lead, Document, UserRole } from '@/lib/definitions';
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
import { MoreHorizontal, PlusCircle, Upload, Eye, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LeadForm } from '@/components/dashboard/lead-form';
import { DocumentUploadDialog } from '@/components/dashboard/document-upload-dialog';
import { CibilCheckDialog } from '@/components/dashboard/cibil-check-dialog';

export default function LeadsPage() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [editingLead, setEditingLead] = React.useState<Lead | undefined>(undefined);
  const [uploadLead, setUploadLead] = React.useState<Lead | undefined>(undefined);
  const [salesUsers, setSalesUsers] = React.useState<any[]>([]);
  const [isCibilOpen, setIsCibilOpen] = React.useState(false);
  const [cibilLead, setCibilLead] = React.useState<Lead | undefined>(undefined);
  const router = useRouter();

  React.useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let role: UserRole = 'sales';
      let userId: string | null = null;
      let userServiceTypes: string[] = [];

      if (authUser?.email) {
        const userData = await getUserByEmail(authUser.email);
        role = userData?.role || 'sales';
        userId = userData?.id || null;
        userServiceTypes = userData?.serviceTypes || [];
        console.log('User data:', { role, userId, userServiceTypes, email: authUser.email });
      }

      setUserRole(role);

      let filteredLeads: Lead[] = [];

      if (role === 'sales' && userId) {
        // Sales users only see their assigned leads
        filteredLeads = await getLeadsByAssignedUser(userId);
      } else if (role === 'back-office') {
        // Back-office users see leads of their assigned service types, excluding 'New' status
        const allLeads = await getLeads();
        console.log('All leads:', allLeads.map(l => ({ id: l.id, serviceType: l.serviceType, status: l.status })));

        filteredLeads = allLeads.filter(lead => {
          const matchesStatus = lead.status !== 'New';
          const matchesServiceType = userServiceTypes.length === 0 || userServiceTypes.includes(lead.serviceType);
          const shouldInclude = matchesStatus && matchesServiceType;

          console.log(`Lead ${lead.id}: status=${lead.status} (${matchesStatus ? '✓' : '✗'}), serviceType=${lead.serviceType} (${matchesServiceType ? '✓' : '✗'}) → ${shouldInclude ? 'INCLUDE' : 'EXCLUDE'}`);

          return shouldInclude;
        });

        console.log('Filtered leads for back-office:', filteredLeads.map(l => ({ id: l.id, serviceType: l.serviceType, status: l.status })));
      } else {
        // Admin and other roles see all leads
        filteredLeads = await getLeads();
      }

      const salesUsersData = await getSalesUsers();
      setLeads(filteredLeads);
      setSalesUsers(salesUsersData);
    }
    fetchData();
  }, []);

  const handleSaveLead = async (lead: Lead) => {
    console.log('handleSaveLead called with lead:', lead);
    console.log('editingLead:', editingLead);
    
    let updatedLeads;
    const timestamp = new Date().toISOString();
    
    // Always fetch all leads from database to ensure we don't lose data
    const allLeads = await getLeads();
    console.log('Fetched all leads from DB, count:', allLeads.length);
    
    if (editingLead) {
      console.log('Editing existing lead');
      updatedLeads = allLeads.map((l) => (l.id === lead.id ? lead : l));
    } else {
      console.log('Creating new lead');
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
      updatedLeads = [...allLeads, newLead];
    }
    
    console.log('Updated leads count:', updatedLeads.length);
    
    try {
      console.log('Calling saveLeads...');
      await saveLeads(updatedLeads);
      console.log('saveLeads completed successfully');
      
      // Update local state with filtered leads again
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let userId: string | null = null;
      let role: UserRole = 'sales';
      let userServiceTypes: string[] = [];
      
      if (authUser?.email) {
        const userData = await getUserByEmail(authUser.email);
        role = userData?.role || 'sales';
        userId = userData?.id || null;
        userServiceTypes = userData?.serviceTypes || [];
      }
      
      let refilteredLeads: Lead[] = [];
      if (role === 'sales' && userId) {
        refilteredLeads = await getLeadsByAssignedUser(userId);
      } else if (role === 'back-office') {
        refilteredLeads = allLeads.filter(lead =>
          lead.status !== 'New' &&
          (userServiceTypes.length === 0 || userServiceTypes.includes(lead.serviceType))
        );
      } else {
        refilteredLeads = allLeads;
      }
      
      setLeads(refilteredLeads);
      setIsFormOpen(false);
      setEditingLead(undefined);
    } catch (error) {
      console.error('Error in handleSaveLead:', error);
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    const updatedLeads = leads.filter(l => l.id !== id);
    setLeads(updatedLeads);
    await saveLeads(updatedLeads);
  };

  const handleOpenUpload = (lead: Lead) => {
    setUploadLead(lead);
    setIsUploadOpen(true);
  };

  const handleDocumentUpload = async (leadId: string, documents: Document[]) => {
    const updatedLeads = leads.map(l => l.id === leadId ? { ...l, documents } : l);
    setLeads(updatedLeads);
    await saveLeads(updatedLeads);
  };

  const handleOpenCibil = (lead: Lead) => {
    setCibilLead(lead);
    setIsCibilOpen(true);
  };

  const handleCibilCheck = async (leadId: string, cibilData: any) => {
    const timestamp = new Date().toISOString();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    let currentUserId = 'system';

    if (authUser?.email) {
      const userData = await getUserByEmail(authUser.email);
      currentUserId = userData?.id || 'system';
    }

    const cibilHistoryEntry = {
      status: 'Eligibility Check',
      timestamp,
      user: currentUserId,
      remarks: `CIBIL Score: ${cibilData.score} (${cibilData.riskCategory}). Total accounts: ${cibilData.totalAccounts}, Overdue: ${cibilData.overdueAccounts}`,
      cibilData: cibilData, // Store full CIBIL data for viewing
    };

    const updatedLeads = leads.map(l => l.id === leadId ? {
      ...l,
      history: [...(l.history || []), cibilHistoryEntry]
    } : l);

    setLeads(updatedLeads);
    await saveLeads(updatedLeads);
  };

  const handleViewDetails = (leadId: string) => {
    router.push(`/dashboard/leads/${leadId}`);
  }

  const getUserNameById = (userId: string) => {
    const user = salesUsers.find(u => u.id === userId);
    return user ? `${user.name}${user.department ? ` (${user.department})` : ''}` : userId;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage your leads and track their progress.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(isOpen: boolean) => {
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
              <DialogDescription>
                {editingLead ? 'Update the lead information.' : 'Fill in the details to create a new lead.'}
              </DialogDescription>
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
          <div className="overflow-x-auto">
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
                  <TableCell>{getUserNameById(lead.assignedTo)}</TableCell>
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
                        {lead.status === 'Eligibility Check' && lead.serviceType === 'Loan' && (userRole === 'back-office' || userRole === 'admin') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleOpenCibil(lead)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Run CIBIL Check
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
          </div>
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
      {cibilLead && (
        <CibilCheckDialog
            isOpen={isCibilOpen}
            setIsOpen={setIsCibilOpen}
            lead={cibilLead}
            onCibilCheck={handleCibilCheck}
        />
      )}
    </div>
  );
}
