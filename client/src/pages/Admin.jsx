import { useAuth } from '@/auth/auth.hooks';

export default function Admin() {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">
      <section className="mx-auto w-full max-w-4xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Admin Panel</h1>
            <p className="text-muted-foreground">Accessible only to ADMIN users.</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-input bg-muted/40 p-6">
          <p className="text-sm text-muted-foreground">Admin-only route placeholder for future lead management administration.</p>
          <p className="mt-4 text-sm">Current user: {user?.email}</p>
        </div>
      </section>
    </div>
  );
}
