import DOMPurify from 'dompurify';

// Todo HTML que llega de la API (descripciones del editor enriquecido) se
// sanea antes de entrar en el DOM: lo escriben empresas y formularios públicos,
// y un `<img onerror>` se ejecutaría en el navegador de quien abre la ficha
// (con el JWT en localStorage). Mismas etiquetas que el portal (backpacking-app
// src/lib/html.ts) más `div`, que el editor genera al pulsar Enter.
export const sanitizeHtml = (html: string): string =>
  DOMPurify.sanitize(html ?? '', {
    ALLOWED_TAGS: ['p', 'div', 'br', 'b', 'strong', 'i', 'em', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

/** Solo enlaces web o de correo; cualquier otro esquema (javascript:, data:…) se descarta. */
export const safeUrl = (url: string | null | undefined): string | undefined => {
  const value = (url ?? '').trim();
  return /^(https?:|mailto:)/i.test(value) ? value : undefined;
};
