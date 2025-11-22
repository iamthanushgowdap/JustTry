
'use client';

import * as React from 'react';
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
  import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, PlusCircle, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { getLeads, getUsers, getUserByEmail } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import type { Lead, User } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';

  interface Task {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed';
    dueDate?: string;
    assignedTo?: string;
    assignedUser?: User;
    type: 'lead_followup' | 'verification' | 'review' | 'general';
    relatedLeadId?: string;
  }

  export default function TasksPage() {
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [leads, setLeads] = React.useState<Lead[]>([]);
    const [users, setUsers] = React.useState<User[]>([]);
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  
    const form = useForm({
      defaultValues: {
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        dueDate: '',
      },
    });

    React.useEffect(() => {
      async function fetchData() {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          let userData: User | null = null;

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

          // Generate tasks based on role and data
          const generatedTasks = generateTasks(leadsData, usersData, userData);
          setTasks(generatedTasks);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }, []);

    const generateTasks = (leadsData: Lead[], usersData: User[], userData: User | null): Task[] => {
      const tasks: Task[] = [];

      if (!userData) return tasks;

      if (userData.role === 'sales') {
        // Sales tasks: follow-ups, lead management
        leadsData
          .filter(lead => lead.assignedTo === userData.id)
          .forEach(lead => {
            // Follow-up tasks for leads not contacted recently
            if (lead.status === 'New' || lead.status === 'Contacted') {
              tasks.push({
                id: `followup-${lead.id}`,
                title: `Follow up with ${lead.name}`,
                description: `Contact ${lead.name} regarding ${lead.serviceType} inquiry`,
                priority: lead.status === 'New' ? 'high' : 'medium',
                status: 'pending',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                assignedTo: userData.id,
                assignedUser: userData,
                type: 'lead_followup',
                relatedLeadId: lead.id
              });
            }

            // Closing tasks for qualified leads
            if (lead.status === 'Qualified') {
              tasks.push({
                id: `close-${lead.id}`,
                title: `Close deal with ${lead.name}`,
                description: `Finalize ${lead.serviceType} agreement worth $${lead.value}`,
                priority: 'high',
                status: 'in_progress',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                assignedTo: userData.id,
                assignedUser: userData,
                type: 'lead_followup',
                relatedLeadId: lead.id
              });
            }
          });
      } else if (userData.role === 'back-office') {
        // Back-office tasks: verification, processing
        const relevantLeads = leadsData.filter(lead => {
          const matchesStatus = lead.status !== 'New';
          const matchesServiceType = userData.serviceTypes?.length === 0 ||
            userData.serviceTypes?.includes(lead.serviceType);
          return matchesStatus && matchesServiceType;
        });

        relevantLeads.forEach(lead => {
          if (lead.status === 'Contacted' || lead.status === 'Qualified') {
            tasks.push({
              id: `verify-${lead.id}`,
              title: `Verify documents for ${lead.name}`,
              description: `Review and verify ${lead.serviceType} application documents`,
              priority: 'medium',
              status: lead.status === 'Qualified' ? 'in_progress' : 'pending',
              dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              assignedTo: userData.id,
              assignedUser: userData,
              type: 'verification',
              relatedLeadId: lead.id
            });
          }

          if (lead.status === 'Under Review') {
            tasks.push({
              id: `process-${lead.id}`,
              title: `Process application for ${lead.name}`,
              description: `Complete processing of ${lead.serviceType} application`,
              priority: 'high',
              status: 'in_progress',
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              assignedTo: userData.id,
              assignedUser: userData,
              type: 'review',
              relatedLeadId: lead.id
            });
          }
        });
      } else if (userData.role === 'admin') {
        // Admin tasks: oversight, team management
        tasks.push({
          id: 'review-performance',
          title: 'Review team performance metrics',
          description: 'Analyze monthly sales performance and team productivity',
          priority: 'medium',
          status: 'pending',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          assignedTo: userData.id,
          assignedUser: userData,
          type: 'general'
        });

        tasks.push({
          id: 'assign-leads',
          title: 'Assign new leads to sales team',
          description: `Assign ${leadsData.filter(l => !l.assignedTo).length} unassigned leads`,
          priority: 'high',
          status: leadsData.filter(l => !l.assignedTo).length > 0 ? 'pending' : 'completed',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          assignedTo: userData.id,
          assignedUser: userData,
          type: 'general'
        });
      }

      return tasks;
    };

    const handleTaskToggle = (taskId: string) => {
      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
          : task
      ));
    };

    const handleAddTask = (data: any) => {
      const newTask: Task = {
        id: `manual-${Date.now()}`,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: 'pending',
        dueDate: data.dueDate,
        assignedTo: currentUser?.id,
        assignedUser: currentUser || undefined,
        type: 'general',
      };

      setTasks(prev => [...prev, newTask]);
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Task Added",
        description: "Your new task has been added successfully.",
      });
    };

    const filteredTasks = tasks.filter(task => {
      if (filter === 'all') return true;
      return task.status === filter;
    });

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high': return 'destructive';
        case 'medium': return 'default';
        case 'low': return 'secondary';
        default: return 'secondary';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
        case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
        default: return <Clock className="h-4 w-4" />;
      }
    };

    if (loading) {
      return (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
            <p className="text-muted-foreground">Loading your tasks...</p>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {currentUser?.role === 'back-office' ? 'Assigned Tasks' : 'My Tasks'}
            </h1>
            <p className="text-muted-foreground">
              {currentUser?.role === 'sales' && 'Manage your leads and follow-ups'}
              {currentUser?.role === 'back-office' && 'Your assigned verification and processing tasks'}
              {currentUser?.role === 'admin' && 'Team management and oversight tasks'}
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new task to track your work. Fill in the details below.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddTask)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter task title..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter task description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Add Task</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({tasks.filter(t => t.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({tasks.filter(t => t.status === 'in_progress').length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({tasks.filter(t => t.status === 'completed').length})</TabsTrigger>
            </TabsList>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Task List
                </CardTitle>
                <CardDescription>Stay on top of your work and responsibilities.</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTasks.length > 0 ? (
                  <div className="space-y-4">
                    {filteredTasks.map((task) => (
                      <div key={task.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id={task.id}
                          checked={task.status === 'completed'}
                          onCheckedChange={() => handleTaskToggle(task.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <label
                                htmlFor={task.id}
                                className={`text-sm font-medium leading-none cursor-pointer ${
                                  task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                                }`}
                              >
                                {task.title}
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          {task.assignedUser && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={task.assignedUser.avatar} />
                                <AvatarFallback className="text-xs">
                                  {task.assignedUser.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                Assigned to {task.assignedUser.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center h-[400px]">
                    <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No Tasks Available</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Your tasks will appear here as they are assigned.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tab contents would be similar but filtered */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Tasks</CardTitle>
                <CardDescription>Tasks waiting to be started.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Similar content as above but filtered */}
                {filteredTasks.length > 0 ? (
                  <div className="space-y-4">
                    {filteredTasks.map((task) => (
                      <div key={task.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <Checkbox
                          id={task.id}
                          checked={task.status === 'completed'}
                          onCheckedChange={() => handleTaskToggle(task.id)}
                        />
                        <div className="flex-1">
                          <label htmlFor={task.id} className="text-sm font-medium leading-none cursor-pointer">
                            {task.title}
                          </label>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                        <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No pending tasks</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>In Progress Tasks</CardTitle>
                <CardDescription>Tasks currently being worked on.</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTasks.length > 0 ? (
                  <div className="space-y-4">
                    {filteredTasks.map((task) => (
                      <div key={task.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <Checkbox
                          id={task.id}
                          checked={task.status === 'completed'}
                          onCheckedChange={() => handleTaskToggle(task.id)}
                        />
                        <div className="flex-1">
                          <label htmlFor={task.id} className="text-sm font-medium leading-none cursor-pointer">
                            {task.title}
                          </label>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                        <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No tasks in progress</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Tasks</CardTitle>
                <CardDescription>Tasks that have been finished.</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTasks.length > 0 ? (
                  <div className="space-y-4">
                    {filteredTasks.map((task) => (
                      <div key={task.id} className="flex items-start space-x-4 p-4 border rounded-lg opacity-75">
                        <Checkbox
                          id={task.id}
                          checked={task.status === 'completed'}
                          onCheckedChange={() => handleTaskToggle(task.id)}
                        />
                        <div className="flex-1">
                          <label htmlFor={task.id} className="text-sm font-medium leading-none cursor-pointer line-through">
                            {task.title}
                          </label>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                        <Badge variant="outline">completed</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No completed tasks</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }