import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { Rol } from '../types';

interface Props {
  children: React.ReactNode;
  allowedRoles?: Rol[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
