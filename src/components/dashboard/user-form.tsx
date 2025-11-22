'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { UserRole, ServiceType, User } from '@/lib/definitions';

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['sales', 'back-office', 'admin']),
  avatar: z.string().url({ message: 'Please enter a valid URL for the avatar.' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  department: z.string().optional(),
  joinDate: z.string().optional(),
  manager: z.string().optional(),
  serviceTypes: z.array(z.enum(['Loan', 'Investment', 'Insurance'])).optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  onSave: (data: User & { password: string }) => void;
  user?: User;
}

export function UserForm({ onSave, user }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: user || {
      name: '',
      email: '',
      password: '',
      role: 'sales',
      avatar: '',
      phone: '',
      department: '',
      joinDate: '',
      manager: '',
      serviceTypes: [],
    },
  });

  const selectedRole = form.watch('role');

  function onSubmit(data: UserFormValues) {
    const { password, ...userData } = data;
    const avatar = userData.avatar || `https://i.pravatar.cc/40?u=${userData.name.replace(/\s/g, '')}`;
    onSave({ ...userData, id: user?.id || crypto.randomUUID(), avatar, password });
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
              <FormLabel>Gmail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="user@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter password" {...field} />
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
        {selectedRole === 'back-office' && (
          <FormField
            control={form.control}
            name="serviceTypes"
            render={() => (
              <FormItem>
                <FormLabel>Service Types</FormLabel>
                <FormDescription>
                  Select which service types this back-office user will handle.
                </FormDescription>
                <div className="grid grid-cols-3 gap-4">
                  {Object.values(ServiceType).map((serviceType) => (
                    <FormField
                      key={serviceType}
                      control={form.control}
                      name="serviceTypes"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={serviceType}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(serviceType)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), serviceType])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value: string) => value !== serviceType
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {serviceType}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="+1 234 567 8900" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Sales Department" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="joinDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Join Date (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="manager"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manager (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Manager's Name" {...field} />
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
