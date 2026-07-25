import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/auth.hooks';
import { fetchDashboardData } from '@/lib/dashboard.api';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUpIcon, UsersIcon, XCircleIcon, StarIcon } from 'lucide-react';

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

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetchDashboardData();
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const metrics = data?.metrics || { totalLeads: 0, won: 0, lost: 0, qualified: 0 };
  const recentLeads = data?.recentLeads || [];
  const recentNotes = data?.recentNotes || [];

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>
        <Link to="/leads/create">
          <Button>Create Lead</Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Leads</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {loading ? '...' : metrics.totalLeads}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <UsersIcon />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Active pipeline entries
            </div>
            <div className="text-muted-foreground">
              All leads in the system
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Won</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-emerald-600 dark:text-emerald-400">
              {loading ? '...' : metrics.won}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400">
                <TrendingUpIcon />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Successfully closed
            </div>
            <div className="text-muted-foreground">
              Deals won this period
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Lost</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-destructive">
              {loading ? '...' : metrics.lost}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="text-destructive">
                <XCircleIcon />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Closed leads
            </div>
            <div className="text-muted-foreground">
              Unreachable or declined
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Qualified</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-blue-600 dark:text-blue-400">
              {loading ? '...' : metrics.qualified}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                <StarIcon />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              High-intent leads
            </div>
            <div className="text-muted-foreground">
              Verified and qualified
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Leads</CardTitle>
                <CardDescription>Latest lead additions and updates</CardDescription>
              </div>
              <Link to="/leads">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <div className="p-4">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
                Loading recent leads...
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No recent leads available.
              </div>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div
                    key={lead._id}
                    className="flex items-center justify-between rounded-xl border border-border/60 p-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{lead.name}</span>
                        <Badge variant={getStatusBadgeVariant(lead.status)} className="text-[10px]">
                          {lead.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {lead.company} &middot; {lead.email}
                      </p>
                    </div>
                    <Link to={`/leads/${lead._id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
          <CardFooter className="border-t border-border/40 text-xs text-muted-foreground pt-3">
            Showing top {recentLeads.length} most recent leads
          </CardFooter>
        </Card>

        {/* Recent Notes */}
        <Card>
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Notes</CardTitle>
                <CardDescription>Latest activity logs and team notes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <div className="p-4">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
                Loading recent notes...
              </div>
            ) : recentNotes.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No recent notes logged.
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotes.map((note) => (
                  <div
                    key={note._id}
                    className="rounded-xl border border-border/60 p-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span className="font-medium text-foreground">
                        {note.lead?.name || 'Lead'} ({note.lead?.company || 'Company'})
                      </span>
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-foreground/90 bg-muted/30 rounded-lg p-2 font-mono">
                      &quot;{note.content}&quot;
                    </p>
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      Added by <span className="font-medium text-foreground">{note.user?.name || 'User'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <CardFooter className="border-t border-border/40 text-xs text-muted-foreground pt-3">
            Showing top {recentNotes.length} most recent notes
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
