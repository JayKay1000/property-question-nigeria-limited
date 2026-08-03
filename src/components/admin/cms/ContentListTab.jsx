import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import ContentEditorDialog from './ContentEditorDialog';
import { statusConfig, getRecordTitle, formatDate, truncate, entityLabels } from '@/lib/cms-utils';

export default function ContentListTab({ entityType, title, icon: Icon, searchFields = ['title'], renderExtra }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities[entityType].list('-created_date', 100);
      setRecords(data);
    } catch { /* */ }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, [entityType]);

  const handleDelete = async (id) => {
    try {
      await base44.entities[entityType].delete(id);
      toast({ title: 'Deleted', description: `${entityLabels[entityType]} removed.` });
      load();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    }
  };

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (rec) => { setEditing(rec); setDialogOpen(true); };

  const filtered = records.filter(r => {
    if (!query) return true;
    return searchFields.some(f => String(r[f] || '').toLowerCase().includes(query.toLowerCase()));
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-flame-500" />}
          {title} ({records.length})
        </h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="pl-9 w-48" />
          </div>
          <Button onClick={openNew} className="bg-flame-500 hover:bg-flame-600 text-white border-0"><Plus className="w-4 h-4 mr-1" /> New</Button>
        </div>
      </div>
      <div className="space-y-3">
        {loading && <Card className="p-8 text-center text-muted-foreground">Loading…</Card>}
        {!loading && filtered.length === 0 && <Card className="p-8 text-center text-muted-foreground">No {title.toLowerCase()} yet.</Card>}
        {!loading && filtered.map(rec => (
          <Card key={rec.id} className="p-4 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-heading font-semibold truncate">{getRecordTitle(entityType, rec)}</h3>
                {rec.status && <Badge variant="secondary" className={statusConfig[rec.status]?.className || ''}>{statusConfig[rec.status]?.label || rec.status}</Badge>}
                {rec.is_featured && <Badge variant="secondary" className="bg-flame-50 text-flame-700 border-0">Featured</Badge>}
                {rec.category && <Badge variant="outline" className="capitalize">{rec.category.replace(/_/g, ' ')}</Badge>}
              </div>
              {(rec.excerpt || rec.testimonial_text || rec.short_description || rec.answer || rec.content) && (
                <p className="text-sm text-muted-foreground truncate">{truncate(rec.excerpt || rec.testimonial_text || rec.short_description || rec.answer || rec.content, 140)}</p>
              )}
              <div className="flex gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                {rec.published_date && <span>{formatDate(rec.published_date)}</span>}
                {rec.view_count != null && <span>{rec.view_count} views</span>}
                {rec.rating != null && <span>{rec.rating}★</span>}
                {rec.is_approved != null && <span>{rec.is_approved ? 'Approved' : 'Pending'}</span>}
              </div>
              {renderExtra && renderExtra(rec)}
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => openEdit(rec)}><Edit className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(rec.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
      <ContentEditorDialog open={dialogOpen} onClose={() => setDialogOpen(false)} entityType={entityType}
        record={editing} onSaved={load} />
    </div>
  );
}