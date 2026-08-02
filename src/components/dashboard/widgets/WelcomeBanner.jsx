import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function WelcomeBanner({ user, role, verificationStatus }) {
  const name = user?.full_name || user?.email?.split('@')[0] || 'there';
  const roleLabel = role ? role.replace(/_/g, ' ') : 'member';

  const status = verificationStatus || 'verified';
  const StatusIcon = status === 'verified' ? CheckCircle : status === 'pending' ? Clock : AlertCircle;
  const statusColor =
    status === 'verified'
      ? 'text-success'
      : status === 'pending'
      ? 'text-warning'
      : 'text-error';

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-800 to-brand-950 p-6 text-white shadow-premium-lg sm:p-8">
      <div className="absolute right-0 top-0 h-40 w-40 -translate-y-12 translate-x-12 rounded-full bg-flame-500/20 blur-3xl" />
      <div className="relative">
        <p className="text-sm text-white/70">Welcome back,</p>
        <h2 className="mt-1 text-2xl font-heading font-bold capitalize sm:text-3xl">{name}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium capitalize">
            {roleLabel}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${statusColor}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            <span className="capitalize">{status}</span>
          </span>
        </div>
      </div>
    </div>
  );
}