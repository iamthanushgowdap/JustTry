'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  User,
  Calendar,
  Target,
  Zap,
  Shield,
  FileText
} from 'lucide-react';
import { getLeads, getUsers, getUserByEmail } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import type { Lead, User as UserType } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

interface BackOfficeTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'escalated';
  stage: 'verification' | 'processing' | 'approval' | 'completion';
  dueDate: string;
  assignedTo: string;
  assignedUser: UserType;
  type: 'document_verification' | 'application_processing' | 'compliance_check' | 'final_review';
  relatedLeadId: string;
  relatedLead: Lead;
  sla: {
    total: number; // hours
    remaining: number; // hours
    breached: boolean;
  };
  progress: number; // 0-100
  nextAction?: string;
  dependencies?: string[];
}

export default function BackOfficeAssignedTasksPage() {
  const [tasks, setTasks] = React.useState<BackOfficeTask[]>([]);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [users, setUsers] = React.useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = React.useState<UserType | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'urgent' | 'due_soon' | 'sla_breached'>('all');
  const [sortBy, setSortBy] = React.useState<'due_date' | 'priority' | 'sla' | 'progress'>('due_date');

  React.useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        let userData: UserType | null = null;

        if (authUser?.email) {
          userData = await getUserByEmail(authUser.email);
          setCurrentUser(userData);
        }

        const [leadsData, usersData] = await Promise.all([
          getLeads(),
          getUsers()
        ]);

        setLeads(leadsData);
        setUsers(usersData);

        // Generate back-office specific tasks
        const generatedTasks = generateBackOfficeTasks(leadsData, usersData, userData);
        setTasks(generatedTasks);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const generateBackOfficeTasks = (leadsData: Lead[], usersData: UserType[], userData: UserType | null): BackOfficeTask[] => {
    const tasks: BackOfficeTask[] = [];

    if (!userData || userData.role !== 'back-office') return tasks;

    // Filter leads relevant to this back-office user
    const relevantLeads = leadsData.filter(lead => {
      const matchesStatus = lead.status !== 'New';
      const matchesServiceType = userData.serviceTypes?.length === 0 ||
        userData.serviceTypes?.includes(lead.serviceType);
      return matchesStatus && matchesServiceType;
    });

    relevantLeads.forEach(lead => {
      const now = new Date();
      const createdAt = new Date(lead.createdAt);
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      // Document verification task
      if (lead.status === 'Contacted' || lead.status === 'Qualified') {
        const slaHours = 24; // 24 hours for initial verification
        const remainingHours = Math.max(0, slaHours - hoursSinceCreation);
        const progress = Math.min(100, (hoursSinceCreation / slaHours) * 100);

        tasks.push({
          id: `verify-${lead.id}`,
          title: `Verify ${lead.name}'s ${lead.serviceType} Application`,
          description: `Review and verify submitted documents for ${lead.serviceType} application. Check ID, income proof, and service-specific requirements.`,
          priority: hoursSinceCreation > 20 ? 'urgent' : hoursSinceCreation > 12 ? 'high' : 'medium',
          status: lead.status === 'Qualified' ? 'in_progress' : 'pending',
          stage: 'verification',
          dueDate: new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000).toISOString().split('T')[0],
          assignedTo: userData.id,
          assignedUser: userData,
          type: 'document_verification',
          relatedLeadId: lead.id,
          relatedLead: lead,
          sla: {
            total: slaHours,
            remaining: remainingHours,
            breached: remainingHours <= 0
          },
          progress: lead.status === 'Qualified' ? 60 : 20,
          nextAction: 'Review submitted documents',
          dependencies: []
        });
      }

      // Processing task
      if (lead.status === 'Under Review' || lead.status === 'Qualified') {
        const slaHours = 48; // 48 hours for processing
        const remainingHours = Math.max(0, slaHours - hoursSinceCreation);
        const progress = lead.status === 'Under Review' ? 80 : 40;

        tasks.push({
          id: `process-${lead.id}`,
          title: `Process ${lead.name}'s ${lead.serviceType} Application`,
          description: `Complete background checks, credit verification, and final approval process for ${lead.serviceType} application.`,
          priority: hoursSinceCreation > 40 ? 'urgent' : 'high',
          status: lead.status === 'Under Review' ? 'in_progress' : 'pending',
          stage: 'processing',
          dueDate: new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000).toISOString().split('T')[0],
          assignedTo: userData.id,
          assignedUser: userData,
          type: 'application_processing',
          relatedLeadId: lead.id,
          relatedLead: lead,
          sla: {
            total: slaHours,
            remaining: remainingHours,
            breached: remainingHours <= 0
          },
          progress,
          nextAction: 'Complete compliance checks',
          dependencies: [`verify-${lead.id}`]
        });
      }

      // Compliance check task
      if (lead.status === 'Under Review') {
        const slaHours = 12; // 12 hours for compliance
        const remainingHours = Math.max(0, slaHours - (hoursSinceCreation - 24));
        const progress = 90;

        tasks.push({
          id: `compliance-${lead.id}`,
          title: `Compliance Check for ${lead.name}`,
          description: `Perform final compliance and regulatory checks before approval.`,
          priority: 'high',
          status: 'review',
          stage: 'approval',
          dueDate: new Date(createdAt.getTime() + (24 + slaHours) * 60 * 60 * 1000).toISOString().split('T')[0],
          assignedTo: userData.id,
          assignedUser: userData,
          type: 'compliance_check',
          relatedLeadId: lead.id,
          relatedLead: lead,
          sla: {
            total: slaHours,
            remaining: remainingHours,
            breached: remainingHours <= 0
          },
          progress,
          nextAction: 'Approve or reject application',
          dependencies: [`process-${lead.id}`]
        });
      }
    });

    return tasks;
  };

  const handleTaskStatusUpdate = (taskId: string, newStatus: BackOfficeTask['status']) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? {
            ...task,
            status: newStatus,
            progress: newStatus === 'completed' ? 100 :
                     newStatus === 'review' ? 90 :
                     newStatus === 'in_progress' ? Math.max(task.progress, 50) : task.progress
          }
        : task
    ));
  };

  const filteredTasks = React.useMemo(() => {
    let filtered = [...tasks];

    // Apply status filter
    if (filter === 'urgent') {
      filtered = filtered.filter(task => task.priority === 'urgent' || task.sla.breached);
    } else if (filter === 'due_soon') {
      filtered = filtered.filter(task => {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntilDue <= 24 && hoursUntilDue > 0;
      });
    } else if (filter === 'sla_breached') {
      filtered = filtered.filter(task => task.sla.breached);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'sla':
          return a.sla.remaining - b.sla.remaining;
        case 'progress':
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, filter, sortBy]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'verification': return <FileCheck className="h-4 w-4 text-blue-500" />;
      case 'processing': return <Zap className="h-4 w-4 text-orange-500" />;
      case 'approval': return <Shield className="h-4 w-4 text-purple-500" />;
      case 'completion': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'document_verification': return <FileText className="h-4 w-4" />;
      case 'application_processing': return <Target className="h-4 w-4" />;
      case 'compliance_check': return <Shield className="h-4 w-4" />;
      case 'final_review': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assigned Tasks</h1>
          <p className="text-muted-foreground">Loading your assigned tasks...</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assigned Tasks</h1>
          <p className="text-muted-foreground">
            Manage your document verification and application processing tasks with SLA tracking.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due_date">Sort by Due Date</SelectItem>
              <SelectItem value="priority">Sort by Priority</SelectItem>
              <SelectItem value="sla">Sort by SLA</SelectItem>
              <SelectItem value="progress">Sort by Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SLA Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter(t => t.priority === 'urgent' || t.sla.breached).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Breached</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter(t => t.sla.breached).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="urgent">Urgent ({tasks.filter(t => t.priority === 'urgent' || t.sla.breached).length})</TabsTrigger>
            <TabsTrigger value="due_soon">Due Soon ({tasks.filter(t => {
              const dueDate = new Date(t.dueDate);
              const now = new Date();
              const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
              return hoursUntilDue <= 24 && hoursUntilDue > 0;
            }).length})</TabsTrigger>
            <TabsTrigger value="sla_breached">SLA Breached ({tasks.filter(t => t.sla.breached).length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className={`${task.sla.breached ? 'border-red-500 bg-red-50/50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTaskTypeIcon(task.type)}
                    <div>
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {getStageIcon(task.stage)}
                        <span>{task.stage.charAt(0).toUpperCase() + task.stage.slice(1)} Stage</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>{task.nextAction}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{task.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{task.relatedLead.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className={task.sla.breached ? 'text-red-600' : ''}>
                      SLA: {task.sla.remaining.toFixed(1)}h left
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>${task.relatedLead.value?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>

                {task.dependencies && task.dependencies.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <span>Dependencies: {task.dependencies.join(', ')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignedUser.avatar} />
                      <AvatarFallback className="text-xs">
                        {task.assignedUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      Assigned to {task.assignedUser.name}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {task.status !== 'completed' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTaskStatusUpdate(task.id, 'in_progress')}
                          disabled={task.status === 'in_progress'}
                        >
                          Start
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTaskStatusUpdate(task.id, 'review')}
                          disabled={task.status === 'review'}
                        >
                          Review
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleTaskStatusUpdate(task.id, 'completed')}
                        >
                          Complete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center h-[400px]">
              <FileCheck className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No Tasks Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No tasks match the current filter criteria.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Other tabs would have similar content but with different filtering */}
        <TabsContent value="urgent" className="space-y-4">
          {/* Similar to all tab but filtered for urgent tasks */}
          <div className="text-center py-8 text-muted-foreground">
            Urgent tasks would be displayed here
          </div>
        </TabsContent>

        <TabsContent value="due_soon" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Tasks due soon would be displayed here
          </div>
        </TabsContent>

        <TabsContent value="sla_breached" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            SLA breached tasks would be displayed here
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
