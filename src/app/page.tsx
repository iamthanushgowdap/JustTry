'use client';

import { login } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/icons';
import { User, Briefcase, Shield } from 'lucide-react';

export default function LoginPage() {
  const handleLogin = async (role: 'sales' | 'back-office' | 'admin') => {
    await login(role);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AppLogo />
          </div>
          <CardTitle className="text-2xl font-bold">JustTry FinTech CRM</CardTitle>
          <CardDescription>Select a role to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => handleLogin('sales')}
            className="w-full"
            variant="default"
          >
            <User className="mr-2 h-4 w-4" />
            Login as Sales
          </Button>
          <Button
            onClick={() => handleLogin('back-office')}
            className="w-full"
            variant="secondary"
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Login as Back Office
          </Button>
          <Button
            onClick={() => handleLogin('admin')}
            className="w-full"
            variant="outline"
          >
            <Shield className="mr-2 h-4 w-4" />
            Login as Admin
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-center text-xs text-muted-foreground w-full">
            &copy; {new Date().getFullYear()} JustTry. All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
