import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchLead, createLead, updateLead } from '@/lib/lead.api';

const leadSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(8, 'Enter a valid phone number'),
  company: z.string().min(2, 'Company is required'),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST']),
});

export default function LeadForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'NEW',
    },
  });

  const selectedStatus = watch('status');

  useEffect(() => {
    if (!id) return;

    const loadLead = async () => {
      setLoading(true);
      try {
        const response = await fetchLead(id);
        reset(response.data.lead);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load lead');
      } finally {
        setLoading(false);
      }
    };

    loadLead();
  }, [id, reset]);

  const onSubmit = async (values) => {
    const parseResult = leadSchema.safeParse(values);
    if (!parseResult.success) {
      setError(parseResult.error.errors[0].message);
      return;
    }

    try {
      setError(null);
      if (id) {
        await updateLead(id, values);
      } else {
        await createLead(values);
      }
      navigate('/leads');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save lead');
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">
      <div className="mx-auto w-full max-w-xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">{id ? 'Edit Lead' : 'Create Lead'}</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    {id ? 'Update the lead details below.' : 'Fill in the details to create a new lead.'}
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input id="name" type="text" placeholder="John Doe" {...register('name')} />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input id="phone" type="text" placeholder="+1 (555) 000-0000" {...register('phone')} />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="company">Company</FieldLabel>
                  <Input id="company" type="text" placeholder="Acme Inc." {...register('company')} />
                  {errors.company && (
                    <p className="text-sm text-destructive">{errors.company.message}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="status">Status</FieldLabel>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => setValue('status', value, { shouldValidate: true })}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="CONTACTED">Contacted</SelectItem>
                      <SelectItem value="QUALIFIED">Qualified</SelectItem>
                      <SelectItem value="PROPOSAL_SENT">Proposal Sent</SelectItem>
                      <SelectItem value="WON">Won</SelectItem>
                      <SelectItem value="LOST">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Field className="flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/leads')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting || loading}>
                    {isSubmitting ? 'Saving...' : id ? 'Update Lead' : 'Create Lead'}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
