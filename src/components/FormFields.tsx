import Icon from './Icon';
import { fieldClass, labelClass } from '../lib/forms';

// Campos de formulario compartidos por las pantallas de alta/edición.

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, className, ...p }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input {...p} className={`${fieldClass} ${className ?? ''}`} />
  </div>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, className, ...p }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <textarea {...p} className={`${fieldClass} resize-none ${className ?? ''}`} />
  </div>
);

// Editor de lista de textos con encabezado propio (formularios de tours).
export function StringList({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input value={it} onChange={(e) => onChange(items.map((x, idx) => (idx === i ? e.target.value : x)))} className={fieldClass} placeholder={`${placeholder} ${i + 1}`} />
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="rounded-lg px-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...items, ''])} className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
          <Icon name="plus" className="h-4 w-4" /> Agregar
        </button>
      </div>
    </div>
  );
}

// Selector múltiple en forma de etiquetas (POIs y Destinos).
export function ChipPicker({ label, options, selected, onToggle }: {
  label: string;
  options: { id: number; name_es: string; name_en: string; is_active?: boolean }[];
  selected: number[];
  onToggle: (id: number) => void;
}) {
  const visible = options.filter((o) => o.is_active !== false);
  return (
    <div>
      <label className={labelClass}>
        {label} {selected.length > 0 && <span className="font-normal text-slate-400">· {selected.length}</span>}
      </label>
      {visible.length === 0 ? (
        <p className="text-sm text-slate-400">Sin opciones disponibles.</p>
      ) : (
        <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/60 p-2">
          {visible.map((o) => {
            const on = selected.includes(o.id);
            return (
              <button key={o.id} type="button" onClick={() => onToggle(o.id)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                }`}>
                {o.name_es || o.name_en}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
