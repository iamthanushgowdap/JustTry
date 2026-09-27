'use client';

import * as React from 'react';
import Link from 'next/link';
import { getTasks, saveTasks, addTask, toggleTask, deleteTask, getLeads } from '@/lib/data';
import type { Task, Lead, TaskPriority } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  ClipboardList,
  PlusCircle,
  Sparkles,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestTasks } from '@/ai/flows/automated-task-creation';

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [activeTab, setActiveTab] = React.useState<'all' | 'pending' | 'completed' | 'high'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isAiLoading, setIsAiLoading] = React.useState(false);
  const { toast } = useToast();

  // New task form state
  const [newTitle, setNewTitle] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');
  const [newLeadId, setNewLeadId] = React.useState('none');
  const [newPriority, setNewPriority] = React.useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = React.useState('');
  const [newAssignedTo, setNewAssignedTo] = React.useState('Alex Sales');

  const loadData = React.useCallback(() => {
    setTasks(getTasks());
    setLeads(getLeads());
  }, []);

  React.useEffect(() => {
    loadData();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    setNewDueDate(tomorrow.toISOString().split('T')[0]);
  }, [loadData]);

  const handleToggle = (id: string) => {
    const updated = toggleTask(id);
    setTasks(getTasks());
    if (updated?.completed) {
      toast({
        title: 'Task Completed',
        description: `Marked "${updated.title}" as complete.`,
      });
    }
  };

  const handleDelete = (id: string, title: string) => {
    deleteTask(id);
    setTasks(getTasks());
    toast({
      title: 'Task Removed',
      description: `Task "${title}" removed from board.`,
      variant: 'destructive',
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const selectedLead = leads.find((l) => l.id === newLeadId);

    addTask({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      leadId: selectedLead?.id,
      leadName: selectedLead?.name,
      serviceType: selectedLead?.serviceType,
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      priority: newPriority,
      completed: false,
      assignedTo: newAssignedTo,
    });

    setTasks(getTasks());
    setIsDialogOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewLeadId('none');
    toast({
      title: 'Task Created',
      description: 'Your new task has been recorded in local storage.',
    });
  };

  // AI Pipeline Task Generator
  const handleAutoGenerateAiTasks = async () => {
    setIsAiLoading(true);
    try {
      const activeLeads = leads.filter(
        (l) => l.status !== 'Completed' && l.status !== 'Approved' && l.status !== 'Policy Issued'
      );

      if (activeLeads.length === 0) {
        toast({
          title: 'No Active Leads',
          description: 'All leads are already completed or approved.',
        });
        setIsAiLoading(false);
        return;
      }

      let generatedCount = 0;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const defaultDue = tomorrow.toISOString().split('T')[0];

      for (const lead of activeLeads.slice(0, 4)) {
        const res = await suggestTasks({
          leadName: lead.name,
          serviceType: lead.serviceType,
          leadStatus: lead.status,
          subCategory: lead.subCategory,
        });

        // Add the top suggested task for each lead if not already existing
        if (res.tasks.length > 0) {
          const taskTitle = res.tasks[0];
          const exists = tasks.some(
            (t) => t.leadId === lead.id && t.title.toLowerCase() === taskTitle.toLowerCase()
          );

          if (!exists) {
            addTask({
              title: taskTitle,
              description: `AI recommended task for ${lead.name} (${lead.serviceType} - ${lead.status})`,
              leadId: lead.id,
              leadName: lead.name,
              serviceType: lead.serviceType,
              dueDate: defaultDue,
              priority: lead.status === 'Documents Needed' || lead.status === 'KYC Pending' ? 'high' : 'medium',
              completed: false,
              assignedTo: lead.assignedTo || 'Alex Sales',
            });
            generatedCount++;
          }
        }
      }

      setTasks(getTasks());
      toast({
        title: 'AI Tasks Generated',
        description: `Successfully analyzed active leads and generated ${generatedCount} contextual pipeline tasks.`,
      });
    } catch {
      toast({
        title: 'Generation Failed',
        description: 'Could not generate pipeline tasks.',
        variant: 'destructive',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.leadName && t.leadName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'pending') return !t.completed;
    if (activeTab === 'completed') return t.completed;
    if (activeTab === 'high') return t.priority === 'high' && !t.completed;
    return true;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const highPriorityCount = tasks.filter((t) => t.priority === 'high' && !t.completed).length;

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs uppercase font-semibold">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs uppercase font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs uppercase">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks & Operational Checklist</h1>
          <p className="text-muted-foreground">
            Manage your daily KYC verification, client consultations, and pipeline actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoGenerateAiTasks}
            disabled={isAiLoading}
            className="border-amber-400/50 hover:bg-amber-500/10"
          >
            <Sparkles className="mr-1.5 h-4 w-4 text-amber-500" />
            {isAiLoading ? 'Scanning Leads...' : 'AI Auto-Generate Tasks'}
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Add New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Collect salary slips & bank statements"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">Description (Optional)</Label>
                  <Textarea
                    id="desc"
                    placeholder="Add instructions, document links, or specific checklist details..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Associated Lead</Label>
                    <Select value={newLeadId} onValueChange={setNewLeadId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">General / No Lead</SelectItem>
                        {leads.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name} ({l.serviceType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={newPriority} onValueChange={(val: any) => setNewPriority(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Assigned To</Label>
                    <Select value={newAssignedTo} onValueChange={setNewAssignedTo}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alex Sales">Alex Sales</SelectItem>
                        <SelectItem value="Betty Office">Betty Office</SelectItem>
                        <SelectItem value="Charlie Admin">Charlie Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border bg-card shadow-sm">
          <p className="text-xs text-muted-foreground">Total Checklist Tasks</p>
          <p className="text-2xl font-bold mt-1">{totalCount}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-sm">
          <p className="text-xs text-muted-foreground">Pending Execution</p>
          <p className="text-2xl font-bold mt-1 text-sky-500">{pendingCount}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-sm">
          <p className="text-xs text-muted-foreground">High Priority Alerts</p>
          <p className="text-2xl font-bold mt-1 text-destructive">{highPriorityCount}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-sm">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold mt-1 text-emerald-500">{completedCount}</p>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted rounded-lg w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'all' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'pending' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('high')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'high' ? 'bg-background shadow-xs text-destructive font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            High Priority ({highPriorityCount})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'completed' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        <Input
          placeholder="Filter tasks by name or lead..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-xs text-xs"
        />
      </div>

      {/* Tasks List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Action Items ({filteredTasks.length})</CardTitle>
          <CardDescription>Click checkbox to toggle completion state.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-3 ${
                    task.completed
                      ? 'bg-muted/30 border-muted opacity-70'
                      : task.priority === 'high'
                      ? 'bg-destructive/5 border-destructive/20'
                      : 'bg-card hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox
                      id={task.id}
                      checked={task.completed}
                      onCheckedChange={() => handleToggle(task.id)}
                      className="mt-1 h-5 w-5 shrink-0"
                    />
                    <div className="space-y-1 flex-1 min-w-0">
                      <label
                        htmlFor={task.id}
                        className={`text-sm font-semibold cursor-pointer block break-words ${
                          task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {task.title}
                      </label>
                      {task.description && (
                        <p className="text-xs text-muted-foreground break-words">{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                        {task.leadName && (
                          <Link
                            href={`/dashboard/leads/${task.leadId}`}
                            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                          >
                            <span>Lead: {task.leadName}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Due {task.dueDate}
                        </span>
                        <span>•</span>
                        <span>Assigned: {task.assignedTo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {getPriorityBadge(task.priority)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(task.id, task.title)}
                      title="Delete Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <h3 className="text-base font-semibold">No tasks matching current filter</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Add a new task manually or click "AI Auto-Generate Tasks" to analyze your active leads.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}