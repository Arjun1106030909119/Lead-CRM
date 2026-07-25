import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/auth.hooks';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';

function PublicLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/95 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to="/" className="text-xl font-semibold">
            Lead CRM
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
      <Footer />
    </div>
  );
}

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
        <div className="border-t border-border bg-card/95 px-6 py-4">
          <div className="text-center text-sm text-muted-foreground">
            Built for Digital Heroes Training Task &middot;{' '}
            <a
              href="https://digitalheroesco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              digitalheroesco.com
            </a>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card/95 px-6 py-4">
      <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
        Built for Digital Heroes Training Task &middot;{' '}
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          digitalheroesco.com
        </a>
      </div>
    </footer>
  );
}

const PUBLIC_PATHS = ['/', '/login', '/register'];

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();

  const isPublic = !user || PUBLIC_PATHS.includes(location.pathname);

  return isPublic ? <PublicLayout /> : <AuthenticatedLayout />;
}
