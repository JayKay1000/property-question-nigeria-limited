import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Zap, Edit, Clock } from 'lucide-react';
import { formatDuration } from '@/lib/automation-utils';

export default function AutomationRuleCard({ rule, onToggle, onEdit }) {
  return (
    <Card className="p-4 transition-all hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${rule.is_active ? 'bg-flame-500/15' : 'bg-muted'}`}>
            <Zap className={`h-5 w-5 ${rule.is_active ? 'text-flame-600' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">{rule.rule_name}</h4>
              <Badge variant="outline" className="text-xs">{rule.rule_code}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{rule.description}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
              <Badge variant="secondary" className="text-xs">{rule.trigger_entity}</Badge>
              <span className="text-muted-foreground">on</span>
              <Badge variant="secondary" className="text-xs">{rule.trigger_event}</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="outline" className="text-xs">{rule.action_type}</Badge>
              {rule.delay_minutes > 0 && (
                <Badge variant="ghost" className="text-xs gap-1">
                  <Clock className="h-3 w-3" /> {formatDuration(rule.delay_minutes * 60000)}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Switch checked={rule.is_active} onCheckedChange={() => onToggle(rule)} />
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(rule)}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {rule.execution_count > 0 && (
        <div className="mt-3 flex items-center gap-3 border-t pt-2 text-xs text-muted-foreground">
          <span>{rule.execution_count} executions</span>
          {rule.last_executed_at && <span>• Last: {new Date(rule.last_executed_at).toLocaleDateString()}</span>}
          {rule.last_execution_status && <span>• {rule.last_execution_status}</span>}
        </div>
      )}
    </Card>
  );
}