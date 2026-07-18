import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import {
  listBookings, confirmBooking, cancelBooking,
  type Booking, type BookingStatus,
} from '../services/resources';

const PAGE_SIZE = 8;

// Mismo lenguaje visual que Tours/POIs: badge sobrio por estado.
const STATUS_STYLE: Record<BookingStatus, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-sky-50 text-sky-700',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-rose-50 text-rose-700',
};

const STATUS_FILTERS: (BookingStatus | 'all')[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const money = (amount: string, currency: string) =>
  `${currency} ${Number(amount).toLocaleString()}`;

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es', { dateStyle: 'medium' }) : '—';

function Reservations() {
  const { t } = useTranslation();
  // Espejo de lo que exige la API: confirmar y cancelar la reserva de otro
  // requieren booking:update (el cliente puede cancelar la suya, pero eso no
  // ocurre en este panel). Sin el permiso el botón daría 403, así que se oculta.
  const { can } = useAuth();
  const canConfirm = can('booking:update');
  const canCancel = can('booking:update');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listBookings()
      .then((data) => { if (active) { setBookings(data); setError(null); } })
      .catch(() => { if (active) setError(t('common.loadError', 'No se pudieron cargar los datos.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [t]);

  const statusLabel = (status: string) => t(`common.${status}`, status);

  // Confirmar/cancelar reemplazan la fila con la reserva que devuelve la API,
  // así el estado mostrado siempre es el del servidor.
  const runAction = async (id: number, action: (id: number) => Promise<Booking>) => {
    setActionId(id);
    setActionError(null);
    try {
      const updated = await action(id);
      setBookings((list) => list.map((b) => (b.id === id ? updated : b)));
      setSelected((s) => (s && s.id === id ? updated : s));
    } catch {
      setActionError('No se pudo actualizar la reserva. Puede que no tengas permiso para esta acción.');
    } finally {
      setActionId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      (b.customer_username ?? '').toLowerCase().includes(q) ||
      b.contact_name.toLowerCase().includes(q) ||
      b.contact_email.toLowerCase().includes(q) ||
      (b.tour?.name ?? '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltered = statusFilter !== 'all' || search.trim() !== '';

  return (
    <div className="mx-auto max-w-6xl">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
          <Icon name="calendar" className="h-6 w-6 text-emerald-600" /> {t('reservations.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {filtered.length} {filtered.length === 1 ? 'reserva' : 'reservas'}
          {isFiltered ? ' (filtradas)' : ' en total'}
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por cliente, email o tour…"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              {s === 'all' ? t('common.all') : statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          {t('common.loading', 'Cargando…')}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon name="calendar" className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {bookings.length === 0 ? 'Aún no hay reservas' : 'Ninguna reserva coincide con el filtro'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{t('reservations.subtitle')}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t('reservations.customer')}</th>
                  <th className="px-4 py-3">{t('reservations.tourItinerary')}</th>
                  <th className="px-4 py-3">{t('common.date')}</th>
                  <th className="px-4 py-3 text-center">{t('reservations.participants')}</th>
                  <th className="px-4 py-3">{t('reservations.price')}</th>
                  <th className="px-4 py-3">{t('common.status')}</th>
                  <th className="px-4 py-3 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((b) => {
                  const name = b.customer_username || b.contact_name || '—';
                  const busy = actionId === b.id;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                            {name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800">{name}</p>
                            {b.contact_email && <p className="truncate text-xs text-slate-400">{b.contact_email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{b.tour?.name || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{fmtDate(b.scheduled_date)}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{b.participants}</td>
                      <td className="px-4 py-3">
                        <span className="text-slate-700">{money(b.total_amount, b.currency)}</span>
                        {b.is_paid && (
                          <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Pagada</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[b.status]}`}>
                          {statusLabel(b.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                          {b.status === 'pending' && canConfirm && (
                            <button
                              type="button" disabled={busy}
                              onClick={() => runAction(b.id, confirmBooking)}
                              className="rounded-lg border border-emerald-300 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-40"
                            >
                              Confirmar
                            </button>
                          )}
                          {b.status !== 'cancelled' && b.status !== 'completed' && canCancel && (
                            <button
                              type="button" disabled={busy}
                              onClick={() => runAction(b.id, cancelBooking)}
                              className="rounded-lg px-2.5 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-40"
                            >
                              {t('common.cancel')}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelected(b)}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            title={t('common.viewDetails')}
                          >
                            <Icon name="search" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button" onClick={() => setCurrentPage((p) => p - 1)} disabled={page === 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent"
              >
                {t('common.previous')}
              </button>
              <span className="text-sm text-slate-500">{t('common.pageOf', { current: page, total: totalPages })}</span>
              <button
                type="button" onClick={() => setCurrentPage((p) => p + 1)} disabled={page === totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Detalle */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-900">{t('reservations.details')}</h3>
              <button
                type="button" onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
            <dl className="space-y-3 px-5 py-4 text-sm">
              {[
                [t('reservations.customer'), selected.customer_username || selected.contact_name || '—'],
                [t('reservations.tourItinerary'), selected.tour?.name || '—'],
                [t('common.date'), fmtDate(selected.scheduled_date)],
                [t('reservations.participants'), String(selected.participants)],
                [t('reservations.price'), money(selected.total_amount, selected.currency)],
                [t('reservations.contactEmail'), selected.contact_email || '—'],
                [t('reservations.contactPhone'), selected.contact_phone || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right font-medium text-slate-800">{value}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">{t('common.status')}</dt>
                <dd>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[selected.status]}`}>
                    {statusLabel(selected.status)}
                  </span>
                </dd>
              </div>
              {selected.notes && (
                <div className="border-t border-slate-100 pt-3">
                  <dt className="mb-1 text-slate-500">Notas</dt>
                  <dd className="text-slate-700">{selected.notes}</dd>
                </div>
              )}
            </dl>
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
              <button
                type="button" onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reservations;
