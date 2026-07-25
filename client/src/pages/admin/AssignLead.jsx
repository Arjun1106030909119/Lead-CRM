import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchLead, assignLead } from '@/lib/lead.api';
import { fetchUsers } from '@/lib/user.api';
import { Button } from '@/components/ui/button';
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

export default function AssignLead() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [users, setUsers] = useState([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLead = async () => {
      try {
        const response = await fetchLead(id);
        setLead(response.data.lead);
        setAssignedTo(response.data.lead.assignedTo?._id || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load lead');
      }
    };

    const loadUsers = async () => {
      try {
        const response = await fetchUsers();
        setUsers(response.data.users);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load users');
      }
    };

    if (id) {
      loadLead();
      loadUsers();
    }
  }, [id]);

  const handleAssign = async () => {
    try {
      await assignLead(id, { assignedTo });
      navigate(`/leads/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to assign lead');
    }
  };

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-10 shadow-sm">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-10 shadow-sm">
          <p className="text-muted-foreground">Loading assignment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">
      <div className="mx-auto w-full max-w-xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Assign Lead</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Select a user to assign this lead to.
                </p>
              </div>

              <Field>
                <FieldLabel>Lead</FieldLabel>
                <div className="rounded-md border border-input bg-muted/40 px-3 py-2 text-sm">
                  {lead.name} ({lead.company})
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="assignedTo">Assigned User</FieldLabel>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger id="assignedTo" className="w-full">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field className="flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/leads/${id}`)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAssign}>
                  Assign
                </Button>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
