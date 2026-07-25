import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/nav-user';
import { LayoutDashboardIcon, UsersIcon, PlusIcon, ShieldIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/auth.hooks';

const navMain = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: <LayoutDashboardIcon />,
  },
  {
    title: 'Leads',
    url: '/leads',
    icon: <UsersIcon />,
  },
  {
    title: 'Create Lead',
    url: '/leads/create',
    icon: <PlusIcon />,
  },
];

export function AppSidebar({ ...props }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link to="/dashboard">
                <span className="text-base font-semibold">Lead CRM</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url || (item.url !== '/dashboard' && location.pathname.startsWith(item.url))}
                tooltip={item.title}
              >
                <Link to={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        {user?.role === 'ADMIN' && (
          <SidebarMenu className="mt-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/admin'}
                tooltip="Admin"
              >
                <Link to="/admin">
                  <ShieldIcon />
                  <span>Admin</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name || user?.email || 'User',
            email: user?.email || '',
            avatar: '',
          }}
          onLogout={logout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
