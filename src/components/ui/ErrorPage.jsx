import { Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft, Wrench } from 'lucide-react';

const errorConfig = {
  400: { title: 'Bad Request', desc: 'The request could not be processed. Please check your input and try again.' },
  401: { title: 'Authentication Required', desc: 'Please sign in to access this page.' },
  403: { title: 'Access Denied', desc: 'You do not have permission to view this page.' },
  404: { title: 'Page Not Found', desc: 'The page you are looking for does not exist or has been moved.' },
  409: { title: 'Conflict', desc: 'A conflict occurred with the current resource state.' },
  422: { title: 'Validation Error', desc: 'The submitted data could not be validated.' },
  429: { title: 'Too Many Requests', desc: 'You have made too many requests. Please wait a moment and try again.' },
  500: { title: 'Server Error', desc: 'Something went wrong on our end. Our team has been notified.' },
  maintenance: { title: 'Under Maintenance', desc: 'The platform is temporarily unavailable for scheduled maintenance. Please check back soon.' },
};

export default function ErrorPage({ code = 404 }) {
  const config = errorConfig[code] || errorConfig[404];
  const isMaintenance = code === 'maintenance';
  const Icon = isMaintenance ? Wrench : AlertTriangle;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-soft-gray px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-flame-50 text-flame-500">
          <Icon className="h-10 w-10" />
        </div>
        {!isMaintenance && (
          <p className="mb-2 text-6xl font-heading font-bold text-brand-900">{code}</p>
        )}
        <h1 className="mb-2 text-2xl font-heading font-bold text-brand-900">{config.title}</h1>
        <p className="mb-8 text-sm text-muted-foreground">{config.desc}</p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-800"
          >
            <Home className="h-4 w-4" /> Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-brand-900 transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}