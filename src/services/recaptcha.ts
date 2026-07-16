// Google reCAPTCHA v3 (invisible, basado en score).
// Sin VITE_RECAPTCHA_SITE_KEY la integración queda inerte: no se carga el
// script y getRecaptchaToken devuelve ''. El backend, si tampoco tiene su
// secret key configurada, acepta las peticiones sin token.
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '';

interface Grecaptcha {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

export const recaptchaEnabled = (): boolean => Boolean(SITE_KEY);

let loader: Promise<void> | null = null;

/** Carga el script de reCAPTCHA una sola vez (idempotente). */
function loadRecaptcha(): Promise<void> {
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY)}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar reCAPTCHA'));
    document.head.appendChild(script);
  });
  return loader;
}

/**
 * Token de un solo uso para `action` (ej. 'login', 'register'). La action se
 * verifica en el backend, así que debe coincidir con la que espera el endpoint.
 * Devuelve '' si el captcha está desactivado o si el script no cargó; en ese
 * caso el backend rechaza la petición cuando sí tiene la verificación activa.
 */
export async function getRecaptchaToken(action: string): Promise<string> {
  if (!SITE_KEY) return '';
  try {
    await loadRecaptcha();
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha) return '';
    await new Promise<void>((resolve) => grecaptcha.ready(resolve));
    return await grecaptcha.execute(SITE_KEY, { action });
  } catch {
    return '';
  }
}
