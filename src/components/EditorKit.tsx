import { useState, type ReactNode } from 'react';
import Icon, { resolveIcon } from './Icon';
import { fieldClass, labelClass } from '../lib/forms';
import { AUDIENCES, emptyTier, type Admission, type AdmissionTier, type Visitor } from '../lib/editorData';

// Piezas de los editores completos de POIs y destinos del portal de socios.
// Mismos formatos JSON que guarda la API (y que edita el panel admin), con el
// lenguaje sobrio de buzz: sin emojis, botones de texto y slate/emerald.

// ─── Pestañas ───────────────────────────────────────────────────────────────

export function Tabs<K extends string>({ tabs, active, onChange }: {
  tabs: { key: K; label: string }[]; active: K; onChange: (k: K) => void;
}) {
  return (
    <div role="tablist" className="mb-5 flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((t) => (
        <button key={t.key} type="button" role="tab" aria-selected={active === t.key} onClick={() => onChange(t.key)}
          className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${active === t.key ? 'border-emerald-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Block({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

const addBtn = 'inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700';
const removeBtn = 'rounded-lg px-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500';

// ─── Lista de textos ────────────────────────────────────────────────────────

export function TextList({ label, items, onChange, placeholder = '', addLabel = 'Añadir' }: {
  label?: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel?: string;
}) {
  return (
    <div>
      {label && <label className={labelClass}>{label}</label>}
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input value={it} placeholder={placeholder} className={fieldClass}
              onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            <button type="button" aria-label="Quitar" onClick={() => onChange(items.filter((_, j) => j !== i))} className={removeBtn}>
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...items, ''])} className={addBtn}>
          <Icon name="plus" className="h-4 w-4" /> {addLabel}
        </button>
      </div>
    </div>
  );
}

// ─── Etiquetas (catálogo + personalizadas) ──────────────────────────────────

export function TagSelector({ label, options, selected, onChange }: {
  label: string; options: { label: string; icon?: string }[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  const [custom, setCustom] = useState('');
  const known = options.map((o) => o.label);
  const toggle = (t: string) => onChange(selected.includes(t) ? selected.filter((x) => x !== t) : [...selected, t]);
  const add = () => { const t = custom.trim(); if (t && !selected.includes(t)) onChange([...selected, t]); setCustom(''); };
  return (
    <div>
      <label className={labelClass}>{label} {selected.length > 0 && <span className="font-normal text-slate-400">· {selected.length}</span>}</label>
      <div className="flex flex-wrap gap-1.5">
        {[...options, ...selected.filter((s) => !known.includes(s)).map((s) => ({ label: s, icon: 'tag' }))].map((o) => {
          const on = selected.includes(o.label);
          return (
            <button key={o.label} type="button" onClick={() => toggle(o.label)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}>
              <Icon name={resolveIcon(o.icon || 'tag')} className="h-3.5 w-3.5" /> {o.label}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Añadir otra…" className={fieldClass}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add} className="rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-600 hover:border-slate-900">Añadir</button>
      </div>
    </div>
  );
}

// ─── Horario por bloques ────────────────────────────────────────────────────

export interface ScheduleBlock { days: string[]; open: string; close: string; open24: boolean }
const DAYS = [['mon', 'Lun'], ['tue', 'Mar'], ['wed', 'Mié'], ['thu', 'Jue'], ['fri', 'Vie'], ['sat', 'Sáb'], ['sun', 'Dom']];

export function ScheduleEditor({ blocks, onChange }: { blocks: ScheduleBlock[]; onChange: (b: ScheduleBlock[]) => void }) {
  const update = (i: number, patch: Partial<ScheduleBlock>) => onChange(blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  return (
    <div className="space-y-3">
      {blocks.length === 0 && <p className="text-xs text-slate-400">Sin horario. Añade un bloque, p. ej. Lun–Vie de 9:00 a 18:00.</p>}
      {blocks.map((b, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-slate-200 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map(([code, label]) => {
                const on = b.days.includes(code);
                return (
                  <button key={code} type="button" onClick={() => update(i, { days: on ? b.days.filter((d) => d !== code) : [...b.days, code] })}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 text-slate-600 hover:border-slate-500'}`}>{label}</button>
                );
              })}
            </div>
            <button type="button" aria-label="Quitar bloque" onClick={() => onChange(blocks.filter((_, j) => j !== i))} className={removeBtn}><Icon name="close" className="h-4 w-4" /></button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={b.open24} onChange={(e) => update(i, { open24: e.target.checked })} className="h-4 w-4 accent-emerald-600" /> Abierto 24 horas
            </label>
            {!b.open24 && (
              <div className="flex items-center gap-2">
                <input type="time" value={b.open} onChange={(e) => update(i, { open: e.target.value })} className={`${fieldClass} w-32`} />
                <span className="text-slate-400">–</span>
                <input type="time" value={b.close} onChange={(e) => update(i, { close: e.target.value })} className={`${fieldClass} w-32`} />
              </div>
            )}
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...blocks, { days: [], open: '09:00', close: '18:00', open24: false }])} className={addBtn}>
        <Icon name="plus" className="h-4 w-4" /> Añadir horario
      </button>
    </div>
  );
}

// ─── Meses (1-12) ───────────────────────────────────────────────────────────

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function MonthsPicker({ label, value, onChange }: { label: string; value: number[]; onChange: (v: number[]) => void }) {
  const all = value.length >= 12;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className={labelClass}>{label}</label>
        <button type="button" onClick={() => onChange(all ? [] : MONTHS.map((_, i) => i + 1))}
          className={`rounded-full border px-3 py-0.5 text-xs font-medium ${all ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 text-slate-600'}`}>Todo el año</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {MONTHS.map((m, i) => {
          const n = i + 1; const on = value.includes(n);
          return (
            <button key={m} type="button" onClick={() => onChange(on ? value.filter((x) => x !== n) : [...value, n].sort((a, b) => a - b))}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 text-slate-600 hover:border-slate-500'}`}>{m}</button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Precio de entrada ──────────────────────────────────────────────────────

export function AdmissionEditor({ value, onChange }: { value: Admission; onChange: (a: Admission) => void }) {
  const setTier = (i: number, patch: Partial<AdmissionTier>) => onChange({ ...value, tiers: value.tiers.map((t, j) => (j === i ? { ...t, ...patch } : t)) });
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={value.free} onChange={(e) => onChange({ ...value, free: e.target.checked })} className="h-4 w-4 accent-emerald-600" />
        Entrada gratuita
      </label>
      {!value.free && (
        <>
          {value.tiers.map((t, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <select value={t.currency} onChange={(e) => setTier(i, { currency: e.target.value })} className={`${fieldClass} w-24`}>
                  {['DOP', 'USD', 'EUR'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={t.visitor} onChange={(e) => setTier(i, { visitor: e.target.value as Visitor })} className={`${fieldClass} w-52`}>
                  <option value="both">Locales y extranjeros</option>
                  <option value="local">Solo locales</option>
                  <option value="foreign">Solo extranjeros</option>
                </select>
                <button type="button" aria-label="Quitar tarifa" onClick={() => onChange({ ...value, tiers: value.tiers.filter((_, j) => j !== i) })} className={`${removeBtn} ml-auto`}>
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {AUDIENCES.map(({ key, label }) => (
                  <div key={key}>
                    <label className={labelClass}>{label}</label>
                    <input type="number" min="0" step="0.01" value={t[key]} onChange={(e) => setTier(i, { [key]: e.target.value })} className={fieldClass} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => onChange({ ...value, tiers: [...value.tiers, emptyTier()] })} className={addBtn}>
            <Icon name="plus" className="h-4 w-4" /> Añadir tarifa (moneda o tipo de visitante)
          </button>
        </>
      )}
      <TextList label="Notas de la entrada" items={value.notes} onChange={(notes) => onChange({ ...value, notes })} placeholder="Ej. Menores de 5 años no pagan" addLabel="Añadir nota" />
    </div>
  );
}

// ─── Pares clave → valor (info práctica del destino) ────────────────────────

export function KVEditor({ label, data, onChange, hint }: {
  label: string; data: Record<string, string>; onChange: (d: Record<string, string>) => void; hint?: string;
}) {
  const rows = Object.entries(data);
  const set = (list: [string, string][]) => onChange(Object.fromEntries(list));
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {hint && <p className="mb-2 text-xs text-slate-500">{hint}</p>}
      <div className="space-y-2">
        {rows.map(([k, v], i) => (
          <div key={i} className="flex gap-2">
            <input value={k} placeholder="Tipo" className={`${fieldClass} w-40`}
              onChange={(e) => set(rows.map((r, j) => (j === i ? [e.target.value, r[1]] : r)))} />
            <input value={v} placeholder="Detalle" className={fieldClass}
              onChange={(e) => set(rows.map((r, j) => (j === i ? [r[0], e.target.value] : r)))} />
            <button type="button" aria-label="Quitar" onClick={() => set(rows.filter((_, j) => j !== i))} className={removeBtn}><Icon name="close" className="h-4 w-4" /></button>
          </div>
        ))}
        <button type="button" onClick={() => set([...rows, [`nuevo${rows.length + 1}`, '']])} className={addBtn}>
          <Icon name="plus" className="h-4 w-4" /> Añadir
        </button>
      </div>
    </div>
  );
}

// ─── Filas de objetos (paradas, penalizaciones, fechas…) ────────────────────

export function RowsEditor<T extends Record<string, unknown>>({ label, rows, onChange, empty, columns, addLabel = 'Añadir' }: {
  label: string; rows: T[]; onChange: (r: T[]) => void; empty: () => T; addLabel?: string;
  columns: { key: keyof T & string; label: string; type?: 'text' | 'number' | 'date' | 'checkbox'; wide?: boolean }[];
}) {
  const set = (i: number, key: keyof T, v: unknown) => onChange(rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 p-2">
            {columns.map((c) => (
              c.type === 'checkbox' ? (
                <label key={c.key} className="flex items-center gap-1.5 pb-2 text-xs text-slate-600">
                  <input type="checkbox" checked={!!r[c.key]} onChange={(e) => set(i, c.key, e.target.checked)} className="h-4 w-4 accent-emerald-600" /> {c.label}
                </label>
              ) : (
                <div key={c.key} className={c.wide ? 'min-w-[12rem] flex-1' : 'w-36'}>
                  <span className="mb-0.5 block text-[11px] text-slate-500">{c.label}</span>
                  <input type={c.type ?? 'text'} value={String(r[c.key] ?? '')} className={fieldClass}
                    onChange={(e) => set(i, c.key, c.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)} />
                </div>
              )
            ))}
            <button type="button" aria-label="Quitar" onClick={() => onChange(rows.filter((_, j) => j !== i))} className={`${removeBtn} mb-1.5 ml-auto`}><Icon name="close" className="h-4 w-4" /></button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...rows, empty()])} className={addBtn}>
          <Icon name="plus" className="h-4 w-4" /> {addLabel}
        </button>
      </div>
    </div>
  );
}

// ─── Chips de opciones fijas (idiomas, accesibilidad…) ──────────────────────

export function OptionChips({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  return (
    <TagSelector label={label} options={options.map((o) => ({ label: o }))} selected={selected} onChange={onChange} />
  );
}
