import { useEffect, useState } from 'react';
import { Phone, Mail, Calendar, MessageSquare, Video, MapPin, FileText, StickyNote, Filter } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ACTIVITY_ICONS = {
  call: Phone, email: Mail, sms: MessageSquare, whatsapp: MessageSquare,
  meeting: Calendar, video_call: Video, site_visit: MapPin, property_tour: MapPin,
  note: StickyNote, follow_up: Phone, document_shared: FileText, quotation_sent: FileText,
};

const OUTCOME_COLORS = { successful: 'default', no_answer: 'secondary', voicemail: 'secondary', rescheduled: 'secondary', cancelled: 'destructive', pending: 'secondary', informational: 'outline' };

export default function ActivityTimeline() {
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.CRMActivity.list('-activity_date', 100).catch(() => []),
      base44.entities.CRMTask.filter({ status: 'pending' }, 'due_date', 50).catch(() => []),
    ]).then(([a, t]) => { setActivities(a); setTasks(t); }).finally(() => setLoading(false));
  }, []);

  const types = [...new Set(activities.map((a) => a.activity_type))];
  const filtered = filter ? activities.filter((a) => a.activity_type === filter) : activities;
  const overdueTasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Phone className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{activities.length}</p><p className="text-xs text-muted-foreground">Total Activities</p></CardContent></Card>
        <Card><CardContent className="p-4"><Calendar className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{tasks.length}</p><p className="text-xs text-muted-foreground">Pending Tasks</p></CardContent></Card>
        <Card><CardContent className="p-4"><Filter className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{overdueTasks.length}</p><p className="text-xs text-muted-foreground">Overdue Tasks</p></CardContent></Card>
        <Card><CardContent className="p-4"><Phone className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{activities.filter((a) => !a.is_completed).length}</p><p className="text-xs text-muted-foreground">Open Activities</p></CardContent></Card>
      </div>

      {types.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter(null)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${!filter ? 'bg-brand-700 text-white' : 'hover:bg-muted'}`}>All Activities</button>
          {types.map((t) => {
            const Icon = ACTIVITY_ICONS[t] || StickyNote;
            return <button key={t} onClick={() => setFilter(filter === t ? null : t)} className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium capitalize ${filter === t ? 'bg-flame-500 text-white' : 'hover:bg-muted'}`}><Icon className="h-3 w-3" />{t.replace(/_/g, ' ')}</button>;
          })}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-brand-700" /> Activity Timeline</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No activities recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {filtered.slice(0, 30).map((a) => {
                const Icon = ACTIVITY_ICONS[a.activity_type] || StickyNote;
                return (
                  <div key={a.id} className="flex gap-3 rounded-lg border p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50"><Icon className="h-4 w-4 text-brand-700" /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{a.subject || a.activity_type?.replace(/_/g, ' ')}</p>
                        <Badge variant={OUTCOME_COLORS[a.outcome] || 'secondary'} className="text-xs">{a.outcome}</Badge>
                      </div>
                      {a.customer_name && <p className="text-xs text-muted-foreground">{a.customer_name}</p>}
                      {a.description && <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>}
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{a.staff_name || 'Unknown'}</span>
                        {a.activity_date && <span>{new Date(a.activity_date).toLocaleDateString()}</span>}
                        {a.duration_minutes > 0 && <span>{a.duration_minutes} min</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {overdueTasks.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Filter className="h-4 w-4 text-destructive" /> Overdue Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {overdueTasks.slice(0, 10).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-2.5">
                <div><p className="text-sm font-medium">{t.title}</p><p className="text-xs text-muted-foreground">{t.customer_name || ''} · Due {t.due_date}</p></div>
                <Badge variant="destructive" className="text-xs">{t.priority}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}