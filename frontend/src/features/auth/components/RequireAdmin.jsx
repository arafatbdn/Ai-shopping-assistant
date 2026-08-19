import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider.jsx';

export default function RequireAdmin({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-81px)] items-center justify-center text-sm text-white/50">
        Verifying admin access…
      </section>
    );
  }

  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/admin/login?next=${next}`} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
