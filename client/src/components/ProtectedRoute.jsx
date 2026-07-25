import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/auth.hooks';

export default function ProtectedRoute({ requiredRole }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
