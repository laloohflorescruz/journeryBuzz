import React, { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import Icon from '../components/Icon';
import Modal, { modalBtnGhost, modalBtnPrimary } from '../components/Modal';
import { apiErrorMessage } from '../lib/apiError';
import { fmtDate } from '../lib/format';
import { fieldClass, labelClass } from '../lib/forms';
import { useAuth } from '../context/AuthContext';

// Solicitudes de los viajeros a la empresa (/service-requests/): reservas de
// hospedaje, mesas de restaurante y presupuestos de transporte. No cobran: el
// socio confirma o rechaza y el viajero recibe el resultado por correo junto
// con la respuesta que escriba aquí.

type Status = 'new' | 'contacted' | 'confirmed' | 'declined' | 'closed';
interface ServiceRequest {
  id: number;
  kind: 'stay' | 'restaurant' | 'transport';
  kind_label: string;
  company_name: string;
  accommodation_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  start_date: string | null;
  end_date: string | null;
  time: string;
  guests: number;
  service: string;
  message: string;
  status: Status;
  partner_note: string;
  created_at: string;
}

const STATUS: Record<Status, { label: string; tone: string }> = {
  new: { label: 'Nueva', tone: 'bg-amber-50 text-amber-700' },
  contacted: { label: 'Contactado', tone: 'bg-sky-50 text-sky-700' },
  confirmed: { label: 'Confirmada', tone: 'bg-emerald-50 text-emerald-700' },
  declined: { label: 'Rechazada', tone: 'bg-rose-50 text-rose-700' },
  closed: { label: 'Cerrada', tone: 'bg-slate-100 text-slate-600' },
};
const FILTERS: { value: '' | Status; label: string }[] = [
  { value: '', label: 'Todas' }, { value: 'new', label: 'Nuevas' }, { value: 'contacted', label: 'Contactado' },
  { value: 'confirmed', label: 'Confirmadas' }, { value: 'declined', label: 'Rechazadas' }, { value: 'closed', label: 'Cerradas' },
];

const when = (r: ServiceRequest) => {
  if (r.kind === 'stay') return `${fmtDate(r.start_date)} → ${fmtDate(r.end_date)}`;
  if (!r.start_date) return 'Sin fecha';
  return `${fmtDate(r.start_date)}${r.time ? ` · ${r.time}` : ''}`;
};

const ServiceRequests: React.FC = () => {
  const { isAdminOrAbove } = useAuth();
  const admin = isAdminOrAbove();
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [filter, setFilter] = useState<'' | Status>('new');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<ServiceRequest | null>(null);
  const [draft, setDraft] = useState<{ status: Status; partner_note: string }>({ status: 'new', partner_note: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/service-requests/', { params: filter ? { status: filter } : {} })
      .then(({ data }) => { setItems(Array.isArray(data) ? data : data?.results ?? []); setError(''); })
      .catch((err) => setError(apiErrorMessage(err, 'No se pudieron cargar las solicitudes.')))
      .finally(() => setLoading(false));
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const openRequest = (r: ServiceRequest) => { setOpen(r); setDraft({ status: r.status, partner_note: r.partner_note }); setSaveError(''); };

  const save = async () => {
    if (!open) return;
    setSaving(true); setSaveError('');
    try {
      await api.patch(`/service-requests/${open.id}/`, draft);
      setOpen(null);
      load();
    } catch (err) {
      setSaveError(apiErrorMessage(err, 'No se pudo guardar.'));
    } finally {
      setSaving(false);
    }
  };

  const notifies = open && draft.status !== open.status && (draft.status === 'confirmed' || draft.status === 'declined');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Solicitudes</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Reservas de hospedaje, mesas y presupuestos que los viajeros te envían desde el portal y la app. No se cobra nada:
          confírmalas o recházalas y le avisamos por correo con tu respuesta.
        </p>
      </div>

      <div role="group" aria-label="Estado" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f.value} type="button" aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}
            className={`rounded-full border px-3 py-1 text-sm font-medium ${filter === f.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-500'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Icon name="mail" className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">No hay solicitudes {filter ? 'con este estado' : 'todavía'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Viajero</th>
                <th className="px-4 py-3">Tipo</th>
                {admin && <th className="px-4 py-3">Empresa</th>}
                <th className="px-4 py-3">Cuándo</th>
                <th className="px-4 py-3">Personas</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Recibida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((r) => (
                <tr key={r.id} onClick={() => openRequest(r)} className="cursor-pointer align-top hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{r.contact_name}</p>
                    <p className="text-xs text-slate-500">{r.contact_email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.kind_label}
                    {(r.accommodation_name || r.service) && <p className="text-xs text-slate-500">{r.accommodation_name || r.service}</p>}
                  </td>
                  {admin && <td className="px-4 py-3 text-slate-600">{r.company_name || '—'}</td>}
                  <td className="px-4 py-3 text-slate-600">{when(r)}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{r.guests}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[r.status].tone}`}>{STATUS[r.status].label}</span></td>
                  <td className="px-4 py-3 text-slate-500">{fmtDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!open}
        onClose={() => !saving && setOpen(null)}
        dismissable={!saving}
        size="lg"
        title={open ? `${open.kind_label} · ${open.contact_name}` : ''}
        subtitle={open ? `Solicitud #${String(open.id).padStart(6, '0')} · recibida el ${fmtDate(open.created_at)}` : ''}
        footer={(
          <>
            <button type="button" onClick={() => setOpen(null)} disabled={saving} className={modalBtnGhost}>Cerrar</button>
            <button type="button" onClick={save} disabled={saving} className={modalBtnPrimary}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </>
        )}
      >
        {open && (
          <div className="space-y-4">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-slate-500">Cuándo</dt><dd className="font-medium text-slate-900">{when(open)}</dd></div>
              <div><dt className="text-xs text-slate-500">Personas</dt><dd className="font-medium text-slate-900">{open.guests}</dd></div>
              {(open.accommodation_name || open.service) && (
                <div><dt className="text-xs text-slate-500">{open.kind === 'stay' ? 'Hospedaje' : 'Servicio'}</dt><dd className="font-medium text-slate-900">{open.accommodation_name || open.service}</dd></div>
              )}
              <div>
                <dt className="text-xs text-slate-500">Contacto</dt>
                <dd className="font-medium text-slate-900">
                  <a href={`mailto:${open.contact_email}`} className="text-emerald-700 hover:underline">{open.contact_email}</a>
                  {open.contact_phone && <> · <a href={`tel:${open.contact_phone}`} className="text-emerald-700 hover:underline">{open.contact_phone}</a></>}
                </dd>
              </div>
            </dl>
            {open.message && (
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                <p className="mb-1 text-xs font-medium text-slate-500">Mensaje del viajero</p>
                <p className="whitespace-pre-line">{open.message}</p>
              </div>
            )}
            <div>
              <label className={labelClass}>Estado</label>
              <select value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as Status }))} className={fieldClass}>
                {(Object.keys(STATUS) as Status[]).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Respuesta al viajero (opcional)</label>
              <textarea value={draft.partner_note} rows={3} maxLength={2000} className={fieldClass}
                placeholder="Ej. Te esperamos el viernes a las 20:00. Mesa en la terraza."
                onChange={(e) => setDraft((d) => ({ ...d, partner_note: e.target.value }))} />
            </div>
            {notifies && (
              <p className="flex items-start gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800">
                <Icon name="mail" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Al guardar le enviaremos un correo a {open.contact_email} con el resultado{draft.partner_note.trim() ? ' y tu respuesta' : ''}.
              </p>
            )}
            {saveError && <p className="text-sm text-rose-600">{saveError}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ServiceRequests;
