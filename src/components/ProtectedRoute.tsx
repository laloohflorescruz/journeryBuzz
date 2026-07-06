import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  requireRole?: 'superadmin' | 'admin';
}

const ProtectedRoute: React.FC<Props> = ({ children, requireRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
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

  if (requireRole === 'superadmin' && role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('protected.accessDenied')}</h2>
          <p className="text-gray-600">{t('protected.requiresSuperAdmin')}</p>
          <p className="text-sm text-gray-400 mt-2">{t('protected.yourRole')} <strong>{role}</strong></p>
        </div>
      </div>
    );
  }

  if (requireRole === 'admin' && !['superadmin', 'admin'].includes(role ?? '')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('protected.accessDenied')}</h2>
          <p className="text-gray-600">{t('protected.requiresAdmin')}</p>
          <p className="text-sm text-gray-400 mt-2">{t('protected.yourRole')} <strong>{role}</strong></p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
