// REGLA DE NEGOCIO: en todo par de fechas «desde / hasta», la fecha de inicio
// nunca puede ser posterior a la de fin. Pueden ser iguales (un solo día) y
// puede faltar alguna: el rango solo se valida con las dos presentes.
//
// La fuente de verdad es la API (api/validators.py); esto evita que el usuario
// llegue a enviar un rango imposible y le da el mensaje en el propio formulario.

export const DATE_RANGE_MESSAGE = 'La fecha de inicio no puede ser posterior a la fecha de fin.';

/** true si el rango es válido (o si falta alguno de los extremos). */
export function isValidDateRange(start?: string | null, end?: string | null): boolean {
  if (!start || !end) return true;
  // Las fechas de <input type="date"> son ISO (YYYY-MM-DD): comparables como texto.
  return start <= end;
}

/** Mensaje de error del rango, o null si es válido. */
export function dateRangeError(
  start?: string | null,
  end?: string | null,
  message: string = DATE_RANGE_MESSAGE,
): string | null {
  return isValidDateRange(start, end) ? null : message;
}

/**
 * Atributos para atar dos <input type="date"> entre sí: el calendario del
 * navegador ya no deja elegir un rango invertido.
 * Uso: <input type="date" {...dateRangeBounds(start, end).start} />
 */
export function dateRangeBounds(start?: string | null, end?: string | null) {
  return {
    start: { max: end || undefined },
    end: { min: start || undefined },
  };
}

/** Fecha de hoy en formato ISO, para topes como «no puede ser futura». */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
