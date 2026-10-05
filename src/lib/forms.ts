// Utilidades compartidas por los formularios del panel (mismo aspecto en todas
// las pantallas de alta/edición).

export const fieldClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';
export const labelClass = 'mb-1 block text-xs font-medium text-slate-600';

/** Slug a partir de un nombre: sin acentos, en minúsculas y con guiones. */
export const toSlug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Añade o quita un id de una selección múltiple. */
export const toggleId = (list: number[], id: number) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
