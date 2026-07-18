import { userCan, type AuthUser } from '../context/AuthContext';

// Fuente única del menú y de los permisos por sección: la consumen el Sidebar
// (para ocultar lo que no puedes usar) y App.tsx (para proteger la ruta). Los
// códigos son los del RBAC de la API (ver seed_rbac.py); '*' concede todo.
//
// `permission: undefined` = basta con tener sesión iniciada.

export interface NavItem {
  to: string;
  /** Clave i18n del rótulo (nav.*). */
  labelKey: string;
  icon: string;
  permission?: string;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: 'chart-bar', end: true },
  { to: '/hospedajes', labelKey: 'nav.hospedajes', icon: 'bed', permission: 'accommodation:view' },
  { to: '/rent-a-car', labelKey: 'nav.rentACar', icon: 'car', permission: 'vehicle:view' },
  { to: '/tours', labelKey: 'nav.tours', icon: 'van', permission: 'tour:view' },
  { to: '/city-tours', labelKey: 'nav.cityTours', icon: 'city', permission: 'tour:view' },
  // No hay recurso `itinerary` en el catálogo RBAC; los itinerarios acompañan a
  // los tours, así que se rigen por el mismo permiso de lectura.
  { to: '/itineraries', labelKey: 'nav.itineraries', icon: 'map', permission: 'tour:view' },
  { to: '/reservations', labelKey: 'nav.reservations', icon: 'calendar', permission: 'booking:view' },
  { to: '/payments', labelKey: 'nav.payments', icon: 'credit-card', permission: 'payment:view' },
  { to: '/reviews', labelKey: 'nav.reviews', icon: 'star', permission: 'review:view' },
  { to: '/reviews-by-tours', labelKey: 'nav.reviewsByTours', icon: 'chart-pie', permission: 'review:view' },
  { to: '/participants', labelKey: 'nav.participants', icon: 'users', permission: 'booking:view' },
];

/** Items del menú que el usuario puede abrir de verdad. */
export const visibleNavItems = (user: AuthUser | null): NavItem[] =>
  NAV_ITEMS.filter((item) => !item.permission || userCan(user, item.permission));
