import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchNotes, addNote, deleteNote } from '@/lib/note.api';
import { useAuth } from '@/auth/auth.hooks';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NoteTimeline } from '@/components/NoteTimeline';

export default function LeadNotes() {
  const { id } = useParams();
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    fetchNotes(id)
      .then((response) => {
        if (!cancelled) setNotes(response.data.notes || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Unable to load notes');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await fetchNotes(id);
      setNotes(response.data.notes || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    if (!content.trim()) {
      setError('Note content is required');
      return;
    }

    try {
      await addNote(id, { content: content.trim() });
      setContent('');
      await loadNotes();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add note');
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await deleteNote(noteId);
      await loadNotes();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete note');
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Notes</h2>
          <p className="text-sm text-muted-foreground">Timeline of notes for this lead, newest first.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="noteContent">
            Add a note
          </label>
          <Textarea
            id="noteContent"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write a note about this lead..."
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            Add Note
          </Button>
        </div>
      </form>

      <div className="mt-8">
        {notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-8 text-center text-muted-foreground">
            No notes yet.
          </div>
        ) : (
          <NoteTimeline notes={notes} onDelete={handleDelete} canDelete={user?.role === 'ADMIN'} />
        )}
      </div>
    </section>
  );
}
