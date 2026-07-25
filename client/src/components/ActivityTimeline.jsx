import { Button } from '@/components/ui/button';

export function ActivityTimeline({ activityLog }) {
  return (
    <div className="space-y-4">
      {activityLog.map((entry) => (
        <article key={`${entry._id || entry.timestamp}-${entry.action}`} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">{entry.action.replace('_', ' ')}</p>
              <p className="text-xs text-muted-foreground">By {entry.user?.name || entry.user?.email || 'Unknown'}</p>
            </div>
            <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {entry.oldValue && <span>Old: {entry.oldValue}</span>}
            {entry.newValue && <span>New: {entry.newValue}</span>}
            {entry.assignedTo && <span>Assigned to: {entry.assignedTo?.name || entry.assignedTo}</span>}
          </div>
          {entry.note && <p className="mt-3 text-sm text-foreground">{entry.note}</p>}
        </article>
      ))}
    </div>
  );
}
