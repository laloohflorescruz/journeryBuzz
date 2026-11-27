// Consentimiento de cookies (banner de CookieBanner.tsx).
//
// Solo hay una categoría opcional: analítica (Google Analytics). Las cookies
// necesarias (sesión, idioma, preferencias del mapa, reCAPTCHA para frenar el
// spam) no piden permiso. Hasta que el visitante acepta, GA no se carga.
// La decisión se guarda en este navegador y se puede cambiar cuando se quiera
// desde «Preferencias de cookies» (openCookieSettings).

const KEY = 'bt_cookie_consent';
const VERSION = 1; // subir si cambian las categorías: vuelve a preguntarse
const CHANGE = 'bt:cookie-consent';
const OPEN = 'bt:cookie-settings';

export interface Consent { v: number; analytics: boolean; at: string }

export function getConsent(): Consent | null {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || 'null') as Consent | null;
    return c && c.v === VERSION ? c : null;
  } catch {
    return null;
  }
}

export const analyticsAllowed = (): boolean => getConsent()?.analytics === true;

export function setConsent(analytics: boolean): void {
  const value: Consent = { v: VERSION, analytics, at: new Date().toISOString() };
  try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* sin almacenamiento */ }
  window.dispatchEvent(new CustomEvent(CHANGE, { detail: value }));
}

export function onConsentChange(cb: (c: Consent) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<Consent>).detail);
  window.addEventListener(CHANGE, handler);
  return () => window.removeEventListener(CHANGE, handler);
}

/** Vuelve a abrir el banner (enlace «Preferencias de cookies»). */
export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN));
}

export function onOpenCookieSettings(cb: () => void): () => void {
  window.addEventListener(OPEN, cb);
  return () => window.removeEventListener(OPEN, cb);
}
