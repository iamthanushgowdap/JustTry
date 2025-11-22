'use client';

import * as React from 'react';
import { getUsers, saveUsers, createAuthUser } from '@/lib/data';
import type { User } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserForm } from '@/components/dashboard/user-form';
import { toast } from '@/hooks/use-toast';

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | undefined>(undefined);

  React.useEffect(() => {
    async function fetchUsers() {
      const usersData = await getUsers();
      setUsers(usersData);
    }
    fetchUsers();
  }, []);

  const handleSaveUser = async (userData: User & { password: string }) => {
    const { password, ...user } = userData;
    
    let updatedUsers;
    if (editingUser) {
      // For editing, we don't create new auth users, just update the database
      updatedUsers = users.map((u) => (u.id === editingUser.id ? user : u));
    } else {
      // For new users, create auth user first, then add to database
      try {
        const { user: authUser, error } = await createAuthUser(user.email, password);
        if (error) {
          console.error('Error creating auth user:', error);
          toast({
            title: "Error",
            description: error.message || "Failed to create user account. Please check if the email is already registered or try again.",
            variant: "destructive",
          });
          return;
        }

        console.log('Auth user created:', authUser);
        updatedUsers = [...users, user];
      } catch (error) {
        console.error('Error creating auth user:', error);
        toast({
          title: "Error",
          description: "Failed to create user account. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setUsers(updatedUsers);
    await saveUsers(updatedUsers);
    
    toast({
      title: "Success",
      description: editingUser ? "User updated successfully." : "User created successfully. They can now log in with their email and password.",
    });
    
    setIsFormOpen(false);
    setEditingUser(undefined);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    await saveUsers(updatedUsers);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Create and manage sales and back-office users. Each user will have their authentication account created automatically with the provided email and password. Make sure email confirmation is disabled in your Supabase Authentication settings for immediate login capability.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(isOpen: boolean) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingUser(undefined);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingUser(undefined); setIsFormOpen(true); } }>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update the user information.' : 'Fill in the details to create a new user account with authentication.'}
              </DialogDescription>
            </DialogHeader>
            <UserForm
              onSave={handleSaveUser}
              user={editingUser}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Gmail</TableHead>
                <TableHead>Role</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(user)}>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
