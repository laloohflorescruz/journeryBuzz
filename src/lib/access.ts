import type { AuthUser } from '../context/AuthContext';

// Quién entra a Backpacking Buzz: es el portal de los SOCIOS (empresas que
// publican tours, recomiendan POIs, gestionan su ficha…) más el equipo de la
// plataforma. Los viajeros (customer) usan el portal público, no este panel.
// Dentro, cada sección la decide el permiso RBAC de la ruta y la API limita los
// datos a la empresa del socio.
export const PARTNER_ROLES = ['provider', 'admin', 'superadmin'] as const;

export const roleOf = (user: AuthUser | null): string => user?.role ?? user?.profile?.role ?? '';

export const canAccessBuzz = (user: AuthUser | null): boolean =>
  (PARTNER_ROLES as readonly string[]).includes(roleOf(user));
