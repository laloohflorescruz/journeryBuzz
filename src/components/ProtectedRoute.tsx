import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  // Se conservan por compatibilidad con las rutas de App.tsx, pero el acceso a
  // Backpacking Buzz es exclusivo de superadmin: el gate real es el rol.
  requireRole?: 'superadmin' | 'admin';
  requirePermission?: string;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-gray-600">{t('protected.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user.role ?? user.profile?.role;

  // Backpacking Buzz es el panel de administración: SOLO superadmin entra.
  if (role !== 'superadmin') {
    const handleLogout = async () => {
      await logout();
      navigate('/login', { replace: true });
    };
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-sm">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('protected.accessDenied')}</h2>
          <p className="text-gray-600">{t('protected.requiresSuperAdmin')}</p>
          <p className="text-sm text-gray-400 mt-2">
            {t('protected.yourRole')} <strong>{role ?? '—'}</strong>
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            {t('nav.logout', 'Cerrar sesión')}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
