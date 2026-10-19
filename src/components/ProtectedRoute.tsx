import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, userCan } from '../context/AuthContext';
import { canAccessBuzz, roleOf } from '../lib/access';
import Icon from './Icon';

interface Props {
  children: React.ReactNode;
  requireRole?: 'superadmin' | 'admin';
  requirePermission?: string;
}

// Backpacking Buzz es el portal de socios (ver lib/access.ts). Primero se
// comprueba que el rol sea de socio; después, el permiso RBAC de cada ruta, que
// es el mismo código que valida la API.
const ProtectedRoute: React.FC<Props> = ({ children, requireRole, requirePermission }) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
          <p className="mt-3 text-sm text-slate-500">{t('protected.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = roleOf(user);
  const roleOk = !requireRole
    || role === 'superadmin'
    || (requireRole === 'admin' && role === 'admin');
  const permOk = !requirePermission || userCan(user, requirePermission);

  if (!canAccessBuzz(user) || !roleOk || !permOk) {
    const outsider = !canAccessBuzz(user);
    const handleLogout = async () => {
      await logout();
      navigate('/login', { replace: true });
    };
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <Icon name="lock" className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-xl font-semibold text-slate-900">{t('protected.accessDenied')}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {outsider ? t('protected.partnersOnly') : t('protected.requiresPermission')}
          </p>
          {!outsider && requirePermission && (
            <p className="mt-1 text-xs text-slate-400">
              {t('protected.missingPermission')} <code>{requirePermission}</code>
            </p>
          )}
          <div className="mt-6 flex flex-col gap-2">
            {!outsider && (
              <button type="button" onClick={() => navigate('/', { replace: true })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                {t('protected.backHome')}
              </button>
            )}
            <button type="button" onClick={handleLogout}
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
              {t('nav.logout', 'Cerrar sesión')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
