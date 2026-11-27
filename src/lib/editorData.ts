// Formatos de datos de los editores completos (EditorKit.tsx): normalizar lo
// que llega de la API y limpiarlo antes de guardar.

export type Visitor = 'both' | 'local' | 'foreign';
export interface AdmissionTier { currency: string; visitor: Visitor; adult: string; child: string; senior: string; student: string; military: string }
export interface Admission { free: boolean; notes: string[]; tiers: AdmissionTier[] }
export const AUDIENCES: { key: keyof Omit<AdmissionTier, 'currency' | 'visitor'>; label: string }[] = [
  { key: 'adult', label: 'Adultos' }, { key: 'child', label: 'Niños' }, { key: 'senior', label: 'Mayores' },
  { key: 'student', label: 'Estudiantes' }, { key: 'military', label: 'Militares' },
];

export const cleanList = (items: string[]) => items.map((s) => s.trim()).filter(Boolean);

/** Los registros antiguos guardan un string donde ahora hay una lista. */
export const asList = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : typeof v === 'string' && v.trim() ? [v] : [];

export const emptyTier = (): AdmissionTier => ({ currency: 'DOP', visitor: 'both', adult: '', child: '', senior: '', student: '', military: '' });

export function toAdmission(raw: unknown): Admission {
  const a = (raw ?? {}) as { free?: boolean; notes?: unknown; tiers?: Partial<AdmissionTier>[] };
  return {
    free: !!a.free,
    notes: asList(a.notes),
    tiers: Array.isArray(a.tiers) ? a.tiers.map((t) => ({ ...emptyTier(), ...t, adult: String(t.adult ?? ''), child: String(t.child ?? ''), senior: String(t.senior ?? ''), student: String(t.student ?? ''), military: String(t.military ?? '') })) : [],
  };
}

/** Para guardar: solo tarifas con algún importe, y sin notas vacías. */
export const cleanAdmission = (a: Admission) => ({
  free: a.free,
  notes: cleanList(a.notes),
  tiers: a.free ? [] : a.tiers.filter((t) => AUDIENCES.some(({ key }) => String(t[key]).trim() !== '')),
});
