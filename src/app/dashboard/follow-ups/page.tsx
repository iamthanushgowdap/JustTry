'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Phone,
  Mail,
  BellOff,
  Calendar,
  Clock,
  TrendingUp,
  MessageSquare,
  Target,
  Zap,
  Heart,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { getLeads, getUserByEmail } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import type { Lead, User } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import * as React from 'react';

interface FollowUp {
  id: string;
  leadId: string;
  lead: Lead;
  title: string;
  description: string;
  scheduledDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'overdue' | 'completed' | 'cancelled';
  type: 'initial_contact' | 'follow_up' | 'closing' | 'nurture' | 're_engagement';
  channel: 'phone' | 'email' | 'meeting' | 'social';
  sentiment?: 'positive' | 'neutral' | 'negative';
  nextAction?: string;
  notes?: string;
  effectiveness?: number; // 1-5 scale
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = React.useState<FollowUp[]>([]);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'today' | 'overdue' | 'upcoming'>('all');
  const [sortBy, setSortBy] = React.useState<'date' | 'priority' | 'type' | 'lead_value'>('date');

  React.useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        let userData: User | null = null;

        if (authUser?.email) {
          userData = await getUserByEmail(authUser.email);
          setCurrentUser(userData);
        }

        const leadsData = await getLeads();
        setLeads(leadsData);

        // Generate follow-ups based on leads and user role
        const generatedFollowUps = generateFollowUps(leadsData, userData);
        setFollowUps(generatedFollowUps);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const generateFollowUps = (leadsData: Lead[], userData: User | null): FollowUp[] => {
    const followUps: FollowUp[] = [];

    if (!userData || userData.role !== 'sales') return followUps;

    const userLeads = leadsData.filter(lead => lead.assignedTo === userData.id);

    userLeads.forEach(lead => {
      const now = new Date();
      const createdAt = new Date(lead.createdAt);
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      // Initial contact follow-up
      if (lead.status === 'New' && daysSinceCreation >= 1) {
        followUps.push({
          id: `initial-${lead.id}`,
          leadId: lead.id,
          lead,
          title: `Initial Contact with ${lead.name}`,
          description: `Make first contact to understand ${lead.name}'s ${lead.serviceType} needs and qualify the lead.`,
          scheduledDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: daysSinceCreation > 3 ? 'high' : 'medium',
          status: daysSinceCreation > 7 ? 'overdue' : 'scheduled',
          type: 'initial_contact',
          channel: 'phone',
          nextAction: 'Call to introduce services',
          effectiveness: undefined
        });
      }

      // Follow-up after contact
      if (lead.status === 'Contacted' && daysSinceCreation >= 3) {
        followUps.push({
          id: `followup-${lead.id}`,
          leadId: lead.id,
          lead,
          title: `Follow-up with ${lead.name}`,
          description: `Follow up on initial discussion about ${lead.serviceType} services. Address any questions or concerns.`,
          scheduledDate: new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: daysSinceCreation > 7 ? 'urgent' : 'medium',
          status: daysSinceCreation > 10 ? 'overdue' : 'scheduled',
          type: 'follow_up',
          channel: 'email',
          nextAction: 'Send proposal or schedule meeting',
          effectiveness: 4
        });
      }

      // Closing follow-up for qualified leads
      if (lead.status === 'Qualified' && daysSinceCreation >= 7) {
        followUps.push({
          id: `closing-${lead.id}`,
          leadId: lead.id,
          lead,
          title: `Closing Call with ${lead.name}`,
          description: `Final discussion to close the ${lead.serviceType} deal worth $${lead.value}.`,
          scheduledDate: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'high',
          status: daysSinceCreation > 14 ? 'overdue' : 'scheduled',
          type: 'closing',
          channel: 'meeting',
          nextAction: 'Get final approval and sign documents',
          effectiveness: 5
        });
      }

      // Nurture follow-up for lost leads
      if (lead.status === 'Lost' && daysSinceCreation >= 30) {
        followUps.push({
          id: `nurture-${lead.id}`,
          leadId: lead.id,
          lead,
          title: `Nurture Contact with ${lead.name}`,
          description: `Re-engage ${lead.name} with valuable content about ${lead.serviceType} services.`,
          scheduledDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'low',
          status: 'scheduled',
          type: 'nurture',
          channel: 'email',
          nextAction: 'Send educational content',
          effectiveness: 2
        });
      }
    });

    return followUps;
  };

  const handleFollowUpComplete = (followUpId: string, effectiveness: number, notes?: string) => {
    setFollowUps(prev => prev.map(fu =>
      fu.id === followUpId
        ? { ...fu, status: 'completed', effectiveness, notes }
        : fu
    ));
  };

  const filteredFollowUps = React.useMemo(() => {
    let filtered = [...followUps];

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (filter === 'today') {
      filtered = filtered.filter(fu => fu.scheduledDate === today);
    } else if (filter === 'overdue') {
      filtered = filtered.filter(fu => fu.status === 'overdue' || fu.scheduledDate < today);
    } else if (filter === 'upcoming') {
      filtered = filtered.filter(fu => fu.scheduledDate > today && fu.status === 'scheduled');
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'type':
          return a.type.localeCompare(b.type);
        case 'lead_value':
          return (b.lead.value || 0) - (a.lead.value || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [followUps, filter, sortBy]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'initial_contact': return <Phone className="h-4 w-4 text-blue-500" />;
      case 'follow_up': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'closing': return <Target className="h-4 w-4 text-purple-500" />;
      case 'nurture': return <Heart className="h-4 w-4 text-pink-500" />;
      case 're_engagement': return <Zap className="h-4 w-4 text-orange-500" />;
      default: return <BellOff className="h-4 w-4" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'social': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'neutral': return 'text-yellow-600';
      case 'negative': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
          <p className="text-muted-foreground">Loading your scheduled follow-ups...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
          <p className="text-muted-foreground">
            Smart follow-up scheduling and engagement tracking for your sales pipeline.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="priority">Sort by Priority</SelectItem>
              <SelectItem value="type">Sort by Type</SelectItem>
              <SelectItem value="lead_value">Sort by Value</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Follow-up Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Follow-ups</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{followUps.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {followUps.filter(fu => fu.status === 'overdue').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {followUps.filter(fu => fu.status === 'completed' && fu.scheduledDate === new Date().toISOString().split('T')[0]).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Effectiveness</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {followUps.filter(fu => fu.effectiveness).length > 0
                ? (followUps.filter(fu => fu.effectiveness).reduce((sum, fu) => sum + (fu.effectiveness || 0), 0) / followUps.filter(fu => fu.effectiveness).length).toFixed(1)
                : '0'}/5
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Follow-ups ({followUps.length})</TabsTrigger>
            <TabsTrigger value="today">Today ({followUps.filter(fu => fu.scheduledDate === new Date().toISOString().split('T')[0]).length})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({followUps.filter(fu => fu.status === 'overdue').length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({followUps.filter(fu => fu.scheduledDate > new Date().toISOString().split('T')[0] && fu.status === 'scheduled').length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-4">
          {filteredFollowUps.map((followUp) => (
            <Card key={followUp.id} className={`${followUp.status === 'overdue' ? 'border-red-500 bg-red-50/50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(followUp.type)}
                    <div>
                      <CardTitle className="text-lg">{followUp.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {getChannelIcon(followUp.channel)}
                        <span>{followUp.channel.charAt(0).toUpperCase() + followUp.channel.slice(1)}</span>
                        <span>•</span>
                        <span>{followUp.nextAction}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(followUp.priority)}>
                      {followUp.priority}
                    </Badge>
                    <Badge variant={followUp.status === 'completed' ? 'default' : followUp.status === 'overdue' ? 'destructive' : 'secondary'}>
                      {followUp.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{followUp.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{followUp.lead.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{followUp.lead.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(followUp.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>${followUp.lead.value?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-4 w-4 ${getSentimentColor(followUp.sentiment)}`} />
                    <span className={getSentimentColor(followUp.sentiment)}>
                      {followUp.sentiment || 'No feedback'}
                    </span>
                  </div>
                </div>

                {followUp.effectiveness && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Effectiveness</span>
                      <span>{followUp.effectiveness}/5</span>
                    </div>
                    <Progress value={(followUp.effectiveness / 5) * 100} className="h-2" />
                  </div>
                )}

                {followUp.notes && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                    <strong>Notes:</strong> {followUp.notes}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-muted-foreground">
                    {followUp.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {followUp.channel}
                  </div>
                  <div className="flex gap-2">
                    {followUp.status !== 'completed' && followUp.status !== 'cancelled' && (
                      <>
                        <Button size="sm" variant="outline">
                          {followUp.channel === 'phone' ? <Phone className="mr-2 h-4 w-4" /> :
                           followUp.channel === 'email' ? <Mail className="mr-2 h-4 w-4" /> :
                           <Calendar className="mr-2 h-4 w-4" />}
                          {followUp.channel === 'phone' ? 'Call' :
                           followUp.channel === 'email' ? 'Email' : 'Schedule'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleFollowUpComplete(followUp.id, 4)}
                        >
                          Mark Complete
                        </Button>
                      </>
                    )}
                    {followUp.status === 'completed' && (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredFollowUps.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center h-[400px]">
              <BellOff className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No Follow-ups Scheduled</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your scheduled follow-ups will appear here. New follow-ups are automatically created based on lead activity.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Other tabs would have similar content but with different filtering */}
        <TabsContent value="today" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Today's follow-ups would be displayed here
          </div>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Overdue follow-ups would be displayed here
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Upcoming follow-ups would be displayed here
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
