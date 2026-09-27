'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { getUsers, saveUsers, resetToDemoData } from '@/lib/data';
import { login, getSession } from '@/lib/actions';
import type { UserRole } from '@/lib/definitions';
import { RotateCcw, Shield, User, Briefcase, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [currentRole, setCurrentRole] = React.useState<UserRole>('sales');
  const [name, setName] = React.useState('Alex Sales');
  const [email, setEmail] = React.useState('alex.sales@justtry.fin');
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(false);

  React.useEffect(() => {
    async function init() {
      const session = await getSession();
      if (session?.role) {
        setCurrentRole(session.role);
        const users = getUsers();
        const u = users.find((x) => x.role === session.role);
        if (u) {
          setName(u.name);
          setEmail(u.email || `${u.name.toLowerCase().replace(' ', '.')}@justtry.fin`);
        }
      }
    }
    init();
  }, []);

  const handleSaveProfile = () => {
    const users = getUsers();
    const updated = users.map((u) => {
      if (u.role === currentRole) {
        return { ...u, name, email };
      }
      return u;
    });
    saveUsers(updated);
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved to local storage.',
    });
  };

  const handleSwitchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('justtry_active_role', newRole);
    }
    login(newRole).catch(() => {});
    toast({
      title: 'Active Role Switched',
      description: `Dashboard is now running in ${newRole.toUpperCase()} mode.`,
    });
    window.location.href = '/dashboard';
  };

  const handleResetData = () => {
    resetToDemoData();
    toast({
      title: 'Demo Data Restored',
      description: 'Clean demo records, tasks, and follow-ups have been loaded into local storage.',
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System & Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your role privileges, workspace storage, and interface preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Role Switcher Card */}
        <Card className="shadow-sm border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Active Workspace Role
            </CardTitle>
            <CardDescription>
              Quickly simulate different FinTech CRM permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Role to Operate As</Label>
              <Select value={currentRole} onValueChange={(val: UserRole) => handleSwitchRole(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4 text-sky-500" /> Sales Advisor
                    </span>
                  </SelectItem>
                  <SelectItem value="back-office">
                    <span className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-purple-500" /> Back Office & KYC
                    </span>
                  </SelectItem>
                  <SelectItem value="admin">
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-500" /> Executive Admin
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Changing role dynamically updates sidebar navigation, queue permissions, and operational views.
            </p>
          </CardContent>
        </Card>

        {/* Profile Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your advisor details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile} size="sm">
              Save Profile
            </Button>
          </CardFooter>
        </Card>

        {/* Appearance Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Appearance & Theme</CardTitle>
            <CardDescription>Customize the visual style of your CRM.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Color Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Theme</SelectItem>
                  <SelectItem value="dark">Dark Theme</SelectItem>
                  <SelectItem value="system">System Default</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Current active theme: <span className="font-semibold capitalize">{theme}</span>
            </p>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Operational Alerts</CardTitle>
            <CardDescription>Configure how KYC and SLA alerts are delivered.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="cursor-pointer">
                Email Notifications
              </Label>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="cursor-pointer">
                High Priority Push Alerts
              </Label>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast({
                  title: 'Preferences Saved',
                  description: 'Alert settings have been applied.',
                })
              }
            >
              Save Alert Preferences
            </Button>
          </CardFooter>
        </Card>

        {/* Local Storage & Demo Data Management */}
        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-amber-500" />
              Local Storage & Demo State
            </CardTitle>
            <CardDescription>
              This project operates completely offline using self-contained browser storage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              All leads, documents, checklist tasks, and scheduled follow-ups persist in your browser's LocalStorage. If you ever want to reset the environment back to the clean benchmark hackathon dataset with sample clients and documents, click the button below.
            </p>
            <div className="pt-2">
              <Button variant="outline" onClick={handleResetData} className="border-amber-400/50 hover:bg-amber-500/10">
                <RotateCcw className="mr-2 h-4 w-4 text-amber-500" />
                Restore Clean Demo Dataset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
