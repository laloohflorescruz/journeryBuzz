import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getRecaptchaToken } from '../services/recaptcha';

export interface UserProfile {
  id: number;
  role: 'superadmin' | 'admin' | 'provider' | 'customer';
  phone: string;
  avatar: string;
}

export interface RoleRef {
  slug: string;
  name: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  profile: UserProfile;
  /** Códigos de permiso efectivos que devuelve /auth/me/ (['*'] = superadmin). */
  permissions?: string[];
  /** Roles dinámicos asignados (RBAC). */
  roles?: RoleRef[];
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isSuperAdmin: () => boolean;
  isAdminOrAbove: () => boolean;
  /** ¿El usuario tiene este permiso? (ej. 'vehicle:view'). '*' concede todo. */
  can: (code: string) => boolean;
}

const WILDCARD = '*';

/** Comprobación pura, reutilizable fuera del hook (ej. filtrar el menú). */
export function userCan(user: AuthUser | null, code: string): boolean {
  const perms = user?.permissions;
  if (!perms) return false;
  return perms.includes(WILDCARD) || perms.includes(code);
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('buzz_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // Validate the stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/auth/me/')
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem('buzz_user', JSON.stringify(data));
      })
      .catch(() => {
        // Token invalid or expired and refresh failed — clear state
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('buzz_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const recaptcha_token = await getRecaptchaToken('login');
    const { data } = await api.post('/auth/login/', { username, password, recaptcha_token });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('buzz_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token');
    try {
      if (refresh) await api.post('/auth/logout/', { refresh });
    } catch { /* ignore */ }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('buzz_user');
    setUser(null);
  }, []);

  const isSuperAdmin = useCallback(() => user?.role === 'superadmin' || user?.profile?.role === 'superadmin', [user]);
  const isAdminOrAbove = useCallback(() => ['superadmin', 'admin'].includes(user?.role ?? user?.profile?.role ?? ''), [user]);
  const can = useCallback((code: string) => userCan(user, code), [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isSuperAdmin, isAdminOrAbove, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
