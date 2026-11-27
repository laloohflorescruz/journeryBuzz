import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Icon from './Icon';
import { apiErrorMessage } from '../lib/apiError';
import { fieldClass } from '../lib/forms';
import { useAuth } from '../context/AuthContext';

// Pago parcial de la empresa: qué porcentajes del total pueden pagar hoy sus
// clientes en el portal y en la app (Company.payment_options). Un tour que
// tenga los suyos manda; si la empresa no elige ninguno, valen los generales de
// la plataforma. Pagar el 100 % siempre se permite.

interface CompanyLite { id: number; name: string; payment_options: number[] | null }

const PRESETS = [10, 20, 25, 30, 40, 50, 75];

export default function CompanyPaymentOptions() {
  const { isAdminOrAbove } = useAuth();
  const [companies, setCompanies] = useState<CompanyLite[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<number[]>([]);
  const [general, setGeneral] = useState<number[]>([]);
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    api.get('/companies/').then(({ data }) => {
      const list: CompanyLite[] = Array.isArray(data) ? data : data?.results ?? [];
      setCompanies(list);
      if (list[0]) setSelectedId(list[0].id);
    }).catch(() => setCompanies([]));
    api.get('/payment-settings/public/').then(({ data }) => setGeneral((data?.deposit_options ?? []).filter((p: number) => p < 100))).catch(() => undefined);
  }, []);

  const company = useMemo(() => companies.find((c) => c.id === selectedId) ?? null, [companies, selectedId]);
  useEffect(() => { setDraft((company?.payment_options ?? []).filter((p) => p < 100)); setStatus(null); }, [company]);

  if (!company) return null;

  const toggle = (p: number) => { setDraft((d) => (d.includes(p) ? d.filter((x) => x !== p) : [...d, p].sort((a, b) => a - b))); setStatus(null); };
  const addCustom = () => {
    const p = Math.round(Number(custom));
    if (p >= 1 && p <= 99 && !draft.includes(p)) toggle(p);
    setCustom('');
  };
  const saved = (company.payment_options ?? []).filter((p) => p < 100).join(',') === draft.join(',');

  const save = async () => {
    setSaving(true); setStatus(null);
    try {
      const { data } = await api.patch<CompanyLite>(`/companies/${company.id}/`, { payment_options: draft });
      setCompanies((list) => list.map((c) => (c.id === data.id ? { ...c, payment_options: data.payment_options } : c)));
      setStatus({ ok: true, text: 'Guardado.' });
    } catch (err) {
      setStatus({ ok: false, text: apiErrorMessage(err, 'No se pudo guardar.') });
    } finally {
      setSaving(false);
    }
  };

  const options = [...new Set([...PRESETS, ...draft])].sort((a, b) => a - b);
  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Pago por adelantado</h2>
          <p className="mt-0.5 max-w-2xl text-sm text-slate-500">
            Qué parte del total pueden pagar hoy tus clientes al reservar, en la web y en la app. El resto lo cobras antes del tour.
            Un tour con porcentajes propios usa los suyos. Pagar todo (100 %) siempre se permite.
          </p>
        </div>
        {isAdminOrAbove() && companies.length > 1 && (
          <select aria-label="Empresa" value={selectedId ?? ''} onChange={(e) => setSelectedId(Number(e.target.value))} className={`${fieldClass} w-64`}>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {options.map((p) => {
          const on = draft.includes(p);
          return (
            <button key={p} type="button" aria-pressed={on} onClick={() => toggle(p)}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-500'}`}>
              {p} %
            </button>
          );
        })}
        <span className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-sm text-slate-400">100 % siempre</span>
        <div className="flex items-center gap-1">
          <input type="number" min={1} max={99} value={custom} placeholder="Otro %" aria-label="Otro porcentaje"
            onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
            className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none" />
          <button type="button" onClick={addCustom} className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50" aria-label="Añadir porcentaje">
            <Icon name="plus" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {draft.length
            ? `Tus clientes podrán elegir ${[...draft, 100].map((p) => `${p} %`).join(', ')}.`
            : `Sin elegir: se usan los de la plataforma${general.length ? ` (${[...general, 100].map((p) => `${p} %`).join(', ')})` : ''}.`}
        </p>
        <div className="flex items-center gap-3">
          {status && <span className={`text-sm ${status.ok ? 'text-emerald-700' : 'text-rose-600'}`}>{status.text}</span>}
          <button type="button" onClick={save} disabled={saving || saved}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </section>
  );
}
