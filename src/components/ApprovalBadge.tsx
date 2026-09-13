import type { ApprovalStatus } from '../services/pois';

// Estado de moderación del contenido. Lo que se crea desde este panel se envía
// a revisión: queda pendiente y sin publicar hasta que un administrador lo
// aprueba desde su panel. Lo fija la API, no el formulario.

const STYLES: Record<ApprovalStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
};

const LABELS: Record<ApprovalStatus, string> = {
  pending: 'Pendiente de aprobación',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

export default function ApprovalBadge({ status, note }: { status?: ApprovalStatus; note?: string }) {
  if (!status) return null;
  return (
    <span
      title={status === 'rejected' && note ? `Motivo: ${note}` : undefined}
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}

/** Aviso para los formularios de alta: explica a dónde va lo que se crea. */
export function ApprovalNotice({ noun }: { noun: string }) {
  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
      Al guardar, {noun} se envía a revisión: queda <strong>pendiente de aprobación</strong> y no
      se publica en el portal hasta que un administrador lo apruebe.
    </div>
  );
}
