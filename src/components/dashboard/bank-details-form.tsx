'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { BankDetails, Lead } from '@/lib/definitions';
import { saveLeads } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { CheckCircle, CreditCard, Shield, AlertTriangle } from 'lucide-react';

interface BankDetailsFormProps {
  lead: Lead;
  onUpdate: (updatedLead: Lead) => void;
  userRole: 'sales' | 'back-office' | 'admin';
}

export function BankDetailsForm({ lead, onUpdate, userRole }: BankDetailsFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);

  const form = useForm<BankDetails>({
    defaultValues: lead.bankDetails || {
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      branchName: '',
      accountType: 'savings',
    },
  });

  const handleSubmit = async (data: BankDetails) => {
    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const currentUserId = authUser?.id || 'system';

      const updatedLead: Lead = {
        ...lead,
        bankDetails: data,
        history: [
          ...(lead.history || []),
          {
            status: lead.status,
            timestamp: new Date().toISOString(),
            user: currentUserId,
            remarks: `Bank details ${userRole === 'back-office' ? 'verified' : 'updated'} by ${userRole}`
          }
        ]
      };

      if (userRole === 'back-office') {
        // Back-office verification
        updatedLead.bankDetails = {
          ...data,
          verifiedBy: currentUserId,
          verifiedAt: new Date().toISOString()
        };
      }

      console.log('Saving bank details:', updatedLead.bankDetails);
      await saveLeads([updatedLead]);
      console.log('Bank details saved successfully');
      onUpdate(updatedLead);
      setIsOpen(false);

      toast({
        title: "Bank Details Updated",
        description: userRole === 'back-office'
          ? "Bank details have been verified and saved."
          : "Bank details have been saved for verification.",
      });
    } catch (error) {
      console.error('Error saving bank details:', error);
      toast({
        title: "Error",
        description: "Failed to save bank details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVerify = async () => {
    if (userRole !== 'back-office') return;

    setIsVerifying(true);
    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const currentUserId = authUser?.id || 'system';

      const currentData = form.getValues();
      const updatedData = {
        ...currentData,
        verifiedBy: currentUserId,
        verifiedAt: new Date().toISOString()
      };

      form.setValue('verifiedBy', updatedData.verifiedBy);
      form.setValue('verifiedAt', updatedData.verifiedAt);

      toast({
        title: "Bank Details Verified",
        description: "Bank details have been successfully verified.",
      });
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Bank verification failed. Please check the details.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const isVerified = lead.bankDetails?.verifiedBy && lead.bankDetails.verifiedAt;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Bank Details
          {isVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {lead.bankDetails ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Account Holder</label>
                <p className="text-sm text-muted-foreground">{lead.bankDetails.accountHolderName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Account Number</label>
                <p className="text-sm text-muted-foreground">
                  ****{lead.bankDetails.accountNumber.slice(-4)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Bank Name</label>
                <p className="text-sm text-muted-foreground">{lead.bankDetails.bankName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">IFSC Code</label>
                <p className="text-sm text-muted-foreground">{lead.bankDetails.ifscCode}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isVerified ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Verified</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600">Pending Verification</span>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      {lead.bankDetails ? 'Update' : 'Add'} Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {userRole === 'back-office' ? 'Verify Bank Details' : 'Update Bank Details'}
                      </DialogTitle>
                      <DialogDescription>
                        {userRole === 'back-office'
                          ? 'Review and verify the bank details for disbursement.'
                          : 'Enter bank details for loan disbursement.'
                        }
                      </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="accountHolderName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Holder Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="accountType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="savings">Savings</SelectItem>
                                    <SelectItem value="current">Current</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Number</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="bankName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="ifscCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>IFSC Code</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="XXXX0XXXXXX" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="branchName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Branch Name (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <DialogFooter className="flex gap-2">
                          {userRole === 'back-office' && !isVerified && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleVerify}
                              disabled={isVerifying}
                            >
                              {isVerifying ? 'Verifying...' : 'Verify Details'}
                            </Button>
                          )}
                          <Button type="submit">
                            {userRole === 'back-office' ? 'Save & Verify' : 'Save Details'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Bank Details</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {userRole === 'sales'
                ? 'Bank details are required for loan disbursement.'
                : 'Bank details need to be added and verified before disbursement.'
              }
            </p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>Add Bank Details</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {userRole === 'back-office' ? 'Verify Bank Details' : 'Add Bank Details'}
                  </DialogTitle>
                  <DialogDescription>
                    {userRole === 'back-office'
                      ? 'Review and verify the bank details for disbursement.'
                      : 'Enter bank details for loan disbursement.'
                    }
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="accountHolderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Holder Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="accountType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="savings">Savings</SelectItem>
                                <SelectItem value="current">Current</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ifscCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IFSC Code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="XXXX0XXXXXX" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="branchName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Branch Name (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter className="flex gap-2">
                      {userRole === 'back-office' && !isVerified && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleVerify}
                          disabled={isVerifying}
                        >
                          {isVerifying ? 'Verifying...' : 'Verify Details'}
                        </Button>
                      )}
                      <Button type="submit">
                        {userRole === 'back-office' ? 'Save & Verify' : 'Save Details'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
