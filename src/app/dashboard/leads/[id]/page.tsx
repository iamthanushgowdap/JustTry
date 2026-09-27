'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLeads, saveLeads, getUser, addTask, addFollowUp } from '@/lib/data';
import type { Lead, PipelineStatus, User, LeadHistory, Document } from '@/lib/definitions';
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
import {
  FileText,
  ChevronLeft,
  MessageSquare,
  ClipboardList,
  Sparkles,
  CheckCircle2,
  XCircle,
  CalendarPlus,
  Plus,
  ExternalLink,
  Phone,
  Mail,
  Building2,
  DollarSign,
  Clock,
  ShieldCheck,
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
  LoanPipelineStatus,
  InvestmentPipelineStatus,
  InsurancePipelineStatus,
} from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { getSession } from '@/lib/actions';
import { suggestTasks } from '@/ai/flows/automated-task-creation';
import { DocumentUploadDialog } from '@/components/dashboard/document-upload-dialog';

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [lead, setLead] = React.useState<Lead | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [newStatus, setNewStatus] = React.useState<string>('');
  const [remarks, setRemarks] = React.useState('');
  const [aiSuggestions, setAiSuggestions] = React.useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = React.useState(false);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);

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

  // Generate AI task suggestions for this lead
  const handleGenerateAiTasks = async () => {
    if (!lead) return;
    setIsAiLoading(true);
    try {
      const res = await suggestTasks({
        leadName: lead.name,
        serviceType: lead.serviceType,
        leadStatus: lead.status,
        subCategory: lead.subCategory,
        leadData: `Value: $${lead.value}, Income: $${lead.annualIncome || 'N/A'}, Company: ${lead.companyName || 'N/A'}`,
      });
      setAiSuggestions(res.tasks);
      toast({
        title: 'AI Tasks Recommended',
        description: `Generated ${res.tasks.length} strategic pipeline actions for ${lead.name}.`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations.',
        variant: 'destructive',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddAiTask = (taskText: string) => {
    if (!lead) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dueDateStr = tomorrow.toISOString().split('T')[0];

    addTask({
      title: taskText,
      description: `Auto-generated checklist item for ${lead.name} (${lead.serviceType} - ${lead.status})`,
      leadId: lead.id,
      leadName: lead.name,
      serviceType: lead.serviceType,
      dueDate: dueDateStr,
      priority: 'high',
      completed: false,
      assignedTo: lead.assignedTo || 'Current Advisor',
    });

    toast({
      title: 'Task Added to Board',
      description: 'Checklist task has been saved to your Tasks dashboard.',
    });

    setAiSuggestions((prev) => prev.filter((t) => t !== taskText));
  };

  const handleUpdateStatus = () => {
    if (!lead || !newStatus || !currentUser) return;

    const timestamp = new Date().toISOString();
    const newHistoryEntry: LeadHistory = {
      status: newStatus,
      timestamp,
      user: currentUser.name,
      remarks: remarks.trim() || `Status updated to ${newStatus}.`,
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
      title: 'Status Updated',
      description: `Pipeline stage moved to "${newStatus}".`,
    });
  };

  const handleDocumentStatus = (docIndex: number, newDocStatus: 'Verified' | 'Rejected') => {
    if (!lead || !lead.documents) return;
    const updatedDocs = [...lead.documents];
    updatedDocs[docIndex] = {
      ...updatedDocs[docIndex],
      status: newDocStatus,
      verifiedBy: currentUser?.name || 'Back Office Officer',
    };

    const timestamp = new Date().toISOString();
    const historyRemark = `Document "${updatedDocs[docIndex].name}" marked as ${newDocStatus} by ${currentUser?.name || 'Back Office'}.`;

    const updatedLead: Lead = {
      ...lead,
      documents: updatedDocs,
      history: [
        ...(lead.history || []),
        { status: lead.status, timestamp, user: currentUser?.name || 'Back Office', remarks: historyRemark },
      ],
    };

    const allLeads = getLeads();
    const updatedLeads = allLeads.map((l) => (l.id === id ? updatedLead : l));
    saveLeads(updatedLeads);
    setLead(updatedLead);

    toast({
      title: `Document ${newDocStatus}`,
      description: `${updatedDocs[docIndex].name} is now ${newDocStatus.toLowerCase()}.`,
    });
  };

  const handleDocumentsUploaded = (leadId: string, docs: Document[]) => {
    if (!lead) return;
    const timestamp = new Date().toISOString();
    const updatedLead: Lead = {
      ...lead,
      documents: docs,
      history: [
        ...(lead.history || []),
        { status: lead.status, timestamp, user: currentUser?.name || 'Advisor', remarks: `Uploaded ${docs.length} document(s).` },
      ],
    };
    const allLeads = getLeads();
    const updatedLeads = allLeads.map((l) => (l.id === id ? updatedLead : l));
    saveLeads(updatedLeads);
    setLead(updatedLead);
  };

  const handleScheduleFollowUp = () => {
    if (!lead) return;
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
      time: '11:30 AM',
      notes: `Consultation with ${lead.name} regarding ${lead.subCategory} application status.`,
      type: 'Call',
      status: 'Pending',
    });

    toast({
      title: 'Follow-up Scheduled',
      description: `Follow-up call added for ${lead.name} on ${dateStr}.`,
    });
    router.push('/dashboard/follow-ups');
  };

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-muted-foreground text-lg">Lead profile not found.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/leads')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Button>
      </div>
    );
  }

  const pipelineStagesMap = {
    Loan: Object.values(LoanPipelineStatus),
    Investment: Object.values(InvestmentPipelineStatus),
    Insurance: Object.values(InsurancePipelineStatus),
  };
  const stages = pipelineStagesMap[lead.serviceType as keyof typeof pipelineStagesMap] || [];
  const currentStageIndex = stages.indexOf(lead.status as any);

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/leads')} className="hover:bg-muted">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleScheduleFollowUp}>
            <CalendarPlus className="mr-1.5 h-4 w-4 text-emerald-500" />
            Schedule Follow-up
          </Button>
          <Button size="sm" variant="default" onClick={handleGenerateAiTasks} disabled={isAiLoading}>
            <Sparkles className="mr-1.5 h-4 w-4 text-amber-300" />
            {isAiLoading ? 'Analyzing...' : 'AI Task Recommendations'}
          </Button>
        </div>
      </div>

      {/* Visual Pipeline Stepper */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="pb-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {lead.serviceType} Workflow Pipeline
              </CardTitle>
              <CardDescription>
                Progress tracker for {lead.subCategory}
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-semibold text-primary">
              Stage: {lead.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 overflow-x-auto">
          <div className="flex items-center min-w-[650px] justify-between relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted -z-0"></div>
            {stages.map((stage, idx) => {
              const isPassed = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={stage} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110 shadow'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-muted text-muted-foreground border'
                    }`}
                  >
                    {isPassed ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] mt-2 font-medium text-center max-w-[90px] leading-tight ${
                      isCurrent ? 'text-primary font-bold' : isPassed ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Left = Details + Docs + AI; Right = Status Update + History */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Customer Profile Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-2xl font-bold">{lead.name}</CardTitle>
                  <CardDescription className="text-sm mt-0.5">
                    {lead.serviceType} • {lead.subCategory}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Application Value</span>
                  <div className="text-2xl font-bold text-primary">
                    ${lead.value.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/20 min-w-0 overflow-hidden">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${lead.email}`} className="font-medium hover:underline truncate block">
                      {lead.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/20 min-w-0 overflow-hidden">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <a href={`tel:${lead.phone}`} className="font-medium hover:underline truncate block">
                      {lead.phone}
                    </a>
                  </div>
                </div>

                {lead.companyName && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/20">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Organization / Company</p>
                      <p className="font-medium">{lead.companyName}</p>
                    </div>
                  </div>
                )}

                {lead.annualIncome && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/20">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Annual Income</p>
                      <p className="font-medium">${lead.annualIncome.toLocaleString()}/yr</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/20">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tax / Govt ID</p>
                    <p className="font-medium font-mono">{lead.panOrId || 'Submitted on Portal'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/20">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned Portfolio Officer</p>
                    <p className="font-medium">{lead.assignedTo}</p>
                  </div>
                </div>
              </div>

              {lead.notes && (
                <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 block text-xs mb-1">Advisor Notes</span>
                  <p className="text-foreground/90">{lead.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Task Suggestions Card */}
          {aiSuggestions.length > 0 && (
            <Card className="border-amber-400/40 bg-amber-50/30 dark:bg-amber-950/20 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <Sparkles className="h-4 w-4" />
                    AI Recommended Action Checklist
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setAiSuggestions([])} className="text-xs">
                    Dismiss
                  </Button>
                </div>
                <CardDescription>
                  Tailored tasks based on stage ({lead.status}) and {lead.serviceType} compliance rules.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiSuggestions.map((taskStr, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border text-sm gap-3 shadow-xs"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold text-xs mt-0.5">•</span>
                      <span>{taskStr}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-xs h-7"
                      onClick={() => handleAddAiTask(taskStr)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add to Tasks
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* KYC Documents Card with Approval Actions */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  KYC & Compliance Documents
                </CardTitle>
                <CardDescription>
                  Customer uploaded verification proofs and financial statements.
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsUploadOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Upload New
              </Button>
            </CardHeader>
            <CardContent>
              {lead.documents && lead.documents.length > 0 ? (
                <div className="space-y-3">
                  {lead.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border bg-card gap-3 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <Badge
                              variant={
                                doc.status === 'Verified'
                                  ? 'default'
                                  : doc.status === 'Rejected'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="text-[10px] py-0"
                            >
                              {doc.status || 'Pending Review'}
                            </Badge>
                            {doc.verifiedBy && (
                              <span>by {doc.verifiedBy}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => window.open(doc.url || '#', '_blank')}
                        >
                          <ExternalLink className="mr-1 h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          onClick={() => handleDocumentStatus(index, 'Verified')}
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => handleDocumentStatus(index, 'Rejected')}
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm">No documents submitted yet for this application.</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => setIsUploadOpen(true)}>
                    Upload Customer KYC
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Status Transition + History Timeline */}
        <div className="space-y-6 min-w-0">
          {/* Status Update Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Update Pipeline Stage</CardTitle>
              <CardDescription>Advance lead through workflow milestones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Next Milestone</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select target status" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Advisor / Officer Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Record verification notes, underwriting condition, or customer feedback..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleUpdateStatus}
                disabled={!newStatus || newStatus === lead.status}
              >
                Save & Advance Stage
              </Button>
            </CardFooter>
          </Card>

          {/* Audit History Timeline */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Audit Trail & History
              </CardTitle>
              <CardDescription>Timestamped record of all activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-5">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-border"></div>
                {lead.history?.slice().reverse().map((entry, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-primary ring-4 ring-background"></div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    <div className="mt-1 p-2.5 rounded-lg bg-muted/40 border text-xs">
                      <div className="font-semibold text-foreground">
                        Stage: <span className="text-primary">{entry.status}</span>
                      </div>
                      <div className="text-muted-foreground mt-0.5">By {entry.user}</div>
                      {entry.remarks && (
                        <p className="mt-1.5 text-foreground/90 italic">"{entry.remarks}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document Upload Dialog */}
      <DocumentUploadDialog
        isOpen={isUploadOpen}
        setIsOpen={setIsUploadOpen}
        lead={lead}
        onUpload={handleDocumentsUploaded}
      />
    </div>
  );
}
