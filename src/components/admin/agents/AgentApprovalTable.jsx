import React from 'react';
import { MapPin, Calendar, Eye } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { formatDate } from '@/lib/super-admin-utils';

const STATUS_TONE = {
  pending: 'bg-amber-100 text-amber-700',
  under_review: 'bg-blue-100 text-blue-700',
  verified: 'bg-emerald-100 text-emerald-700',
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-600',
  suspended: 'bg-red-100 text-red-700',
  terminated: 'bg-rose-100 text-rose-700',
};

export default function AgentApprovalTable({ agents, onReview }) {
  if (!agents.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
        <MapPin className="h-10 w-10 text-muted-foreground/40" />
        <h3 className="mt-3 text-sm font-semibold text-foreground">No applications in this view</h3>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">There are no agent registrations matching this filter.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Specialization</th>
              <th className="px-4 py-3 font-medium">Service Areas</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {agents.map((a) => (
              <tr key={a.id} className="transition hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-brand-100">
                      {a.photo_url ? (
                        <Image src={a.photo_url} alt={a.full_name} fittingType="fill" className="h-full w-full" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-brand-700">
                          {a.full_name?.charAt(0) || 'A'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{a.full_name || 'Unnamed'}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.agent_code || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="truncate text-xs text-muted-foreground">{a.email || '—'}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.phone || '—'}</p>
                </td>
                <td className="px-4 py-3 capitalize text-xs text-muted-foreground">{a.specialization || '—'}</td>
                <td className="px-4 py-3">
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {a.service_areas?.length ? a.service_areas.join(', ') : '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(a.created_date)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_TONE[a.status] || 'bg-slate-100 text-slate-600'}`}>
                    {(a.status || 'pending').replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onReview(a)}
                    className="inline-flex items-center gap-1 rounded-md bg-brand-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800"
                  >
                    <Eye className="h-3.5 w-3.5" /> Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}