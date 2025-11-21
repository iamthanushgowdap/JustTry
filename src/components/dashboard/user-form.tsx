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
import type { User } from '@/lib/definitions';
import { UserRole } from '@/lib/definitions';

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  role: z.enum(['sales', 'back-office', 'admin']),
  avatar: z.string().url({ message: 'Please enter a valid URL for the avatar.' }).optional().or(z.literal('')),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  onSave: (data: User) => void;
  user?: User;
}

export function UserForm({ onSave, user }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: user || {
      name: '',
      role: 'sales',
      avatar: '',
    },
  });

  function onSubmit(data: UserFormValues) {
    const avatar = data.avatar || `https://i.pravatar.cc/40?u=${data.name.replace(/\s/g, '')}`;
    onSave({ ...data, avatar } as User);
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
            name="role"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {Object.values(UserRole).map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://i.pravatar.cc/40?u=..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save User</Button>
      </form>
    </Form>
  );
}
