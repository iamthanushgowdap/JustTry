'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  getFollowUps,
  addFollowUp,
  toggleFollowUpStatus,
  deleteFollowUp,
  getLeads,
} from '@/lib/data';
import type { FollowUp, Lead, FollowUpType } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Phone,
  Mail,
  Users,
  BellOff,
  CalendarPlus,
  Clock,
  CheckCircle2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = React.useState<FollowUp[]>([]);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [activeTab, setActiveTab] = React.useState<'pending' | 'completed' | 'all'>('pending');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();

  // Form states
  const [selectedLeadId, setSelectedLeadId] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('11:00 AM');
  const [type, setType] = React.useState<FollowUpType>('Call');
  const [notes, setNotes] = React.useState('');

  const loadData = React.useCallback(() => {
    setFollowUps(getFollowUps());
    const allLeads = getLeads();
    setLeads(allLeads);
    if (allLeads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(allLeads[0].id);
    }
  }, [selectedLeadId]);

  React.useEffect(() => {
    loadData();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
  }, [loadData]);

  const handleToggle = (id: string) => {
    const updated = toggleFollowUpStatus(id);
    setFollowUps(getFollowUps());
    if (updated?.status === 'Completed') {
      toast({
        title: 'Follow-up Completed',
        description: `Follow-up with ${updated.leadName} marked as completed.`,
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    deleteFollowUp(id);
    setFollowUps(getFollowUps());
    toast({
      title: 'Follow-up Removed',
      description: `Follow-up with ${name} deleted.`,
      variant: 'destructive',
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const lead = leads.find((l) => l.id === selectedLeadId);
    if (!lead || !date || !notes.trim()) return;

    addFollowUp({
      leadId: lead.id,
      leadName: lead.name,
      email: lead.email,
      phone: lead.phone,
      serviceType: lead.serviceType,
      date,
      time,
      notes: notes.trim(),
      type,
      status: 'Pending',
    });

    setFollowUps(getFollowUps());
    setIsDialogOpen(false);
    setNotes('');
    toast({
      title: 'Follow-up Scheduled',
      description: `Scheduled ${type.toLowerCase()} with ${lead.name} for ${date} at ${time}.`,
    });
  };

  const filtered = followUps.filter((f) => {
    if (activeTab === 'pending') return f.status === 'Pending';
    if (activeTab === 'completed') return f.status === 'Completed';
    return true;
  });

  const pendingCount = followUps.filter((f) => f.status === 'Pending').length;
  const completedCount = followUps.filter((f) => f.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Follow-ups & Appointments</h1>
          <p className="text-muted-foreground">
            Schedule calls, meetings, and document collections with your clients.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <CalendarPlus className="mr-1.5 h-4 w-4" />
              Schedule Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Client Follow-up</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Select Client Lead *</Label>
                <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name} — {l.serviceType} (${l.value.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Communication Mode</Label>
                  <Select value={type} onValueChange={(val: any) => setType(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Call">Phone Call</SelectItem>
                      <SelectItem value="Email">Email Follow-up</SelectItem>
                      <SelectItem value="Meeting">In-Person / Video Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Scheduled Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time Slot</Label>
                <Input
                  id="time"
                  placeholder="e.g. 11:30 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Agenda & Discussion Notes *</Label>
                <Textarea
                  id="notes"
                  placeholder="Specify discussion points, document requirements, or questions to resolve..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Confirm Schedule</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted rounded-lg w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-background shadow-xs text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Upcoming / Pending ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-background shadow-xs text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Completed ({completedCount})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-background shadow-xs text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All ({followUps.length})
        </button>
      </div>

      {/* Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((fu) => (
            <Card
              key={fu.id}
              className={`flex flex-col justify-between shadow-sm transition-all min-w-0 ${
                fu.status === 'Completed' ? 'opacity-70 bg-muted/20' : 'hover:border-primary/40'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-10 w-10 border shrink-0">
                      <AvatarImage src={fu.avatar} />
                      <AvatarFallback>{fu.leadName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/dashboard/leads/${fu.leadId}`}
                        className="font-bold text-base hover:underline flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{fu.leadName}</span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                      </Link>
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {fu.serviceType}
                      </Badge>
                    </div>
                  </div>

                  <Badge
                    variant={fu.status === 'Completed' ? 'default' : 'secondary'}
                    className="text-xs shrink-0"
                  >
                    {fu.type}
                  </Badge>
                </div>

                <div className="mt-2 text-xs flex items-center gap-1.5 text-primary font-medium">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {fu.date} {fu.time ? `• ${fu.time}` : ''}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                <div className="p-3 rounded-lg bg-muted/40 border text-xs">
                  <p className="text-foreground leading-relaxed break-words">{fu.notes}</p>
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground truncate">
                  Contact: <span className="font-medium text-foreground">{fu.phone}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  <a href={`tel:${fu.phone}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                      <Phone className="mr-1 h-3 w-3 text-sky-500" />
                      Call
                    </Button>
                  </a>
                  <a href={`mailto:${fu.email}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                      <Mail className="mr-1 h-3 w-3 text-emerald-500" />
                      Email
                    </Button>
                  </a>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant={fu.status === 'Completed' ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleToggle(fu.id)}
                  >
                    <CheckCircle2
                      className={`mr-1 h-3.5 w-3.5 ${
                        fu.status === 'Completed' ? 'text-emerald-500' : 'text-muted-foreground'
                      }`}
                    />
                    {fu.status === 'Completed' ? 'Done' : 'Mark Done'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(fu.id, fu.leadName)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center h-[360px]">
          <BellOff className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-semibold">No follow-ups in this tab</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Keep strong customer relationships by scheduling your next contact directly from here or the leads table.
          </p>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
            Schedule New Follow-up
          </Button>
        </div>
      )}
    </div>
  );
}
