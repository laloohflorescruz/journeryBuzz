// Formateo compartido de importes y fechas en los listados del panel.

/** Importe con su moneda (ej. «USD 1,250»). */
export const money = (amount: string, currency: string) =>
  `${currency} ${Number(amount || 0).toLocaleString()}`;

/** Fecha corta en español (ej. «5 oct 2026»), o «—» si no hay fecha. */
export const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es', { dateStyle: 'medium' }) : '—';
