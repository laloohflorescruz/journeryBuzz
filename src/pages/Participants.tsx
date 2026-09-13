import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon';
import Modal, { modalBtnGhost } from '../components/Modal';
import { listBookings, type Booking, type BookingStatus } from '../services/resources';
import DateFilterPanel from '../components/DateFilterPanel';
import {
  dayOf, matchesDateFilter, EMPTY_DATE_FILTER, type DateFilterValue,
} from '../lib/dateFilter';

// Participantes: quién viene, a qué y cuándo. Cada fila es una reserva real
// (antes esta pantalla mostraba siete personas inventadas), así que el
// participante trae consigo el servicio que solicitó, su importe y su pago.
//
// El aislamiento por empresa lo resuelve la API: un proveedor solo recibe las
// reservas de sus tours.

const PAGE_SIZE = 10;

const STATUS_STYLE: Record<BookingStatus, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-rose-50 text-rose-700',
  completed: 'bg-slate-100 text-slate-600',
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  confirmed: 'Confirmado',
  pending: 'Pendiente',
  cancelled: 'Cancelado',
  completed: 'Completado',
};

const STATUS_FILTERS: (BookingStatus | 'all')[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const fmtDate = (iso: string | null) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('es', { dateStyle: 'long' }) : 'Sin fecha';

const fmtDateTime = (iso: string) =>
  iso ? new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const money = (amount: string, currency: string) =>
  `${currency} ${Number(amount || 0).toLocaleString()}`;

function Participants() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BookingStatus | 'all'>('all');
  const [tourFilter, setTourFilter] = useState('all');
  const [dates, setDates] = useState<DateFilterValue>(EMPTY_DATE_FILTER);
  const [currentPage, setCurrentPage] = useState(1);
  const [detail, setDetail] = useState<Booking | null>(null);

  useEffect(() => {
    let active = true;
    listBookings()
      .then((data) => { if (active) { setBookings(data); setError(''); } })
      .catch(() => { if (active) setError('No se pudieron cargar los participantes.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const tours = useMemo(() => {
    const names = new Set<string>();
    bookings.forEach((b) => { if (b.tour?.name) names.add(b.tour.name); });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [bookings]);

  // Reservas por día del mes visible: alimenta los puntos del calendario.
  const countsByDay = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach((b) => {
      const day = dayOf(b.scheduled_date);
      if (day) map.set(day, (map.get(day) ?? 0) + 1);
    });
    return map;
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings
      .filter((b) => {
        const name = b.contact_name || b.customer_username || '';
        const matchSearch = !q
          || name.toLowerCase().includes(q)
          || (b.contact_email || '').toLowerCase().includes(q)
          || (b.contact_phone || '').toLowerCase().includes(q);
        const matchStatus = status === 'all' || b.status === status;
        const matchTour = tourFilter === 'all' || b.tour?.name === tourFilter;
        return matchSearch && matchStatus && matchTour
          && matchesDateFilter(b.scheduled_date, dates);
      })
      .sort((a, b) => (b.scheduled_date ?? '').localeCompare(a.scheduled_date ?? ''));
  }, [bookings, search, status, tourFilter, dates]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPeople = filtered.reduce((sum, b) => sum + (b.participants || 0), 0);
  const isFiltered = !!search.trim() || status !== 'all' || tourFilter !== 'all'
    || !!dates.day || !!dates.from || !!dates.to;

  const clearFilters = () => {
    setSearch(''); setStatus('all'); setTourFilter('all');
    setDates(EMPTY_DATE_FILTER); setCurrentPage(1);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
          <Icon name="users" className="h-6 w-6 text-emerald-600" /> Participantes
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {filtered.length} {filtered.length === 1 ? 'reserva' : 'reservas'}
          {isFiltered ? ' (filtradas)' : ' en total'} · {totalPeople} {totalPeople === 1 ? 'persona' : 'personas'}
        </p>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_1fr]">
        <DateFilterPanel
          value={dates}
          onChange={(v) => { setDates(v); setCurrentPage(1); }}
          countsByDay={countsByDay}
          noun={['reserva', 'reservas']}
        />

        {/* ── Listado ── */}
        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar participante por nombre, email o teléfono…"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
            <select value={tourFilter} onChange={(e) => { setTourFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-56">
              <option value="all">Todos los servicios</option>
              {tours.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((s) => (
              <button key={s} type="button" onClick={() => { setStatus(s); setCurrentPage(1); }}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  status === s ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 text-slate-600 hover:border-slate-400'
                }`}>
                {s === 'all' ? 'Todos' : STATUS_LABEL[s]}
              </button>
            ))}
            {isFiltered && (
              <button type="button" onClick={clearFilters}
                className="ml-auto text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline">
                Limpiar filtros
              </button>
            )}
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">Cargando participantes…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Icon name="users" className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {bookings.length === 0 ? 'Aún no hay participantes' : 'Ninguno coincide con el filtro'}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {bookings.length === 0
                  ? 'Los participantes salen de las reservas de tus servicios.'
                  : 'Prueba con otro término, otra fecha o cambia el estado.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Participante</th>
                      <th className="px-4 py-3">Servicio solicitado</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3 text-center">Personas</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginated.map((b) => {
                      const name = b.contact_name || b.customer_username || 'Sin nombre';
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold uppercase text-slate-600">
                                {name.charAt(0)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-800">{name}</p>
                                <p className="truncate text-xs text-slate-400">{b.contact_email || b.contact_phone || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{b.tour?.name || 'Servicio sin asignar'}</td>
                          <td className="px-4 py-3 text-slate-500">{fmtDate(b.scheduled_date)}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{b.participants || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[b.status]}`}>
                              {STATUS_LABEL[b.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button type="button" onClick={() => setDetail(b)}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-900 hover:bg-slate-50">
                              Ver detalle
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button type="button" onClick={() => setCurrentPage((p) => p - 1)} disabled={page === 1}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50 disabled:opacity-40">Anterior</button>
                  <span className="text-sm text-slate-500">Página {page} de {totalPages}</span>
                  <button type="button" onClick={() => setCurrentPage((p) => p + 1)} disabled={page === totalPages}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50 disabled:opacity-40">Siguiente</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Detalle de lo que solicitó el participante ── */}
      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail ? (detail.contact_name || detail.customer_username || 'Participante') : ''}
        subtitle={detail ? `Reserva #${detail.id} · ${fmtDate(detail.scheduled_date)}` : undefined}
        size="md"
        footer={<button type="button" onClick={() => setDetail(null)} className={modalBtnGhost}>Cerrar</button>}
      >
        {detail && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Servicio solicitado</p>
              <p className="mt-1 font-medium text-slate-900">{detail.tour?.name || 'Servicio sin asignar'}</p>
              {detail.tour?.duration && <p className="text-sm text-slate-500">Duración: {detail.tour.duration}</p>}
              {detail.company?.name && <p className="text-sm text-slate-500">Proveedor: {detail.company.name}</p>}
            </div>

            <dl className="space-y-3 text-sm">
              {[
                ['Estado', STATUS_LABEL[detail.status]],
                ['Fecha del servicio', fmtDate(detail.scheduled_date)],
                ['Personas', String(detail.participants || '—')],
                ['Importe', money(detail.total_amount, detail.currency)],
                ['Pago', detail.is_paid ? 'Pagado' : 'Pendiente de pago'],
                ['Email', detail.contact_email || '—'],
                ['Teléfono', detail.contact_phone || '—'],
                ['Reservado el', fmtDateTime(detail.created_at)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>

            {detail.notes && (
              <div className="border-t border-slate-100 pt-3">
                <p className="mb-1 text-sm text-slate-500">Notas del participante</p>
                <p className="text-sm text-slate-700">{detail.notes}</p>
              </div>
            )}

            {detail.payments.length > 0 && (
              <div className="border-t border-slate-100 pt-3">
                <p className="mb-2 text-sm text-slate-500">Pagos</p>
                <ul className="space-y-1.5">
                  {detail.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-600">{p.provider || 'Pasarela'} · {fmtDateTime(p.created_at)}</span>
                      <span className="font-medium text-slate-800">{money(p.amount, p.currency)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Participants;
