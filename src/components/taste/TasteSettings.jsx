import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw, Power, Pencil, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { formatBudget, TASTE_PRIORITIES, TASTE_PURPOSES, clearSessionProfile } from '@/lib/taste-utils';

/**
 * Settings dialog — view, edit, reset, or disable personalization.
 */
export default function TasteSettings({ open, onClose, profile, isAuthenticated, onEdit, onReset, onDisable, onEnable, disabled }) {
  const { toast } = useToast();

  const handleReset = async () => {
    try {
      if (isAuthenticated) {
        await base44.functions.invoke('saveTasteProfile', { action: 'reset' });
      } else {
        clearSessionProfile();
      }
      toast({ title: 'Preferences reset', description: 'Your recommendations will use the default settings.' });
      onReset?.();
      onClose?.();
    } catch (err) {
      toast({ title: 'Could not reset', description: err.message, variant: 'destructive' });
    }
  };

  const handleToggle = async () => {
    try {
      if (isAuthenticated) {
        await base44.functions.invoke('saveTasteProfile', { action: disabled ? 'enable' : 'disable' });
      }
      if (disabled) {
        onEnable?.();
        toast({ title: 'Personalization enabled' });
      } else {
        onDisable?.();
        toast({ title: 'Personalization disabled', description: 'You can re-enable it anytime.' });
      }
      onClose?.();
    } catch (err) {
      toast({ title: 'Could not update', description: err.message, variant: 'destructive' });
    }
  };

  const purposeLabel = TASTE_PURPOSES.find((p) => p.value === profile?.transaction_purpose)?.label || 'Any';
  const priorityLabel = TASTE_PRIORITIES.find((p) => p.value === profile?.priority)?.label || 'Balanced';
  const locations = profile?.preferred_locations || [];
  const budgetText = formatBudget(profile?.budget_min_ngn ?? null, profile?.budget_max_ngn ?? null);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Recommendation settings</DialogTitle>
          <DialogDescription>Manage your personalization preferences.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-lg border border-border p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Looking to</span>
              <span className="font-medium">{purposeLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Priority</span>
              <span className="font-medium">{priorityLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget</span>
              <span className="font-medium">{budgetText}</span>
            </div>
            {locations.length > 0 && (
              <div>
                <span className="text-muted-foreground">Locations: </span>
                <span className="font-medium">{locations.join(', ')}</span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-success" />
            <span>Your preferences are private and visible only to you.</span>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={onEdit}>
              <Pencil className="h-4 w-4" /> Edit preferences
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
          <Button
            variant={disabled ? 'default' : 'ghost'}
            className="w-full"
            onClick={handleToggle}
          >
            <Power className="h-4 w-4" />
            {disabled ? 'Enable personalization' : 'Disable personalization'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}