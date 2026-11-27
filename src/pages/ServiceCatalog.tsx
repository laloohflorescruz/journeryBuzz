import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Icon from '../components/Icon';
import { apiErrorMessage } from '../lib/apiError';
import { fieldClass, labelClass } from '../lib/forms';
import { useAuth } from '../context/AuthContext';

// Servicios y precios de la empresa (Company.service_catalog). Es lo que el
// portal enseña en la pestaña «Servicios y precios» de la ficha (transporte) y
// lo que el viajero elige al pedir presupuesto. Sin precio = «Consultar».

interface Item { name: string; description: string; price: string; currency: string; unit: string }
interface CompanyLite { id: number; name: string; provider_type: string; service_catalog: { name: string; description?: string; price?: number | null; currency?: string; unit?: string }[] | null }

const CURRENCIES = ['USD', 'DOP', 'EUR'];
const emptyItem = (): Item => ({ name: '', description: '', price: '', currency: 'USD', unit: '' });
const toItems = (c: CompanyLite | null): Item[] => (c?.service_catalog ?? []).map((x) => ({
  name: x.name ?? '', description: x.description ?? '', price: x.price == null ? '' : String(x.price),
  currency: x.currency || 'USD', unit: x.unit ?? '',
}));

const ServiceCatalog: React.FC = () => {
  const { isAdminOrAbove } = useAuth();
  const [companies, setCompanies] = useState<CompanyLite[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    api.get('/companies/').then(({ data }) => {
      const list: CompanyLite[] = Array.isArray(data) ? data : data?.results ?? [];
      setCompanies(list);
      if (list[0]) setSelectedId(list[0].id);
    }).catch((err) => setStatus({ ok: false, text: apiErrorMessage(err, 'No se pudo cargar tu empresa.') }))
      .finally(() => setLoading(false));
  }, []);

  const company = useMemo(() => companies.find((c) => c.id === selectedId) ?? null, [companies, selectedId]);
  useEffect(() => { setItems(toItems(company)); setStatus(null); }, [company]);

  const set = (i: number, patch: Partial<Item>) => { setItems((list) => list.map((x, j) => (j === i ? { ...x, ...patch } : x))); setStatus(null); };
  const move = (i: number, dir: -1 | 1) => setItems((list) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return list;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });

  const save = async () => {
    if (!company) return;
    const clean = items.filter((x) => x.name.trim());
    setSaving(true); setStatus(null);
    try {
      const { data } = await api.patch<CompanyLite>(`/companies/${company.id}/`, {
        service_catalog: clean.map((x) => ({ ...x, price: x.price.trim() === '' ? null : x.price })),
      });
      setCompanies((list) => list.map((c) => (c.id === data.id ? { ...c, service_catalog: data.service_catalog } : c)));
      setStatus({ ok: true, text: 'Guardado. Ya se ve en tu ficha del portal.' });
    } catch (err) {
      setStatus({ ok: false, text: apiErrorMessage(err, 'No se pudo guardar.') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />;
  if (!company) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        {status?.text || 'Tu usuario no está vinculado a ninguna empresa todavía.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Servicios y precios</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Lo que ofreces y cuánto cuesta. Se publica en tu ficha del portal y el viajero lo elige al pedirte presupuesto.
            Deja el precio vacío si prefieres que te consulten.
          </p>
        </div>
        {isAdminOrAbove() && companies.length > 1 && (
          <select aria-label="Empresa" value={selectedId ?? ''} onChange={(e) => setSelectedId(Number(e.target.value))} className={`${fieldClass} w-64`}>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Aún no has publicado servicios. Añade el primero, por ejemplo «Traslado aeropuerto – hotel».
          </div>
        )}
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_9rem_6rem_10rem]">
              <div>
                <label className={labelClass}>Servicio *</label>
                <input value={item.name} maxLength={120} placeholder="Traslado aeropuerto – hotel" onChange={(e) => set(i, { name: e.target.value })} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Precio</label>
                <input type="number" min="0" step="0.01" value={item.price} placeholder="Consultar" onChange={(e) => set(i, { price: e.target.value })} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Moneda</label>
                <select value={item.currency} onChange={(e) => set(i, { currency: e.target.value })} className={fieldClass}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Por</label>
                <input value={item.unit} maxLength={60} placeholder="trayecto, persona, día…" onChange={(e) => set(i, { unit: e.target.value })} className={fieldClass} />
              </div>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <div className="flex-1">
                <label className={labelClass}>Descripción (opcional)</label>
                <input value={item.description} maxLength={300} placeholder="Hasta 4 pasajeros con equipaje, aire acondicionado" onChange={(e) => set(i, { description: e.target.value })} className={fieldClass} />
              </div>
              <button type="button" aria-label="Subir" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30">
                <Icon name="chevron-down" className="h-4 w-4 rotate-180" />
              </button>
              <button type="button" aria-label="Bajar" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30">
                <Icon name="chevron-down" className="h-4 w-4" />
              </button>
              <button type="button" aria-label={`Quitar ${item.name || 'servicio'}`} onClick={() => { setItems((list) => list.filter((_, j) => j !== i)); setStatus(null); }}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500">
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {items.length < 40 && (
          <button type="button" onClick={() => setItems((list) => [...list, emptyItem()])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-900">
            <Icon name="plus" className="h-4 w-4" /> Añadir servicio
          </button>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        {status && <span className={`text-sm ${status.ok ? 'text-emerald-700' : 'text-rose-600'}`}>{status.text}</span>}
        <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
          {saving ? 'Guardando…' : 'Guardar servicios'}
        </button>
      </div>
    </div>
  );
};

export default ServiceCatalog;
