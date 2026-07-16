// Google Analytics 4 (gtag.js).
// Sin VITE_GA_MEASUREMENT_ID la integración queda inerte: no se carga el script
// ni se envía nada. Así dev/CI no ensucian las métricas de producción.
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? '';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const analyticsEnabled = (): boolean => Boolean(MEASUREMENT_ID);

let initialized = false;

/** Carga gtag.js una sola vez. Sin measurement id no hace nada. */
export function initAnalytics(): void {
  if (initialized || !MEASUREMENT_ID || typeof window === 'undefined') return;
  initialized = true;

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

/** Vista de página. `path` debe incluir el query string (ej. '/tours?country=1'). */
export function trackPageView(path: string, title: string = document.title): void {
  if (!MEASUREMENT_ID || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: title,
  });
}

/** Evento personalizado (ej. trackEvent('select_tour', { tour_id: 12 })). */
export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (!MEASUREMENT_ID || !window.gtag) return;
  window.gtag('event', name, params);
}
