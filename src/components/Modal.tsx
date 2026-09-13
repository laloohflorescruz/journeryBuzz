import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

// REGLA: toda ventana modal de la app usa este componente. Así el diseño
// (fondo, panel, cabecera, pie) y el comportamiento (Esc, clic fuera, botón de
// cerrar, bloqueo del scroll de fondo, accesibilidad) son idénticos en todas
// las pantallas. No escribas overlays `fixed inset-0` a mano.

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// Clases compartidas para los botones del pie (mismo look en todos los modales).
export const modalBtnGhost =
  'rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50';
export const modalBtnPrimary =
  'inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50';
export const modalBtnDanger =
  'inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Línea secundaria bajo el título (contexto: id, importe, etc.). */
  subtitle?: ReactNode;
  size?: ModalSize;
  /** Botonera del pie; si se omite, el modal no pinta pie. */
  footer?: ReactNode;
  /** false = solo se cierra con los botones (procesos en curso). */
  dismissable?: boolean;
  /** Padding del cuerpo; usa 'p-0' para contenido a sangre (mapas, imágenes). */
  bodyClassName?: string;
  /** Por encima de otros modales (avisos del sistema, p. ej. sesión inactiva). */
  elevated?: boolean;
  /** Oculta la X de la cabecera (avisos que exigen elegir una opción). */
  hideClose?: boolean;
  children: ReactNode;
}

export default function Modal({
  open, onClose, title, subtitle, size = 'md', footer, dismissable = true,
  bodyClassName = 'px-5 py-4', elevated = false, hideClose = false, children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && dismissable) onClose(); };
    document.addEventListener('keydown', onKey);
    // Bloquea el scroll del fondo mientras el modal está abierto.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, dismissable, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${elevated ? 'z-[60]' : 'z-50'} flex items-center justify-center bg-slate-900/50 p-4`}
      onClick={dismissable ? onClose : undefined}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[90vh] w-full ${SIZES[size]} flex-col overflow-hidden rounded-2xl bg-white shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {!hideClose && (
            <button
              type="button" onClick={onClose} aria-label="Cerrar"
              className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className={`flex-1 overflow-y-auto ${bodyClassName}`}>{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** Confirmación destructiva con el mismo diseño y comportamiento que el resto. */
export function ConfirmModal({
  open, onClose, onConfirm, title, message, confirmLabel = 'Eliminar', cancelLabel = 'Cancelar', busy = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
}) {
  return (
    <Modal
      open={open} onClose={onClose} title={title} size="sm" dismissable={!busy}
      footer={(
        <>
          <button type="button" onClick={onClose} disabled={busy} className={modalBtnGhost}>{cancelLabel}</button>
          <button type="button" onClick={onConfirm} disabled={busy} className={modalBtnDanger}>
            <Icon name="close" className="h-4 w-4" /> {confirmLabel}
          </button>
        </>
      )}
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}
