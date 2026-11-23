import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Icon from '../components/Icon';
import Modal, { modalBtnDanger, modalBtnGhost, modalBtnPrimary } from '../components/Modal';
import { Input } from '../components/FormFields';
import { apiErrorMessage } from '../lib/apiError';
import { fmtDate } from '../lib/format';
import { fieldClass, labelClass, toggleId } from '../lib/forms';
import { dateRangeError } from '../lib/dateRange';
import { useAuth } from '../context/AuthContext';

// Cupones de descuento del socio (/coupons/ en la API). El viajero escribe el
// código en el checkout del portal; el descuento lo asume la empresa. Un
// administrador ve los de todas y crea en nombre de cualquiera.

interface Coupon {
  id: number;
  company_id: number;
  company_name: string;
  code: string;
  description: string;
  discount_type: 'percent' | 'fixed';
  value: string;
  currency: string;
  min_total: string | null;
  max_uses: number | null;
  uses_count: number;
  once_per_customer: boolean;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  tour_ids: number[];
  bookings_count: number;
}

interface TourLite { id: number; name: string; company?: { id: number } | number | null; company_id?: number }
interface CompanyLite { id: number; name: string }

interface Draft {
  company_id: number | '';
  code: string;
  description: string;
  discount_type: 'percent' | 'fixed';
  value: string;
  currency: string;
  min_total: string;
  max_uses: string;
  once_per_customer: boolean;
  start_date: string;
  end_date: string;
  is_active: boolean;
  tour_ids: number[];
}

const EMPTY: Draft = {
  company_id: '', code: '', description: '', discount_type: 'percent', value: '', currency: 'USD',
  min_total: '', max_uses: '', once_per_customer: false, start_date: '', end_date: '', is_active: true, tour_ids: [],
};

const toDraft = (c: Coupon): Draft => ({
  company_id: c.company_id, code: c.code, description: c.description, discount_type: c.discount_type,
  value: String(Number(c.value)), currency: c.currency || 'USD', min_total: c.min_total ? String(Number(c.min_total)) : '',
  max_uses: c.max_uses != null ? String(c.max_uses) : '', once_per_customer: c.once_per_customer,
  start_date: c.start_date ?? '', end_date: c.end_date ?? '', is_active: c.is_active, tour_ids: c.tour_ids,
});

const list = <T,>(data: unknown): T[] => (Array.isArray(data) ? data : ((data as { results?: T[] })?.results ?? []));

const tourCompany = (t: TourLite) =>
  t.company_id ?? (typeof t.company === 'object' && t.company ? t.company.id : (t.company as number | null | undefined));

const discountLabel = (c: Coupon) =>
  c.discount_type === 'percent' ? `${Number(c.value)} %` : `${c.currency} ${Number(c.value).toLocaleString()}`;

function couponState(c: Coupon): { label: string; tone: string } {
  const today = new Date().toISOString().slice(0, 10);
  if (!c.is_active) return { label: 'Pausado', tone: 'bg-slate-100 text-slate-600' };
  if (c.end_date && c.end_date < today) return { label: 'Caducado', tone: 'bg-slate-100 text-slate-600' };
  if (c.max_uses != null && c.uses_count >= c.max_uses) return { label: 'Agotado', tone: 'bg-amber-50 text-amber-700' };
  if (c.start_date && c.start_date > today) return { label: 'Programado', tone: 'bg-sky-50 text-sky-700' };
  return { label: 'Activo', tone: 'bg-emerald-50 text-emerald-700' };
}

const Coupons: React.FC = () => {
  const { isAdminOrAbove } = useAuth();
  const admin = isAdminOrAbove();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [tours, setTours] = useState<TourLite[]>([]);
  const [companies, setCompanies] = useState<CompanyLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Coupon | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/coupons/')
      .then(({ data }) => setCoupons(list<Coupon>(data)))
      .catch((err) => setError(apiErrorMessage(err, 'No se pudieron cargar los cupones.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    api.get('/tours/?mine=true').then(({ data }) => setTours(list<TourLite>(data))).catch(() => setTours([]));
    if (admin) api.get('/companies/').then(({ data }) => setCompanies(list<CompanyLite>(data))).catch(() => setCompanies([]));
  }, [load, admin]);

  const tourName = useMemo(() => new Map(tours.map((t) => [t.id, t.name])), [tours]);
  const draftTours = useMemo(
    () => (draft && admin && draft.company_id ? tours.filter((t) => tourCompany(t) === draft.company_id) : tours),
    [tours, draft, admin],
  );

  const openNew = () => { setEditing(null); setDraft({ ...EMPTY, company_id: admin && companies.length === 1 ? companies[0].id : '' }); setFormError(''); };
  const openEdit = (c: Coupon) => { setEditing(c); setDraft(toDraft(c)); setFormError(''); };
  const close = () => { if (!saving) { setDraft(null); setEditing(null); } };
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!draft) return;
    const rangeError = dateRangeError(draft.start_date, draft.end_date);
    if (rangeError) { setFormError(rangeError); return; }
    if (admin && !draft.company_id) { setFormError('Elige la empresa del cupón.'); return; }
    const body = {
      ...(admin ? { company_id: draft.company_id } : {}),
      code: draft.code.trim().toUpperCase(),
      description: draft.description.trim(),
      discount_type: draft.discount_type,
      value: draft.value,
      currency: draft.discount_type === 'fixed' ? draft.currency : '',
      min_total: draft.min_total || null,
      max_uses: draft.max_uses ? Number(draft.max_uses) : null,
      once_per_customer: draft.once_per_customer,
      start_date: draft.start_date || null,
      end_date: draft.end_date || null,
      is_active: draft.is_active,
      tour_ids: draft.tour_ids,
    };
    setSaving(true);
    setFormError('');
    try {
      if (editing) await api.patch(`/coupons/${editing.id}/`, body);
      else await api.post('/coupons/', body);
      setDraft(null);
      setEditing(null);
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'No se pudo guardar el cupón.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setSaving(true);
    try {
      await api.delete(`/coupons/${toDelete.id}/`);
      setToDelete(null);
      load();
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo borrar el cupón.'));
      setToDelete(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Cupones</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Códigos de descuento para tus tours. El viajero los escribe al pagar en el portal y el descuento sale de tu precio.
          </p>
        </div>
        <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          <Icon name="plus" className="h-4 w-4" /> Nuevo cupón
        </button>
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
      ) : coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Icon name="tag" className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">Aún no tienes cupones</p>
          <p className="mt-1 text-sm text-slate-500">Crea uno para una promoción, tus seguidores o un grupo concreto.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Código</th>
                {admin && <th className="px-4 py-3">Empresa</th>}
                <th className="px-4 py-3">Descuento</th>
                <th className="px-4 py-3">Vale para</th>
                <th className="px-4 py-3">Vigencia</th>
                <th className="px-4 py-3">Usos</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => {
                const state = couponState(c);
                return (
                  <tr key={c.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-mono font-semibold text-slate-900">{c.code}</p>
                      {c.description && <p className="mt-0.5 text-xs text-slate-500">{c.description}</p>}
                    </td>
                    {admin && <td className="px-4 py-3 text-slate-600">{c.company_name}</td>}
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {discountLabel(c)}
                      {c.min_total && <p className="text-xs font-normal text-slate-500">desde {Number(c.min_total).toLocaleString()}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.tour_ids.length === 0 ? 'Todos tus tours' : c.tour_ids.map((id) => tourName.get(id) ?? `#${id}`).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.start_date || c.end_date ? `${fmtDate(c.start_date)} – ${fmtDate(c.end_date)}` : 'Sin fecha límite'}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">
                      {c.uses_count}{c.max_uses != null ? ` / ${c.max_uses}` : ''}
                      {c.once_per_customer && <p className="text-xs text-slate-500">1 por cliente</p>}
                    </td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${state.tone}`}>{state.label}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button type="button" onClick={() => openEdit(c)} aria-label={`Editar ${c.code}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                          <Icon name="pencil" className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setToDelete(c)} aria-label={`Borrar ${c.code}`} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600">
                          <Icon name="close" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!draft}
        onClose={close}
        dismissable={!saving}
        size="lg"
        title={editing ? `Editar ${editing.code}` : 'Nuevo cupón'}
        subtitle="El código no distingue mayúsculas. Solo vale en tus tours publicados."
        footer={(
          <>
            <button type="button" onClick={close} disabled={saving} className={modalBtnGhost}>Cancelar</button>
            <button type="submit" form="coupon-form" disabled={saving} className={modalBtnPrimary}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </>
        )}
      >
        {draft && (
          <form id="coupon-form" onSubmit={save} className="space-y-4">
            {admin && (
              <div>
                <label className={labelClass}>Empresa</label>
                <select value={draft.company_id} onChange={(e) => { set('company_id', e.target.value ? Number(e.target.value) : ''); set('tour_ids', []); }} className={fieldClass} required>
                  <option value="">Elige la empresa</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Código" value={draft.code} required maxLength={40} placeholder="VERANO10"
                onChange={(e) => set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))} className="font-mono" />
              <Input label="Descripción (opcional)" value={draft.description} maxLength={200} placeholder="Para quién o por qué"
                onChange={(e) => set('description', e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Tipo de descuento</label>
                <select value={draft.discount_type} onChange={(e) => set('discount_type', e.target.value as Draft['discount_type'])} className={fieldClass}>
                  <option value="percent">Porcentaje</option>
                  <option value="fixed">Importe fijo</option>
                </select>
              </div>
              <Input label={draft.discount_type === 'percent' ? 'Porcentaje (%)' : 'Importe'} type="number" min="0.01" step="0.01"
                max={draft.discount_type === 'percent' ? '99.99' : undefined} required value={draft.value} onChange={(e) => set('value', e.target.value)} />
              {draft.discount_type === 'fixed' && (
                <div>
                  <label className={labelClass}>Moneda</label>
                  <select value={draft.currency} onChange={(e) => set('currency', e.target.value)} className={fieldClass}>
                    <option value="USD">USD</option>
                    <option value="DOP">DOP</option>
                  </select>
                </div>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Desde (opcional)" type="date" value={draft.start_date} onChange={(e) => set('start_date', e.target.value)} />
              <Input label="Hasta (opcional)" type="date" value={draft.end_date} min={draft.start_date || undefined} onChange={(e) => set('end_date', e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Importe mínimo de la reserva (opcional)" type="number" min="0" step="0.01" value={draft.min_total} onChange={(e) => set('min_total', e.target.value)} />
              <Input label="Usos máximos (vacío = sin límite)" type="number" min="1" step="1" value={draft.max_uses} onChange={(e) => set('max_uses', e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>
                Tours {draft.tour_ids.length > 0 ? <span className="font-normal text-slate-400">· {draft.tour_ids.length}</span> : <span className="font-normal text-slate-400">· ninguno elegido = todos</span>}
              </label>
              {draftTours.length === 0 ? (
                <p className="text-sm text-slate-400">{admin && !draft.company_id ? 'Elige primero la empresa.' : 'No hay tours todavía: el cupón valdrá para todos los que publiques.'}</p>
              ) : (
                <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/60 p-2">
                  {draftTours.map((t) => {
                    const on = draft.tour_ids.includes(t.id);
                    return (
                      <button key={t.id} type="button" onClick={() => set('tour_ids', toggleId(draft.tour_ids, t.id))}
                        className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}>
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={draft.once_per_customer} onChange={(e) => set('once_per_customer', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                Una vez por cliente (por correo)
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={draft.is_active} onChange={(e) => set('is_active', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                Activo
              </label>
            </div>
            {formError && <p className="text-sm text-rose-600">{formError}</p>}
          </form>
        )}
      </Modal>

      <Modal
        open={!!toDelete}
        onClose={() => !saving && setToDelete(null)}
        size="sm"
        title={`¿Borrar ${toDelete?.code ?? ''}?`}
        footer={(
          <>
            <button type="button" onClick={() => setToDelete(null)} disabled={saving} className={modalBtnGhost}>Cancelar</button>
            <button type="button" onClick={remove} disabled={saving} className={modalBtnDanger}>Borrar</button>
          </>
        )}
      >
        <p className="text-sm text-slate-600">
          {toDelete && toDelete.bookings_count > 0
            ? 'Tiene reservas, así que se pausa en lugar de borrarse: deja de valer y el historial se conserva.'
            : 'El código deja de valer en el checkout. No afecta a ninguna reserva.'}
        </p>
      </Modal>
    </div>
  );
};

export default Coupons;
