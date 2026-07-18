import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { listPayments, refundPayment, type Payment, type PaymentStatus } from '../services/resources';

const PAGE_SIZE = 8;

// Mismo lenguaje visual que Tours/POIs: badge sobrio por estado.
const STATUS_STYLE: Record<PaymentStatus, string> = {
  paid: 'bg-emerald-50 text-emerald-700',
  processing: 'bg-sky-50 text-sky-700',
  pending: 'bg-amber-50 text-amber-700',
  failed: 'bg-rose-50 text-rose-700',
  refunded: 'bg-slate-100 text-slate-600',
};

const STATUS_FILTERS: (PaymentStatus | 'all')[] = ['all', 'paid', 'pending', 'processing', 'failed', 'refunded'];

const money = (amount: string, currency: string) =>
  `${currency} ${Number(amount).toLocaleString()}`;

const fmtDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('es', { dateStyle: 'medium' }) : '—';

function Payments() {
  const { t } = useTranslation();
  // El reembolso exige payment:refund en la API; sin él el botón daría 403.
  const { can } = useAuth();
  const canRefund = can('payment:refund');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Payment | null>(null);
  // Reembolso: pago a confirmar, monto (vacío = total) y estado de la operación.
  const [refunding, setRefunding] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundBusy, setRefundBusy] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listPayments()
      .then((data) => { if (active) { setPayments(data); setError(null); } })
      .catch(() => { if (active) setError(t('common.loadError', 'No se pudieron cargar los datos.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [t]);

  const statusLabel = (status: string) => t(`common.${status}`, status);
  const referenceOf = (p: Payment) => p.gateway_reference || p.gateway_session_id || '—';

  const openRefund = (p: Payment) => {
    setRefunding(p);
    setRefundAmount('');   // vacío = reembolso total
    setRefundError(null);
  };

  // El pago solo se marca como reembolsado si la API confirma success; un
  // rechazo de la pasarela llega como 400 y deja el estado intacto.
  const doRefund = async () => {
    if (!refunding) return;
    setRefundBusy(true);
    setRefundError(null);
    try {
      const res = await refundPayment(refunding.id, refundAmount.trim() || undefined);
      if (!res.success) {
        setRefundError('La pasarela rechazó el reembolso. El pago no se modificó.');
        return;
      }
      setPayments((list) => list.map((p) => (p.id === refunding.id ? { ...p, status: res.status } : p)));
      setSelected((s) => (s && s.id === refunding.id ? { ...s, status: res.status } : s));
      setRefunding(null);
    } catch (err) {
      const e = err as { response?: { status?: number; data?: { error?: string } } };
      const code = e.response?.status;
      setRefundError(
        code === 503 ? 'La pasarela de pago no está configurada; no se puede reembolsar.'
        : code === 403 ? 'No tienes permiso para reembolsar pagos.'
        : e.response?.data?.error || 'No se pudo reembolsar el pago.',
      );
    } finally {
      setRefundBusy(false);
    }
  };

  const filtered = payments.filter((p) => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      String(p.booking).includes(q) ||
      p.provider.toLowerCase().includes(q) ||
      referenceOf(p).toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltered = statusFilter !== 'all' || search.trim() !== '';

  // Total cobrado (solo pagos en estado 'paid'), agrupado por moneda.
  const totalsByCurrency = filtered
    .filter((p) => p.status === 'paid')
    .reduce<Record<string, number>>((acc, p) => {
      acc[p.currency] = (acc[p.currency] ?? 0) + Number(p.amount);
      return acc;
    }, {});

  return (
    <div className="mx-auto max-w-5xl">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
          <Icon name="credit-card" className="h-6 w-6 text-emerald-600" /> {t('payments.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {filtered.length} {filtered.length === 1 ? 'pago' : 'pagos'}
          {isFiltered ? ' (filtrados)' : ' en total'}
          {Object.keys(totalsByCurrency).length > 0 && (
            <> · cobrado: {Object.entries(totalsByCurrency).map(([c, v]) => `${c} ${v.toLocaleString()}`).join(' · ')}</>
          )}
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por reserva, método o referencia…"
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

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          {t('common.loading', 'Cargando…')}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon name="credit-card" className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {payments.length === 0 ? 'Aún no hay pagos' : 'Ningún pago coincide con el filtro'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{t('payments.subtitle')}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t('payments.booking')}</th>
                  <th className="px-4 py-3">{t('payments.amount')}</th>
                  <th className="px-4 py-3">{t('common.date')}</th>
                  <th className="px-4 py-3">{t('payments.method')}</th>
                  <th className="px-4 py-3">{t('common.status')}</th>
                  <th className="px-4 py-3">{t('payments.reference')}</th>
                  <th className="px-4 py-3 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-800">#{p.booking}</td>
                    <td className="px-4 py-3 text-slate-700">{money(p.amount, p.currency)}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(p.created_at)}</td>
                    <td className="px-4 py-3 capitalize text-slate-600">{p.provider || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[p.status]}`}>
                        {statusLabel(p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-500">{referenceOf(p)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        {/* Solo un pago cobrado puede reembolsarse, y solo con permiso. */}
                        {p.status === 'paid' && canRefund && (
                          <button
                            type="button"
                            onClick={() => openRefund(p)}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                          >
                            Reembolsar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelected(p)}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          title={t('common.viewDetails')}
                        >
                          <Icon name="search" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Confirmación de reembolso — acción irreversible que mueve dinero real. */}
      {refunding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-900">Reembolsar pago</h3>
              <p className="mt-1 text-sm text-slate-500">
                Reserva #{refunding.booking} · {money(refunding.amount, refunding.currency)}
              </p>
            </div>

            <div className="px-5 py-4">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Monto a reembolsar <span className="font-normal text-slate-400">(vacío = total)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{refunding.currency}</span>
                <input
                  type="number" min="0" step="0.01" max={refunding.amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={refunding.amount}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Puedes reembolsar un importe parcial. Esta acción no se puede deshacer.
              </p>
              {refundError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{refundError}</div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
              <button
                type="button" disabled={refundBusy} onClick={() => setRefunding(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button" disabled={refundBusy} onClick={doRefund}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                {refundBusy ? 'Reembolsando…' : 'Confirmar reembolso'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detalle */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-900">{t('payments.details')}</h3>
              <button
                type="button" onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
            <dl className="space-y-3 px-5 py-4 text-sm">
              {[
                [t('payments.booking'), `#${selected.booking}`],
                [t('payments.amount'), money(selected.amount, selected.currency)],
                [t('common.date'), fmtDate(selected.created_at)],
                [t('payments.method'), selected.provider || '—'],
                [t('payments.reference'), referenceOf(selected)],
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

export default Payments;
