import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Play, Pause, Edit, Trash2, Clock, ChevronRight } from 'lucide-react';
import { WORKFLOW_STATUS, getModuleInfo, getTriggerInfo, formatDuration, getSuccessRate } from '@/lib/automation-utils';

export default function WorkflowCard({ workflow, onToggle, onEdit, onDelete, onRun }) {
  const statusInfo = WORKFLOW_STATUS[workflow.status] || WORKFLOW_STATUS.draft;
  const moduleInfo = getModuleInfo(workflow.module);
  const triggerInfo = getTriggerInfo(workflow.trigger_type);
  const successRate = getSuccessRate(workflow.success_count || 0, workflow.failure_count || 0);

  return (
    <Card className="group transition-all hover:shadow-card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${moduleInfo.color}15` }}>
              <span className="text-sm font-bold" style={{ color: moduleInfo.color }}>{moduleInfo.label.slice(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <CardTitle className="text-base">{workflow.workflow_name}</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">{workflow.workflow_code}</p>
            </div>
          </div>
          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">{workflow.description || 'No description provided'}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className="gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: moduleInfo.color }} />
            {moduleInfo.label}
          </Badge>
          <Badge variant="outline">{triggerInfo.label}</Badge>
          {workflow.trigger_entity && <Badge variant="outline">{workflow.trigger_entity}</Badge>}
        </div>
        <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Runs</p>
            <p className="text-sm font-semibold">{workflow.execution_count || 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Success</p>
            <p className="text-sm font-semibold text-success">{successRate}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg</p>
            <p className="text-sm font-semibold">{formatDuration(workflow.avg_duration_ms)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          {workflow.status === 'active' ? (
            <Button size="sm" variant="outline" onClick={() => onToggle(workflow)}><Pause className="h-3.5 w-3.5" /> Pause</Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => onToggle(workflow)}><Play className="h-3.5 w-3.5" /> Activate</Button>
          )}
          <Button size="sm" variant="outline" onClick={() => onRun(workflow)}><ChevronRight className="h-3.5 w-3.5" /> Run</Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(workflow)}><Edit className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(workflow)}><Trash2 className="h-3.5 w-3.5 text-error" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}