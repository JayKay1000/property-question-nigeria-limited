import React from 'react';
import { Building2, Image as ImageIcon, Film, FileText, Clock } from 'lucide-react';

export default function MediaReviewStats({ submissions }) {
  let images = 0;
  let videos = 0;
  let documents = 0;
  submissions.forEach((s) => {
    images += (s.image_urls?.length || 0) + (s.photo_urls?.length || 0) + (s.featured_image_url ? 1 : 0);
    videos += s.video_urls?.length || 0;
    documents += s.document_urls?.length || 0;
  });
  const pending = submissions.filter((s) => !['approved', 'rejected'].includes(s.status)).length;

  const items = [
    { icon: Building2, label: 'Submissions', value: submissions.length, tone: 'text-brand-700' },
    { icon: Clock, label: 'Pending Review', value: pending, tone: 'text-amber-500' },
    { icon: ImageIcon, label: 'Images', value: images, tone: 'text-flame-500' },
    { icon: Film, label: 'Videos', value: videos, tone: 'text-blue-500' },
    { icon: FileText, label: 'Documents', value: documents, tone: 'text-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{it.label}</span>
            <it.icon className={`h-4 w-4 ${it.tone}`} />
          </div>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">{it.value}</p>
        </div>
      ))}
    </div>
  );
}