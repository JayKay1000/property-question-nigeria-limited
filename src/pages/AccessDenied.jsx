import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccessDenied({ reason, requiredPermission }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error/10">
          <ShieldX className="h-10 w-10 text-error" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-brand-900">Access Denied</h1>
        <p className="mt-4 text-base text-muted-foreground">
          {reason ||
            'You do not have the required permissions to access this area. If you believe this is an error, please contact your administrator.'}
        </p>
        {requiredPermission && (
          <p className="mt-2 inline-block rounded-lg bg-muted px-3 py-1.5 text-sm font-mono text-muted-foreground">
            Required: {requiredPermission}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="outline">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" /> Go Home
            </Link>
          </Button>
          <Button asChild>
            <Link to="/login">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}