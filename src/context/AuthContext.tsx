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

/** Reto del segundo paso: la API envió un código al correo de la cuenta. */
export interface OTPChallenge {
  challenge: string;
  email_hint: string;
  expires_in: number;
  resend_in: number;
  digits: number;
}

/** Resultado del login: sesión abierta o código pendiente (socios). */
export type LoginResult =
  | { kind: 'session'; user: AuthUser }
  | { kind: 'otp'; otp: OTPChallenge };

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  /** Segundo paso: valida el código del correo y abre la sesión. */
  verifyOtp: (challenge: string, code: string) => Promise<AuthUser>;
  /** Pide un código nuevo (anula el anterior). */
  resendOtp: (challenge: string) => Promise<OTPChallenge>;
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
      // Un usuario guardado sin token no es una sesión (pudo escribirse a mano
      // en localStorage): se descarta en lugar de pintar el panel con él.
      localStorage.removeItem('buzz_user');
      setUser(null);
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

  const startSession = useCallback((data: { access: string; refresh: string; user: AuthUser }) => {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('buzz_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<LoginResult> => {
    const recaptcha_token = await getRecaptchaToken('login');
    // otp_supported: este cliente sabe pedir el código del correo (las cuentas
    // de socio no reciben tokens sin él).
    const { data } = await api.post('/auth/login/', { username, password, recaptcha_token, otp_supported: true });
    if (data.otp_required) return { kind: 'otp', otp: data as OTPChallenge };
    return { kind: 'session', user: startSession(data) };
  }, [startSession]);

  const verifyOtp = useCallback(async (challenge: string, code: string) => {
    const { data } = await api.post('/auth/login/verify-otp/', { challenge, code });
    return startSession(data);
  }, [startSession]);

  const resendOtp = useCallback(async (challenge: string) => {
    const { data } = await api.post('/auth/login/resend-otp/', { challenge });
    return data as OTPChallenge;
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
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, resendOtp, logout, isSuperAdmin, isAdminOrAbove, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
