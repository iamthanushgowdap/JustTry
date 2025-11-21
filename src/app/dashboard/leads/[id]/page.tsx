'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLeads, saveLeads, getUser, getUsers } from '@/lib/data';
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
import { LoanPipelineStatus, InvestmentPipelineStatus, InsurancePipelineStatus } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { getSession } from '@/lib/actions';

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [lead, setLead] = React.useState<Lead | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [newStatus, setNewStatus] = React.useState<string>('');
  const [remarks, setRemarks] = React.useState('');

  React.useEffect(() => {
    if (id) {
      const allLeads = getLeads();
      const foundLead = allLeads.find((l) => l.id === id);
      setLead(foundLead || null);
      if (foundLead) {
        setNewStatus(foundLead.status);
      }
    }
    async function fetchUser() {
        const session = await getSession();
        if (session) {
            const user = getUser(session.role);
            setCurrentUser(user);
        }
    }
    fetchUser();
  }, [id]);

  const handleUpdateStatus = () => {
    if (!lead || !newStatus || !currentUser) return;

    const timestamp = new Date().toISOString();
    const newHistoryEntry: LeadHistory = {
      status: newStatus,
      timestamp,
      user: currentUser.name,
      remarks,
    };

    const updatedLead: Lead = {
      ...lead,
      status: newStatus as PipelineStatus,
      history: [...(lead.history || []), newHistoryEntry],
    };

    const allLeads = getLeads();
    const updatedLeads = allLeads.map((l) => (l.id === id ? updatedLead : l));
    saveLeads(updatedLeads);
    setLead(updatedLead);
    setRemarks('');

    toast({
      title: 'Lead Updated',
      description: `Status changed to ${newStatus}.`,
    });
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
  const canUpdateStatus = currentUser?.role === 'back-office' || currentUser?.role === 'admin';


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
                        <span>{lead.assignedTo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant="outline">{lead.status}</Badge>
                    </div>
                </CardContent>
            </Card>

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
                            <Button variant="outline" size="sm" onClick={() => alert('Simulating document download...')}>View</Button>
                        </li>
                        ))}
                    </ul>
                    ) : (
                    <p className="text-muted-foreground">No documents uploaded for this lead.</p>
                    )}
                </CardContent>
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
                                <p className="font-medium">
                                    Status changed to <Badge variant="secondary">{entry.status}</Badge> by {entry.user}
                                </p>
                                {entry.remarks && (
                                <p className="mt-2 text-sm text-muted-foreground italic">"{entry.remarks}"</p>
                                )}
                            </div>
                        </div>
                        ))}
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
    </div>
  );
}
