import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/icons';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <div className="p-4 rounded-2xl bg-primary/10 ring-1 ring-primary/20 mb-4">
        <AppLogo />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight">404 - Page Not Found</h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        The page you are looking for does not exist in the FinTech workspace.
      </p>
      <Link href="/dashboard" className="mt-6">
        <Button size="sm">
          <Home className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
