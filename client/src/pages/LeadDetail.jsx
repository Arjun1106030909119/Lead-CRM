import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/auth/auth.hooks';
import { fetchLead, deleteLead } from '@/lib/lead.api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import LeadNotes from './LeadNotes';
import { ActivityTimeline } from '@/components/ActivityTimeline';

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'NEW':
      return 'default';
    case 'CONTACTED':
      return 'secondary';
    case 'QUALIFIED':
      return 'outline';
    case 'PROPOSAL_SENT':
      return 'secondary';
    case 'WON':
      return 'default';
    case 'LOST':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function LeadDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLead = async () => {
      try {
        const response = await fetchLead(id);
        setLead(response.data.lead);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load lead');
      }
    };

    if (id) {
      loadLead();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteLead(id);
      navigate('/leads');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete lead');
    }
  };

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">
        <Card className="mx-auto max-w-4xl">
          <CardContent className="p-10">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">
        <Card className="mx-auto max-w-4xl">
          <CardContent className="p-10">
            <p className="text-muted-foreground">Loading lead...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">
      <Card className="mx-auto w-full max-w-4xl">
        <CardContent className="p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{lead.name}</h1>
                <Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</Badge>
              </div>
              <p className="mt-1 text-muted-foreground">{lead.company}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {user?.role === 'ADMIN' && (
                <Button variant="outline" size="sm" onClick={() => navigate(`/leads/${id}/assign`)}>
                  Assign
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => navigate(`/leads/${id}/edit`)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</p>
              <p className="mt-1.5 text-sm">{lead.email}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Phone</p>
              <p className="mt-1.5 text-sm">{lead.phone}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Assigned To</p>
              <p className="mt-1.5 text-sm">{lead.assignedTo?.name || 'Unassigned'}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Created</p>
              <p className="mt-1.5 text-sm">{new Date(lead.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {lead.activityLog?.length > 0 && (
            <div className="mt-8 rounded-xl border border-border bg-muted/40 p-6">
              <h2 className="text-lg font-semibold">Activity Log</h2>
              <div className="mt-4">
                <ActivityTimeline activityLog={lead.activityLog} />
              </div>
            </div>
          )}

          <div className="mt-8">
            <LeadNotes />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
