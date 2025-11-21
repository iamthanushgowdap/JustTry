import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Mail, BellOff } from 'lucide-react';

const followUps: any[] = [];

export default function FollowUpsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
        <p className="text-muted-foreground">
          Your scheduled follow-ups with leads.
        </p>
      </div>
      {followUps.length > 0 ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center h-[400px]">
          <BellOff className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No Follow-ups Scheduled</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You currently have no follow-ups. New follow-ups will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
