import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { History, RotateCcw, Filter } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { statusConfig, formatDate, entityLabels } from '@/lib/cms-utils';

export default function VersionHistoryPanel() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('all');
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setVersions(await base44.entities.ContentVersion.list('-created_date', 100)); }
    catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRestore = async (v) => {
    if (!confirm(`Restore "${v.record_title}" to version ${v.version_number}? This will create a new version and update the record.`)) return;
    try {
      const snapshot = v.snapshot || {};
      await base44.entities[v.entity_name].update(v.record_id, snapshot);
      await base44.entities.ContentVersion.create({
        entity_name: v.entity_name,
        record_id: v.record_id,
        record_title: v.record_title,
        version_number: v.version_number + 1,
        snapshot,
        change_note: `Rollback to version ${v.version_number}`,
        status: snapshot.status || 'draft',
        is_current: true,
        rollback_of_version: v.version_number,
      });
      toast({ title: 'Restored', description: `${v.record_title} rolled back to v${v.version_number}.` });
      load();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const entities = ['all', ...Array.from(new Set(versions.map(v => v.entity_name)))];
  const filtered = entityFilter === 'all' ? versions : versions.filter(v => v.entity_name === entityFilter);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><History className="w-5 h-5 text-flame-500" /> Version History ({versions.length})</h2>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {entities.map(e => <SelectItem key={e} value={e}>{e === 'all' ? 'All content types' : entityLabels[e] || e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        {loading && <Card className="p-8 text-center text-muted-foreground">Loading…</Card>}
        {!loading && filtered.length === 0 && <Card className="p-8 text-center text-muted-foreground">No version history yet.</Card>}
        {!loading && filtered.map(v => (
          <Card key={v.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="capitalize">{entityLabels[v.entity_name] || v.entity_name}</Badge>
                <span className="font-medium truncate">{v.record_title || 'Untitled'}</span>
                <Badge variant="secondary" className="bg-brand-50 text-brand-700 border-0">v{v.version_number}</Badge>
                {v.status && <Badge variant="secondary" className={statusConfig[v.status]?.className || ''}>{statusConfig[v.status]?.label || v.status}</Badge>}
                {v.rollback_of_version && <Badge variant="secondary" className="bg-info/15 text-info border-0">Restored v{v.rollback_of_version}</Badge>}
              </div>
              {v.change_note && <p className="text-sm text-muted-foreground truncate">{v.change_note}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(v.created_date)} {v.created_by_name && `· by ${v.created_by_name}`}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => handleRestore(v)} className="shrink-0"><RotateCcw className="w-3.5 h-3.5 mr-1" /> Restore</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}