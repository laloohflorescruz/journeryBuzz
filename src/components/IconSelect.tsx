import { useState } from 'react';
import Icon, { resolveIcon } from './Icon';

export interface IconOption { value: string; label: string; icon?: string }

// Dropdown de selección única que muestra un icono de línea por opción
// (los <select>/<option> nativos no pueden renderizar SVG).
export default function IconSelect({ value, options, onChange, placeholder = 'Selecciona', className = '' }: {
  value: string;
  options: IconOption[];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.icon && <Icon name={resolveIcon(selected.icon)} className="h-4 w-4 flex-shrink-0 text-emerald-600" />}
          <span className={`truncate ${selected ? '' : 'text-slate-400'}`}>{selected ? selected.label : placeholder}</span>
        </span>
        <Icon name="chevron-down" className={`ml-2 h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-emerald-50 ${o.value === value ? 'bg-emerald-50 font-medium text-emerald-700' : 'text-slate-700'}`}
              >
                {o.icon
                  ? <Icon name={resolveIcon(o.icon)} className={`h-4 w-4 flex-shrink-0 ${o.value === value ? 'text-emerald-600' : 'text-slate-400'}`} />
                  : <span className="h-4 w-4 flex-shrink-0" />}
                <span className="truncate">{o.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
