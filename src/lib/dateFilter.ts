import { dateRangeError } from './dateRange';

// Utilidades del filtro de fechas que comparten Participantes, Reseñas y
// Reservas. Viven aquí y no en el componente para que ese archivo exporte solo
// un componente (regla de fast refresh).

export interface DateFilterValue { day: string; from: string; to: string }

export const EMPTY_DATE_FILTER: DateFilterValue = { day: '', from: '', to: '' };

/** ISO local (YYYY-MM-DD): evita el salto de día de toISOString(). */
export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Día de una fecha de la API, venga como YYYY-MM-DD o como ISO completo. */
export const dayOf = (iso?: string | null) => (iso || '').slice(0, 10);

export const fmtDayLong = (iso: string) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('es', { dateStyle: 'long' }) : 'Sin fecha';

/**
 * Decide si una fecha entra en el filtro. Se usa dentro del `filter` de cada
 * pantalla para que la regla de fechas viva en un solo sitio.
 */
export function matchesDateFilter(
  value: string | null | undefined,
  { day, from, to }: DateFilterValue,
): boolean {
  const d = dayOf(value);
  if (day) return d === day;
  // Rango inválido: no se filtra (la pantalla ya muestra el error).
  if (dateRangeError(from, to)) return true;
  return (!from || d >= from) && (!to || d <= to);
}
