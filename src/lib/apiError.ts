// Extrae el mensaje útil de un error de la API (DRF responde {campo: ["texto"]}).
// Sirve para que las reglas de negocio del backend —por ejemplo el rango de
// fechas de validators.py— se vean tal cual en el formulario.
export function apiErrorMessage(err: unknown, fallback: string): string {
  const response = (err as { response?: { status?: number; data?: unknown } })?.response;
  // Límite de intentos (login: 10 por minuto). El texto de DRF está en inglés.
  if (response?.status === 429) return 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.';
  const data = response?.data;
  // Un 500 de Django llega como página HTML: eso no es un mensaje para el usuario.
  if (typeof data === 'string') return data.trimStart().startsWith('<') || data.length > 300 ? fallback : data;
  if (Array.isArray(data) && typeof data[0] === 'string') return data[0];
  if (data && typeof data === 'object') {
    for (const value of Object.values(data as Record<string, unknown>)) {
      if (typeof value === 'string') return value;
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
    }
  }
  return fallback;
}
