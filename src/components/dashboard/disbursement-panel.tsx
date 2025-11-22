'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Lead, Disbursement } from '@/lib/definitions';
import { saveLeads } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { PaymentService } from '@/lib/payment';
import { DollarSign, CreditCard, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface DisbursementPanelProps {
  lead: Lead;
  onUpdate: (updatedLead: Lead) => void;
}

export function DisbursementPanel({ lead, onUpdate }: DisbursementPanelProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [disbursementStatus, setDisbursementStatus] = React.useState<string>('');

  // Check if lead is eligible for disbursement
  const isEligibleForDisbursement = React.useMemo(() => {
    const hasNoDisbursements = !lead.disbursements || lead.disbursements.length === 0;
    const hasOnlyFailedDisbursements = lead.disbursements && lead.disbursements.length > 0 &&
      lead.disbursements.every(d => d.status === 'failed');

    const eligible = lead.serviceType === 'Loan' &&
           lead.status === 'Approved' &&
           lead.bankDetails?.verifiedBy &&
           lead.bankDetails.verifiedAt &&
           (hasNoDisbursements || hasOnlyFailedDisbursements);

    console.log('Disbursement eligibility check:', {
      leadId: lead.id,
      serviceType: lead.serviceType,
      status: lead.status,
      hasVerifiedBankDetails: !!(lead.bankDetails?.verifiedBy && lead.bankDetails.verifiedAt),
      hasNoDisbursements,
      hasOnlyFailedDisbursements,
      totalDisbursements: lead.disbursements?.length || 0,
      disbursementStatuses: lead.disbursements?.map(d => d.status),
      isEligible: eligible
    });

    return eligible;
  }, [lead]);

  const handleDisburseLoan = async () => {
    if (!isEligibleForDisbursement || !lead.bankDetails) {
      console.error('Cannot disburse: not eligible or missing bank details', {
        isEligible: isEligibleForDisbursement,
        hasBankDetails: !!lead.bankDetails
      });
      return;
    }

    setIsProcessing(true);
    setDisbursementStatus('Initiating disbursement...');

    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const currentUserId = authUser?.id || 'system';

      console.log('Starting disbursement process for lead:', lead.id);

      // Create disbursement record
      const disbursementId = `disb-${Date.now()}`;
      const disbursement: Disbursement = {
        id: disbursementId,
        amount: lead.value,
        referenceId: '',
        status: 'initiated',
        initiatedBy: currentUserId,
        initiatedAt: new Date().toISOString(),
      };

      setDisbursementStatus('Processing payment...');

      console.log('Calling payment service...');
      // Call payment service
      const result = await PaymentService.disburseLoanAmount(
        lead.value,
        lead.bankDetails,
        lead.id,
        lead.email
      );

      console.log('Payment service result:', result);

      if (result.success) {
        disbursement.referenceId = result.referenceId;
        disbursement.status = 'completed';
        disbursement.completedAt = new Date().toISOString();
        disbursement.gatewayResponse = result.gatewayResponse;

        // Update lead with disbursement record and new status
        const updatedLead: Lead = {
          ...lead,
          status: 'Disbursed',
          disbursements: [...(lead.disbursements || []), disbursement],
          history: [
            ...(lead.history || []),
            {
              status: 'Disbursed',
              timestamp: new Date().toISOString(),
              user: currentUserId,
              remarks: `Loan amount ₹${lead.value.toLocaleString()} disbursed successfully. Reference: ${result.referenceId}`
            }
          ]
        };

        console.log('Saving successful disbursement:', updatedLead.disbursements);
        await saveLeads([updatedLead]);
        console.log('✅ Disbursement data saved to Supabase successfully');
        console.log('📊 Saved disbursement details:', {
          amount: updatedLead.disbursements?.[0]?.amount,
          status: updatedLead.disbursements?.[0]?.status,
          referenceId: updatedLead.disbursements?.[0]?.referenceId,
          initiatedBy: updatedLead.disbursements?.[0]?.initiatedBy,
          leadId: updatedLead.id,
          leadStatus: updatedLead.status
        });

        // Show appropriate success message
        const isMockDisbursement = !result.gatewayResponse.id || result.gatewayResponse.id.startsWith('mock-');
        toast({
          title: "Disbursement Successful",
          description: isMockDisbursement
            ? `₹${lead.value.toLocaleString()} has been disbursed to ${lead.name}'s account.`
            : `₹${lead.value.toLocaleString()} has been disbursed to ${lead.name}'s account.`,
        });
        onUpdate(updatedLead);
      } else {
        console.error('Disbursement failed:', result.error);
        disbursement.status = 'failed';
        disbursement.failureReason = result.error;
        disbursement.completedAt = new Date().toISOString();

        // Update lead with failed disbursement
        const updatedLead: Lead = {
          ...lead,
          disbursements: [...(lead.disbursements || []), disbursement],
          history: [
            ...(lead.history || []),
            {
              status: lead.status,
              timestamp: new Date().toISOString(),
              user: currentUserId,
              remarks: `Disbursement failed: ${result.error}`
            }
          ]
        };

        console.log('Saving failed disbursement:', updatedLead.disbursements);
        await saveLeads([updatedLead]);
        console.log('❌ Failed disbursement data saved to Supabase');

        toast({
          title: "Disbursement Failed",
          description: result.error || "Payment processing failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Disbursement error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during disbursement.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setDisbursementStatus('');
    }
  };

  const latestDisbursement = lead.disbursements?.[lead.disbursements.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Loan Disbursement
          {latestDisbursement?.status === 'completed' && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {latestDisbursement ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Amount Disbursed</p>
                <p className="text-2xl font-bold">₹{latestDisbursement.amount.toLocaleString()}</p>
              </div>
              <Badge
                variant={
                  latestDisbursement.status === 'completed' ? 'default' :
                  latestDisbursement.status === 'failed' ? 'destructive' :
                  'secondary'
                }
              >
                {latestDisbursement.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                {latestDisbursement.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                {latestDisbursement.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                {latestDisbursement.status.charAt(0).toUpperCase() + latestDisbursement.status.slice(1)}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Reference ID</span>
                <span className="font-mono text-xs">{latestDisbursement.referenceId || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Initiated</span>
                <span>{new Date(latestDisbursement.initiatedAt).toLocaleDateString()}</span>
              </div>
              {latestDisbursement.completedAt && (
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span>{new Date(latestDisbursement.completedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {latestDisbursement.failureReason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  {latestDisbursement.failureReason}
                </p>
              </div>
            )}

            {latestDisbursement.status === 'completed' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Loan has been successfully disbursed to the customer's account.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-6">
              <CreditCard className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                {isEligibleForDisbursement ? 'Ready for Disbursement' : 'Not Eligible for Disbursement'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isEligibleForDisbursement
                  ? lead.disbursements && lead.disbursements.some(d => d.status === 'failed')
                    ? `Previous disbursement failed. Ready to retry disbursement of ₹${lead.value.toLocaleString()} to ${lead.name}'s verified bank account.`
                    : `Loan amount of ₹${lead.value.toLocaleString()} can be disbursed to ${lead.name}'s verified bank account.`
                  : 'Lead must be approved with verified bank details before disbursement.'
                }
              </p>
            </div>

            {!isEligibleForDisbursement && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${lead.status === 'Approved' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>Status: {lead.status}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${lead.bankDetails ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>Bank Details: {lead.bankDetails ? 'Added' : 'Missing'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${lead.bankDetails?.verifiedBy ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>Bank Verification: {lead.bankDetails?.verifiedBy ? 'Verified' : 'Pending'}</span>
                </div>
              </div>
            )}

            {isEligibleForDisbursement && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Disbursement Summary</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span>Loan Amount:</span>
                      <span>₹{lead.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recipient:</span>
                      <span>{lead.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bank:</span>
                      <span>{lead.bankDetails?.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Account:</span>
                      <span>****{lead.bankDetails?.accountNumber.slice(-4)}</span>
                    </div>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          {disbursementStatus || 'Processing...'}
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4 mr-2" />
                          {lead.disbursements && lead.disbursements.some(d => d.status === 'failed')
                            ? 'Retry Disbursement'
                            : 'Disburse Loan Amount'
                          }
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Loan Disbursement</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to disburse ₹{lead.value.toLocaleString()} to {lead.name}'s account.
                        This action cannot be undone. Please ensure all verifications are complete.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDisburseLoan}>
                        Confirm Disbursement
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
