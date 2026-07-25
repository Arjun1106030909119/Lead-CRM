import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/auth/auth.hooks';
import { UsersIcon, BarChart3Icon, ShieldIcon } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="flex flex-col justify-center p-8 md:p-12">
              <div className="flex flex-col items-start gap-4 text-left">
                <h1 className="text-4xl font-bold tracking-tight">
                  Lead Management CRM
                </h1>
                <p className="text-muted-foreground">
                  Production-ready frontend for authenticated lead tracking, dashboards, and lead workflows.
                </p>
                <div className="flex flex-wrap gap-3">
                  {user ? (
                    <Link to="/dashboard">
                      <Button size="lg">Go to Dashboard</Button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/login">
                        <Button size="lg">Login</Button>
                      </Link>
                      <Link to="/register">
                        <Button variant="outline" size="lg">Register</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="relative hidden bg-muted md:block">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
                <div className="flex items-center gap-3 rounded-xl bg-background/80 px-5 py-3 shadow-sm backdrop-blur">
                  <UsersIcon className="size-5 text-primary" />
                  <span className="text-sm font-medium">Lead Tracking</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-background/80 px-5 py-3 shadow-sm backdrop-blur">
                  <BarChart3Icon className="size-5 text-primary" />
                  <span className="text-sm font-medium">Dashboard Analytics</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-background/80 px-5 py-3 shadow-sm backdrop-blur">
                  <ShieldIcon className="size-5 text-primary" />
                  <span className="text-sm font-medium">Role-Based Access</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
