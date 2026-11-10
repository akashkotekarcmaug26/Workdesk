import { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';



export default function ProtectedRoute({
  roles,
  children,
}: {
  roles?: Role[];
  children: ReactElement;
}) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (roles && !roles.includes(user.role))
    return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />;
  return children;
}
