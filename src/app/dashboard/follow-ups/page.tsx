import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Mail } from 'lucide-react';

const followUps = [
  { name: 'John Doe', leadId: 'LEAD-001', nextAction: 'Call', date: '2024-08-01', avatar: 'https://i.pravatar.cc/40?u=john' },
  { name: 'Jane Smith', leadId: 'LEAD-002', nextAction: 'Email', date: '2024-08-02', avatar: 'https://i.pravatar.cc/40?u=jane' },
];

export default function FollowUpsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
        <p className="text-muted-foreground">
          Your scheduled follow-ups with leads.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {followUps.map((followUp) => (
          <Card key={followUp.leadId}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar>
                <AvatarImage src={followUp.avatar} />
                <AvatarFallback>{followUp.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{followUp.name}</CardTitle>
                <CardDescription>Next action on {followUp.date}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                    <Mail className="mr-2 h-4 w-4" /> Email
                </Button>
                <Button size="sm">
                    <Phone className="mr-2 h-4 w-4" /> Call
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
