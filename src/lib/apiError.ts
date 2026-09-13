// Extrae el mensaje útil de un error de la API (DRF responde {campo: ["texto"]}).
// Sirve para que las reglas de negocio del backend —por ejemplo el rango de
// fechas de validators.py— se vean tal cual en el formulario.
export function apiErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  if (typeof data === 'string') return data;
  if (Array.isArray(data) && typeof data[0] === 'string') return data[0];
  if (data && typeof data === 'object') {
    for (const value of Object.values(data as Record<string, unknown>)) {
      if (typeof value === 'string') return value;
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
    }
  }
  return fallback;
}
