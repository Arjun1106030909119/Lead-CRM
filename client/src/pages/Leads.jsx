import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchLeads } from '@/lib/lead.api';
import { fetchUsers } from '@/lib/user.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'PROPOSAL_SENT', label: 'Proposal Sent' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'company', label: 'Company (A-Z)' },
];

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

export default function Leads() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [assignedTo, setAssignedTo] = useState(searchParams.get('assignedTo') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [limit, setLimit] = useState(parseInt(searchParams.get('limit') || '10', 10));

  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetchUsers();
        setUsers(response.data.users || []);
      } catch (err) {
        console.warn('Could not fetch users list:', err);
      }
    };
    loadUsers();
  }, []);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit, sort };
      if (search.trim()) params.search = search.trim();
      if (status !== 'all') params.status = status;
      if (assignedTo !== 'all') params.assignedTo = assignedTo;

      const response = await fetchLeads(params);
      const data = response.data;

      setLeads(data.leads || []);
      if (data.pagination) {
        setPagination(data.pagination);
      } else {
        setPagination({
          total: data.leads?.length || 0,
          page: 1,
          limit: data.leads?.length || 10,
          totalPages: 1,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load leads');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, assignedTo, sort]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const updateUrlParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'all') {
        updated.set(key, String(val));
      } else {
        updated.delete(key);
      }
    });
    setSearchParams(updated);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    updateUrlParams({ search: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      updateUrlParams({ page: newPage });
    }
  };

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setAssignedTo('all');
    setSort('newest');
    setPage(1);
    setLimit(10);
    setSearchParams({});
  };

  const hasActiveFilters = search || status !== 'all' || assignedTo !== 'all' || sort !== 'newest' || page !== 1 || limit !== 10;

  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Leads</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Search, filter, sort, and manage your assigned lead pipeline.
            </p>
          </div>
          <Link to="/leads/create">
            <Button className="shadow-sm">Create Lead</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 sm:p-5">
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field>
                  <FieldLabel htmlFor="search-input">Search</FieldLabel>
                  <Input
                    id="search-input"
                    type="text"
                    placeholder="Name, company, or email..."
                    value={search}
                    onChange={handleSearchChange}
                    className="bg-background"
                  />
                </Field>

                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); updateUrlParams({ status: v, page: 1 }); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Assigned User</FieldLabel>
                  <Select value={assignedTo} onValueChange={(v) => { setAssignedTo(v); setPage(1); updateUrlParams({ assignedTo: v, page: 1 }); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Sort By</FieldLabel>
                  <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); updateUrlParams({ sort: v, page: 1 }); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Newest First" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end pt-1">
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
                    Clear Filters
                  </Button>
                </div>
              )}
            </FieldGroup>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-input bg-muted/40 p-12 text-center text-muted-foreground animate-pulse">
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-2xl border border-input bg-muted/40 p-12 text-center text-muted-foreground">
            No leads found matching your criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <article key={lead._id} className="rounded-3xl border border-border bg-background p-6 shadow-xs transition-all hover:border-primary/40">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold">{lead.name}</h2>
                      <Badge variant={getStatusBadgeVariant(lead.status)}>
                        {lead.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{lead.company}</span> &middot; {lead.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div>Assigned: <span className="font-medium text-foreground">{lead.assignedTo?.name || 'Unassigned'}</span></div>
                    <div>Created by: <span className="font-medium text-foreground">{lead.createdBy?.name || 'System'}</span></div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                  <Link to={`/leads/${lead._id}`}>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                </div>
              </article>
            ))}

            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  Showing <strong className="text-foreground">{startItem}</strong> to{' '}
                  <strong className="text-foreground">{endItem}</strong> of{' '}
                  <strong className="text-foreground">{pagination.total}</strong> leads
                </span>

                <div className="flex items-center gap-2">
                  <label htmlFor="limit-select" className="sr-only">Items per page</label>
                  <Select value={String(limit)} onValueChange={(v) => { const val = parseInt(v, 10); setLimit(val); setPage(1); updateUrlParams({ limit: val, page: 1 }); }}>
                    <SelectTrigger id="limit-select" className="h-8 w-20 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 / page</SelectItem>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="20">20 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pagination.totalPages)
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const showEllipsis = prevP && p - prevP > 1;
                    return (
                      <span key={p} className="flex items-center">
                        {showEllipsis && <span className="px-1 text-xs text-muted-foreground">...</span>}
                        <Button
                          variant={page === p ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(p)}
                          className="h-8 w-8 p-0 text-xs"
                        >
                          {p}
                        </Button>
                      </span>
                    );
                  })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
