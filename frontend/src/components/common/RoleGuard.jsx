import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Client-side visibility only - a courtesy, not a security boundary.
 * The API enforces the real permission checks (see backend requireRole).
 */
export default function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth();
  if (!allowedRoles || allowedRoles.includes(user?.role)) {
    return children;
  }
  return <Navigate to="/dashboard" replace />;
}
