import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { listReviews, moderateReview, type Review, type ReviewStatus } from '../services/resources';

const PAGE_SIZE = 8;

// Mismo lenguaje visual que Tours/POIs: badge sobrio por estado.
const STATUS_STYLE: Record<ReviewStatus, string> = {
  approved: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  rejected: 'bg-rose-50 text-rose-700',
};

const STATUS_FILTERS: (ReviewStatus | 'all')[] = ['all', 'pending', 'approved', 'rejected'];

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es', { dateStyle: 'medium' }) : '—';

// Estrellas sobrias (sin emojis) sobre 5.
const Stars = ({ rating }: { rating: number }) => (
  <span className="inline-flex items-center gap-0.5" title={`${rating}/5`}>
    {Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="star"
        className={`h-3.5 w-3.5 ${i < rating ? 'text-amber-400' : 'text-slate-200'}`}
      />
    ))}
  </span>
);

function Reviews() {
  const { t } = useTranslation();
  // Moderar exige review:moderate en la API; sin él los botones darían 403.
  const { can } = useAuth();
  const canModerate = can('review:moderate');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
  const [selectedTour, setSelectedTour] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listReviews()
      .then((data) => { if (active) { setReviews(data); setError(null); } })
      .catch(() => { if (active) setError(t('common.loadError', 'No se pudieron cargar los datos.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [t]);

  const statusLabel = (status: string) => t(`common.${status}`, status);
  const tourOf = (r: Review) => r.tour?.name || r.company?.name || '—';

  // Moderar reemplaza la fila con la reseña que devuelve la API, así el estado
  // mostrado siempre es el del servidor.
  const moderate = async (id: number, decision: 'approved' | 'rejected') => {
    setActionId(id);
    setActionError(null);
    try {
      const updated = await moderateReview(id, decision);
      setReviews((list) => list.map((r) => (r.id === id ? updated : r)));
    } catch {
      setActionError('No se pudo moderar la reseña. Puede que no tengas permiso para esta acción.');
    } finally {
      setActionId(null);
    }
  };

  const tourNames = ['All', ...Array.from(new Set(reviews.map(tourOf)))];

  const filtered = reviews.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchTour = selectedTour === 'All' || tourOf(r) === selectedTour;
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      (r.author_username ?? '').toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q);
    return matchStatus && matchTour && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltered = statusFilter !== 'all' || selectedTour !== 'All' || search.trim() !== '';
  const pendingCount = reviews.filter((r) => r.status === 'pending').length;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
          <Icon name="star" className="h-6 w-6 text-emerald-600" /> {t('reviews.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {filtered.length} {filtered.length === 1 ? 'reseña' : 'reseñas'}
          {isFiltered ? ' (filtradas)' : ' en total'}
        </p>
      </div>

      {/* Atajo: reseñas esperando moderación */}
      {pendingCount > 0 && statusFilter !== 'pending' && (
        <button
          type="button"
          onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
          className="mb-4 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100"
        >
          {pendingCount} {pendingCount === 1 ? 'reseña pendiente' : 'reseñas pendientes'} de moderación · ver
        </button>
      )}

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar por autor o comentario…"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <select
            value={selectedTour}
            onChange={(e) => { setSelectedTour(e.target.value); setCurrentPage(1); }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-64"
          >
            {tourNames.map((tour) => (
              <option key={tour} value={tour}>{tour === 'All' ? t('common.all') : tour}</option>
            ))}
          </select>
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
            <Icon name="star" className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {reviews.length === 0 ? 'Aún no hay reseñas' : 'Ninguna reseña coincide con el filtro'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{t('reviews.subtitle')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map((r) => {
              const busy = actionId === r.id;
              const author = r.author_username || '—';
              return (
                <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {author.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800">{author}</p>
                        <p className="truncate text-xs text-slate-400">{tourOf(r)} · {fmtDate(r.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stars rating={r.rating} />
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[r.status]}`}>
                        {statusLabel(r.status)}
                      </span>
                    </div>
                  </div>

                  {r.title && <p className="mt-3 font-medium text-slate-800">{r.title}</p>}
                  {r.comment && <p className="mt-1 text-sm leading-relaxed text-slate-600">{r.comment}</p>}

                  {/* Moderación: acción que la API ya exponía y la UI no usaba. */}
                  {canModerate && (
                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    {r.status !== 'approved' && (
                      <button
                        type="button" disabled={busy}
                        onClick={() => moderate(r.id, 'approved')}
                        className="rounded-lg border border-emerald-300 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-40"
                      >
                        Aprobar
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button
                        type="button" disabled={busy}
                        onClick={() => moderate(r.id, 'rejected')}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-40"
                      >
                        Rechazar
                      </button>
                    )}
                  </div>
                  )}
                </article>
              );
            })}
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
    </div>
  );
}

export default Reviews;
