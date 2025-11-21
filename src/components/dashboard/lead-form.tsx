'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import type { Lead } from '@/lib/definitions';
import { ServiceType, LoanSubCategory, InvestmentSubCategory, InsuranceSubCategory, LoanPipelineStatus, InvestmentPipelineStatus, InsurancePipelineStatus } from '@/lib/definitions';

const leadSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email(),
  phone: z.string().min(10, { message: 'Phone number is required.' }),
  serviceType: z.enum(['Loan', 'Investment', 'Insurance']),
  subCategory: z.string().min(1, { message: 'Sub-category is required.' }),
  status: z.string().min(1, { message: 'Status is required.' }),
  value: z.coerce.number().min(0, { message: 'Value must be a positive number.' }),
  assignedTo: z.string().min(1, { message: 'Assigned user is required.' }),
  createdAt: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormProps {
  onSave: (data: Lead) => void;
  lead?: Lead;
}

export function LeadForm({ onSave, lead }: LeadFormProps) {
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead || {
      name: '',
      email: '',
      phone: '',
      serviceType: 'Loan',
      subCategory: '',
      status: 'New',
      value: 0,
      assignedTo: 'Alex Sales',
    },
  });

  const serviceType = form.watch('serviceType');

  const subCategories = {
    Loan: Object.values(LoanSubCategory),
    Investment: Object.values(InvestmentSubCategory),
    Insurance: Object.values(InsuranceSubCategory),
  };

  const statuses = {
    Loan: Object.values(LoanPipelineStatus),
    Investment: Object.values(InvestmentPipelineStatus),
    Insurance: Object.values(InsurancePipelineStatus),
  }

  function onSubmit(data: LeadFormValues) {
    onSave(data as Lead);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+1-202-555-0104" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Service Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a service type" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {Object.values(ServiceType).map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="subCategory"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Sub-category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a sub-category" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {subCategories[serviceType as keyof typeof subCategories].map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {statuses[serviceType as keyof typeof statuses].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value ($)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Lead</Button>
      </form>
    </Form>
  );
}
