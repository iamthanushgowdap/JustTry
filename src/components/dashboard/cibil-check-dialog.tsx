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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@/lib/definitions';

interface CibilCheckDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  lead: Lead | undefined;
  onCibilCheck: (leadId: string, cibilData: any) => void;
}

export function CibilCheckDialog({ isOpen, setIsOpen, lead, onCibilCheck }: CibilCheckDialogProps) {
  const { toast } = useToast();
  const [pan, setPan] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && lead) {
      // Reset form when dialog opens
      setPan('');
      setDob('');
      setAddress('');
    }
  }, [isOpen, lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lead || !pan) {
      toast({
        title: 'Error',
        description: 'Please enter PAN number.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/cibil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          pan: pan.toUpperCase(),
          dob: dob || undefined,
          address: address || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CIBIL score');
      }

      const cibilData = await response.json();

      onCibilCheck(lead.id, cibilData);
      setIsOpen(false);

      toast({
        title: 'CIBIL Check Completed',
        description: `Score: ${cibilData.score}`,
      });
    } catch (error) {
      console.error('CIBIL check error:', error);
      toast({
        title: 'Error',
        description: 'Failed to perform CIBIL check. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Run CIBIL Check</DialogTitle>
          <DialogDescription>
            Enter the PAN number to perform a credit score check for {lead.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pan" className="text-right">
                PAN Number
              </Label>
              <Input
                id="pan"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="col-span-3"
                maxLength={10}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dob" className="text-right">
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address for verification"
                className="col-span-3"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Lead Details:</p>
              <p>Name: {lead.name}</p>
              <p>Email: {lead.email}</p>
              <p>Phone: {lead.phone}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Checking...' : 'Run Check'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
