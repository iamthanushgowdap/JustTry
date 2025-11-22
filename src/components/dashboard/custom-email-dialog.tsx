'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Wand2 } from 'lucide-react';
import type { Lead } from '@/lib/definitions';

interface CustomEmailDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  lead: Lead | undefined;
  onEmailSent: (leadId: string, emailData: any) => void;
}

export function CustomEmailDialog({ isOpen, setIsOpen, lead, onEmailSent }: CustomEmailDialogProps) {
  const { toast } = useToast();
  const [userInput, setUserInput] = React.useState('');
  const [generatedEmail, setGeneratedEmail] = React.useState<{
    subject: string;
    html: string;
    text: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [editableSubject, setEditableSubject] = React.useState('');
  const [editableContent, setEditableContent] = React.useState('');

  React.useEffect(() => {
    if (isOpen && lead) {
      // Reset form when dialog opens
      setUserInput('');
      setGeneratedEmail(null);
      setEditableSubject('');
      setEditableContent('');
    }
  }, [isOpen, lead]);

  const handleGenerateEmail = async () => {
    if (!userInput.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter what you want to communicate to the lead.',
        variant: 'destructive',
      });
      return;
    }

    if (!lead) return;

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userInput,
          leadDetails: {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            serviceType: lead.serviceType,
            subCategory: lead.subCategory,
            status: lead.status,
            value: lead.value,
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedEmail(result.content);
        setEditableSubject(result.content.subject);
        setEditableContent(result.content.text);
        toast({
          title: 'Email Generated',
          description: 'AI has created a personalized email. You can edit it before sending.',
        });
      } else {
        toast({
          title: 'Generation Failed',
          description: result.message || 'Failed to generate email.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Email generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!generatedEmail || !lead) return;

    setIsSending(true);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: lead.email,
          name: lead.name,
          subject: editableSubject,
          htmlContent: generatedEmail.html.replace(generatedEmail.subject, editableSubject),
          textContent: editableContent,
          custom: true,
          leadId: lead.id
        }),
      });

      const result = await response.json();

      if (result.success) {
        onEmailSent(lead.id, {
          subject: editableSubject,
          content: editableContent,
          emailId: result.emailId
        });
        setIsOpen(false);
        toast({
          title: 'Email Sent',
          description: 'Custom email has been sent to the lead successfully.',
        });
      } else {
        toast({
          title: 'Send Failed',
          description: result.message || 'Failed to send email.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Email send error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Custom Email to {lead.name}</DialogTitle>
          <DialogDescription>
            Create and send a personalized email using AI assistance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium">Name:</Label>
                <p>{lead.name}</p>
              </div>
              <div>
                <Label className="font-medium">Email:</Label>
                <p>{lead.email}</p>
              </div>
              <div>
                <Label className="font-medium">Phone:</Label>
                <p>{lead.phone}</p>
              </div>
              <div>
                <Label className="font-medium">Service:</Label>
                <p>{lead.serviceType} - {lead.subCategory}</p>
              </div>
              <div>
                <Label className="font-medium">Status:</Label>
                <Badge variant="outline">{lead.status}</Badge>
              </div>
              <div>
                <Label className="font-medium">Value:</Label>
                <p>${lead.value.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* User Input Section */}
          <div className="space-y-2">
            <Label htmlFor="userInput">
              What would you like to communicate? (3 lines minimum)
            </Label>
            <Textarea
              id="userInput"
              placeholder="E.g.,&#10;Inform the customer about document requirements&#10;Request additional information needed&#10;Schedule a follow-up call"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={4}
            />
            <Button
              onClick={handleGenerateEmail}
              disabled={isGenerating || !userInput.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Email...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate AI Email
                </>
              )}
            </Button>
          </div>

          {/* Generated Email Preview */}
          {generatedEmail && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <Label className="text-base font-semibold">Generated Email (Edit before sending)</Label>

                <div className="space-y-3 mt-3">
                  <div>
                    <Label htmlFor="subject" className="text-sm">Subject Line</Label>
                    <Input
                      id="subject"
                      value={editableSubject}
                      onChange={(e) => setEditableSubject(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-sm">Email Content</Label>
                    <Textarea
                      id="content"
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
                      rows={10}
                      className="mt-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          {generatedEmail && (
            <Button onClick={handleSendEmail} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
