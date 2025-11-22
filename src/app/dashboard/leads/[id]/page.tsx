'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLeads, saveLeads, getUser, getUsers, getUserByEmail } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import type { Lead, PipelineStatus, User, UserRole, LeadHistory } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  File,
  ChevronLeft,
  MessageSquare,
  ClipboardList,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoanPipelineStatus, InvestmentPipelineStatus, InsurancePipelineStatus } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { getSession } from '@/lib/actions';
import { CustomEmailDialog } from '@/components/dashboard/custom-email-dialog';
import { BankDetailsForm } from '@/components/dashboard/bank-details-form';
import { DisbursementPanel } from '@/components/dashboard/disbursement-panel';
import { EligibilityStatus } from '@/components/dashboard/eligibility-status';
import { CibilCheckDialog } from '@/components/dashboard/cibil-check-dialog';

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [lead, setLead] = React.useState<Lead | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [newStatus, setNewStatus] = React.useState<string>('');
  const [remarks, setRemarks] = React.useState('');
  const [viewingCibil, setViewingCibil] = React.useState<any>(null);
  const [isCustomEmailOpen, setIsCustomEmailOpen] = React.useState(false);
  const [isCibilCheckOpen, setIsCibilCheckOpen] = React.useState(false);

  React.useEffect(() => {
    async function fetchData() {
      console.log('Lead details page - fetching data for id:', id);
      
      if (id) {
        const allLeads = await getLeads();
        const foundLead = allLeads.find((l) => l.id === id);
        console.log('Found lead:', foundLead ? 'YES' : 'NO', foundLead?.id);
        setLead(foundLead || null);
        if (foundLead) {
          setNewStatus(foundLead.status);
        }
      }
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log('Auth user:', authUser?.email);
      
      if (authUser?.email) {
        const userData = await getUserByEmail(authUser.email);
        console.log('Current user data:', userData);
        setCurrentUser(userData);
      }
      
      // Fetch all users for displaying names in history
      const allUsers = await getUsers();
      console.log('Fetched users count:', allUsers.length);
      setUsers(allUsers);
    }
    fetchData();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!lead || !newStatus || !currentUser) {
      console.error('Missing required data:', { lead: !!lead, newStatus, currentUser: !!currentUser });
      return;
    }

    console.log('Updating lead status:', { leadId: lead.id, oldStatus: lead.status, newStatus, user: currentUser.id });

    const timestamp = new Date().toISOString();
    const newHistoryEntry: LeadHistory = {
      status: newStatus,
      timestamp,
      user: currentUser.id,
      remarks,
    };

    const updatedLead: Lead = {
      ...lead,
      status: newStatus as PipelineStatus,
      history: [...(lead.history || []), newHistoryEntry],
    };

    try {
      const allLeads = await getLeads();
      console.log('Fetched all leads, count:', allLeads.length);

      const updatedLeads = allLeads.map((l) => (l.id === id ? updatedLead : l));
      console.log('Updated leads array, saving...');

      await saveLeads(updatedLeads);
      console.log('Successfully saved leads');

      setLead(updatedLead);
      setRemarks('');

      toast({
        title: 'Lead Updated',
        description: `Status changed to ${newStatus}.`,
      });

      // Trigger AI call for approved statuses
      await triggerAICallIfNeeded(updatedLead, newStatus);

    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const triggerAICallIfNeeded = async (lead: Lead, newStatus: string) => {
    const approvedStatuses = {
      'Loan': 'Approved',
      'Investment': 'Activated',
      'Insurance': 'Policy Issued'
    };

    const expectedStatus = approvedStatuses[lead.serviceType as keyof typeof approvedStatuses];

    if (newStatus === expectedStatus && lead.phone) {
      console.log('Triggering AI call for approved status:', { leadId: lead.id, status: newStatus });

      try {
        const response = await fetch('/api/ai-call', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: lead.phone,
            name: lead.name,
            serviceType: lead.serviceType,
            status: newStatus,
            leadId: lead.id
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Log the AI call in history
          const callTimestamp = new Date().toISOString();
          const callHistoryEntry: LeadHistory = {
            status: newStatus,
            timestamp: callTimestamp,
            user: 'system',
            remarks: `AI call initiated to announce ${newStatus} status (Call ID: ${result.callId})`,
          };

          const allLeads = await getLeads();
          const updatedLeadWithCall = {
            ...lead,
            history: [...(lead.history || []), callHistoryEntry],
          };

          const updatedLeads = allLeads.map((l) => (l.id === id ? updatedLeadWithCall : l));
          await saveLeads(updatedLeads);
          setLead(updatedLeadWithCall);

          toast({
            title: 'AI Call Initiated',
            description: 'Automated call sent to customer announcing the approval.',
          });
        } else {
          console.warn('AI call failed:', result.message);
          toast({
            title: 'AI Call Warning',
            description: 'Status updated but AI call could not be initiated.',
            variant: 'default',
          });
        }
      } catch (error) {
        console.error('Error triggering AI call:', error);
        // Don't show error toast as the status update was successful
      }
    }

    // Also trigger email automation
    if (newStatus === expectedStatus && lead.email) {
      console.log('Triggering AI email for approved status:', { leadId: lead.id, status: newStatus });

      try {
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: lead.email,
            name: lead.name,
            serviceType: lead.serviceType,
            status: newStatus,
            leadId: lead.id
          }),
        });

        const emailResult = await emailResponse.json();

        if (emailResult.success) {
          // Log the email in history
          const emailTimestamp = new Date().toISOString();
          const emailHistoryEntry: LeadHistory = {
            status: newStatus,
            timestamp: emailTimestamp,
            user: 'system',
            remarks: `AI-generated email sent to announce ${newStatus} status (Email ID: ${emailResult.emailId})`,
          };

          const allLeads = await getLeads();
          const updatedLeadWithEmail = {
            ...lead,
            history: [...(lead.history || []), emailHistoryEntry],
          };

          const updatedLeads = allLeads.map((l) => (l.id === id ? updatedLeadWithEmail : l));
          await saveLeads(updatedLeads);
          setLead(updatedLeadWithEmail);

          toast({
            title: 'Email Sent',
            description: 'AI-generated personalized email sent to customer.',
          });
        } else {
          console.warn('Email failed:', emailResult.message);
          toast({
            title: 'Email Warning',
            description: 'Status updated but email could not be sent.',
            variant: 'default',
          });
        }
      } catch (error) {
        console.error('Error triggering email:', error);
        // Don't show error toast as the status update was successful
      }
    }
  };

  const handleCustomEmailSent = async (leadId: string, emailData: any) => {
    const emailTimestamp = new Date().toISOString();
    const emailHistoryEntry: LeadHistory = {
      status: lead?.status || 'Unknown',
      timestamp: emailTimestamp,
      user: currentUser?.id || 'system',
      remarks: `Custom email sent: "${emailData.subject}" (Email ID: ${emailData.emailId})`,
    };

    const allLeads = await getLeads();
    const updatedLeadWithEmail: Lead = {
      ...lead!,
      history: [...(lead!.history || []), emailHistoryEntry],
    };

    const updatedLeads = allLeads.map((l) => (l.id === id ? updatedLeadWithEmail : l));
    await saveLeads(updatedLeads);
    setLead(updatedLeadWithEmail);
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
      cibilData: cibilData,
    };

    const allLeads = await getLeads();
    const updatedLead = allLeads.find(l => l.id === leadId);
    if (updatedLead) {
      const updatedLeadWithCibil = {
        ...updatedLead,
        history: [...(updatedLead.history || []), cibilHistoryEntry],
      };

      const updatedLeads = allLeads.map((l) => (l.id === leadId ? updatedLeadWithCibil : l));
      await saveLeads(updatedLeads);
      setLead(updatedLeadWithCibil);
    }
  };

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Lead not found.</p>
      </div>
    );
  }

  const statuses = {
    Loan: Object.values(LoanPipelineStatus),
    Investment: Object.values(InvestmentPipelineStatus),
    Insurance: Object.values(InsurancePipelineStatus),
  };
  const relevantStatuses = statuses[lead.serviceType as keyof typeof statuses];
  const canUpdateStatus = currentUser?.role === 'sales' || currentUser?.role === 'back-office' || currentUser?.role === 'admin';
  console.log('Can update status:', canUpdateStatus, 'User role:', currentUser?.role);

  const getUserNameById = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.name}${user.department ? ` (${user.department})` : ''}` : userId;
  };


  return (
    <div className="space-y-8">
       <div>
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Button>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{lead.name}</CardTitle>
                    <CardDescription>
                    {lead.serviceType} / {lead.subCategory}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Lead ID</span>
                        <span>{lead.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span>{lead.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Lead Value</span>
                        <span className="font-semibold">${lead.value.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Assigned To</span>
                        <span>{getUserNameById(lead.assignedTo)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant="outline">{lead.status}</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Eligibility Status - Show for Back-office users when lead is Loan and Eligibility Check status */}
            {currentUser?.role === 'back-office' && lead.serviceType === 'Loan' && lead.status === 'Eligibility Check' && (
              <EligibilityStatus
                lead={lead}
                onRunCheck={() => setIsCibilCheckOpen(true)}
              />
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><ClipboardList className="mr-2 h-5 w-5" />Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    {lead.documents && lead.documents.length > 0 ? (
                    <ul className="space-y-2">
                        {lead.documents.map((doc, index) => (
                        <li key={index} className="flex items-center justify-between rounded-md border p-3">
                            <div className="flex items-center gap-2">
                                <File className="h-5 w-5 text-primary" />
                                <span className="font-medium">{doc.name}</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => window.open(doc.url, '_blank')}>View</Button>
                        </li>
                        ))}
                    </ul>
                    ) : (
                    <p className="text-muted-foreground">No documents uploaded for this lead.</p>
                    )}
                </CardContent>
            </Card>

            {/* Bank Details Form - Show for Sales and Back-office users when lead is Loan type */}
            {(currentUser?.role === 'sales' || currentUser?.role === 'back-office') && lead.serviceType === 'Loan' && (
              <BankDetailsForm
                lead={lead}
                onUpdate={setLead}
                userRole={currentUser.role}
              />
            )}

            {/* Disbursement Panel - Show for Back-office users when lead is approved and has verified bank details */}
            {currentUser?.role === 'back-office' && lead.serviceType === 'Loan' && lead.status === 'Approved' && lead.bankDetails?.verifiedBy && (
              <DisbursementPanel
                lead={lead}
                onUpdate={setLead}
              />
            )}

            {/* Custom Email Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                            <MessageSquare className="mr-2 h-5 w-5" />
                            Send Custom Email
                        </span>
                        <Button onClick={() => setIsCustomEmailOpen(true)} size="sm">
                            Compose Email
                        </Button>
                    </CardTitle>
                    <CardDescription>
                        Create and send personalized emails using AI assistance
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><MessageSquare className="mr-2 h-5 w-5" />Lead History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="relative pl-6">
                        <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
                        {lead.history?.slice().reverse().map((entry, index) => (
                        <div key={index} className="relative mb-6">
                            <div className="absolute -left-7 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background"></div>
                            <p className="text-sm text-muted-foreground">
                                {new Date(entry.timestamp).toLocaleString()}
                            </p>
                            <div className="p-3 rounded-md bg-muted/50 mt-1">
                                <div className="font-medium">
                                  Status changed to <Badge variant="secondary">{entry.status}</Badge> by {getUserNameById(entry.user)}
                                </div>
                                {entry.remarks && (
                                <p className="mt-2 text-sm text-muted-foreground italic">"{entry.remarks}"</p>
                                )}
                                {entry.cibilData && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => setViewingCibil(entry.cibilData)}
                                >
                                    View CIBIL Details
                                </Button>
                                )}
                            </div>
                        </div>
                        ))}

                        {/* Show disbursement information */}
                        {lead.disbursements && lead.disbursements.length > 0 && (
                            <div className="relative mb-6">
                                <div className="absolute -left-7 top-1.5 h-3 w-3 rounded-full bg-green-500 ring-4 ring-background"></div>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(lead.disbursements[0].initiatedAt).toLocaleString()}
                                </p>
                                <div className="p-3 rounded-md bg-green-50 border border-green-200 mt-1">
                                    <div className="font-medium text-green-900 flex items-center gap-2">
                                        <span>💰 Loan Disbursement</span>
                                        <Badge variant={lead.disbursements[0].status === 'completed' ? 'default' : 'destructive'}>
                                            {lead.disbursements[0].status === 'completed' ? '✅ Completed' :
                                             lead.disbursements[0].status === 'failed' ? '❌ Failed' :
                                             '⏳ Processing'}
                                        </Badge>
                                    </div>
                                    <div className="mt-2 space-y-1 text-sm text-green-800">
                                        <p><strong>Amount:</strong> ₹{lead.disbursements[0].amount.toLocaleString()}</p>
                                        <p><strong>Reference ID:</strong> {lead.disbursements[0].referenceId}</p>
                                        <p><strong>Initiated by:</strong> {getUserNameById(lead.disbursements[0].initiatedBy)}</p>
                                        {lead.disbursements[0].completedAt && (
                                            <p><strong>Completed:</strong> {new Date(lead.disbursements[0].completedAt).toLocaleString()}</p>
                                        )}
                                        {lead.disbursements[0].failureReason && (
                                            <p className="text-red-600"><strong>Error:</strong> {lead.disbursements[0].failureReason}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {canUpdateStatus && (
                <Card>
                    <CardHeader>
                        <CardTitle>Update Status</CardTitle>
                        <CardDescription>Change the lead's status and add remarks.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">New Status</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger id="status">
                                <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                {relevantStatuses.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea 
                                id="remarks"
                                placeholder="Add any relevant notes or remarks..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleUpdateStatus} disabled={!newStatus || newStatus === lead.status}>Update</Button>
                    </CardFooter>
                </Card>
            )}
        </div>
      </div>

      {/* CIBIL Details Dialog */}
      {viewingCibil && (
        <Dialog open={!!viewingCibil} onOpenChange={() => setViewingCibil(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>CIBIL Score Details</DialogTitle>
              <DialogDescription>
                Credit report details for this lead.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">CIBIL Score</Label>
                  <p className="text-2xl font-bold text-primary">{viewingCibil.score}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Risk Category</Label>
                  <p className={`font-semibold ${
                    viewingCibil.riskCategory === 'Low Risk' ? 'text-green-600' :
                    viewingCibil.riskCategory === 'Medium Risk' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {viewingCibil.riskCategory}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Total Accounts</Label>
                  <p className="text-lg">{viewingCibil.totalAccounts}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Overdue Accounts</Label>
                  <p className="text-lg">{viewingCibil.overdueAccounts}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Report Date</Label>
                <p className="text-sm text-muted-foreground">{viewingCibil.creditReportDate}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Generated At</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(viewingCibil.generatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Custom Email Dialog */}
      <CustomEmailDialog
        isOpen={isCustomEmailOpen}
        setIsOpen={setIsCustomEmailOpen}
        lead={lead}
        onEmailSent={handleCustomEmailSent}
      />

      {/* CIBIL Check Dialog */}
      {lead && (
        <CibilCheckDialog
          isOpen={isCibilCheckOpen}
          setIsOpen={setIsCibilCheckOpen}
          lead={lead}
          onCibilCheck={handleCibilCheck}
        />
      )}
    </div>
  );
}
