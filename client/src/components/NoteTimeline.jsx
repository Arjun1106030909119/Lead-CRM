import { Button } from '@/components/ui/button';

export function NoteTimeline({ notes, onDelete, canDelete }) {
  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <article key={note._id} className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">{note.user?.name || note.user?.email}</p>
              <p className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</p>
            </div>
            {canDelete && (
              <Button variant="destructive" size="sm" onClick={() => onDelete(note._id)}>
                Delete
              </Button>
            )}
          </div>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{note.content}</p>
        </article>
      ))}
    </div>
  );
}
