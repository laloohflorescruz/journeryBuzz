// Google Analytics 4 (gtag.js).
// Sin VITE_GA_MEASUREMENT_ID (o con el marcador G-XXXXXXXXXX) la integración
// queda inerte: no se carga el script ni se envía nada. Y aun configurada, GA
// solo se carga cuando el visitante acepta las cookies de analítica
// (services/consent.ts); si luego las rechaza, se desactiva y se borran.
import { analyticsAllowed } from './consent';

const RAW_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID ?? '').trim();
const MEASUREMENT_ID = /^G-[A-Z0-9]{4,}$/i.test(RAW_ID) && !/^G-X+$/i.test(RAW_ID) ? RAW_ID : '';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

/** ¿Hay GA configurado? (sin él no hace falta pedir consentimiento). */
export const analyticsEnabled = (): boolean => Boolean(MEASUREMENT_ID);

let initialized = false;

/** Carga gtag.js una sola vez, solo si está configurado y aceptado. */
export function initAnalytics(): void {
  if (initialized || !MEASUREMENT_ID || typeof window === 'undefined' || !analyticsAllowed()) return;
  initialized = true;
  window[`ga-disable-${MEASUREMENT_ID}`] = false;

  window.dataLayer = window.dataLayer || [];
  // gtag empuja el objeto `arguments` tal cual: es el contrato de gtag.js.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  // send_page_view: false → en una SPA el cambio de ruta no recarga la página,
  // así que los page_view los emite trackPageView desde el router.
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

/** El visitante retiró el permiso: GA deja de enviar y se borran sus cookies. */
export function disableAnalytics(): void {
  if (!MEASUREMENT_ID) return;
  window[`ga-disable-${MEASUREMENT_ID}`] = true;
  const host = window.location.hostname;
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
  document.cookie.split(';').map((c) => c.split('=')[0].trim()).filter((n) => n === '_ga' || n.startsWith('_ga_'))
    .forEach((name) => domains.forEach((d) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ''}`;
    }));
}

const active = () => Boolean(MEASUREMENT_ID && window.gtag && analyticsAllowed());

/** Vista de página. `path` debe incluir el query string (ej. '/tours?country=1'). */
export function trackPageView(path: string, title: string = document.title): void {
  if (!active()) return;
  window.gtag!('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: title,
  });
}

/** Evento personalizado (ej. trackEvent('select_tour', { tour_id: 12 })). */
export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (!active()) return;
  window.gtag!('event', name, params);
}
