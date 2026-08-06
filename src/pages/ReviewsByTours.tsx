import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import { listReviews, type Review, type ReviewStatus } from '../services/resources';

const GROUPS_PER_PAGE = 4;

// Mismo lenguaje visual que Reviews/Tours/POIs: badge sobrio por estado.
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
        className={`h-3.5 w-3.5 ${i < Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`}
      />
    ))}
  </span>
);

interface TourGroup {
  name: string;
  reviews: Review[];
  average: number;
}

function ReviewsByTours() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
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

  // Reseñas que pasan los filtros de texto/estado antes de agrupar por tour.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((r) => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchSearch = !q ||
        (r.author_username ?? '').toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        tourOf(r).toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [reviews, search, statusFilter]);

  // Agrupa por tour y ordena por número de reseñas (los tours con más actividad primero).
  const groups = useMemo<TourGroup[]>(() => {
    const map = new Map<string, Review[]>();
    for (const r of filtered) {
      const key = tourOf(r);
      const bucket = map.get(key);
      if (bucket) bucket.push(r);
      else map.set(key, [r]);
    }
    return Array.from(map.entries())
      .map(([name, list]) => ({
        name,
        reviews: list,
        average: list.reduce((sum, r) => sum + r.rating, 0) / list.length,
      }))
      .sort((a, b) => b.reviews.length - a.reviews.length);
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(groups.length / GROUPS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginated = groups.slice((page - 1) * GROUPS_PER_PAGE, page * GROUPS_PER_PAGE);
  const isFiltered = statusFilter !== 'all' || search.trim() !== '';

  return (
    <div className="mx-auto max-w-5xl">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
          <Icon name="chart-pie" className="h-6 w-6 text-emerald-600" /> {t('nav.reviewsByTours')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {groups.length} {groups.length === 1 ? 'tour' : 'tours'} · {filtered.length}{' '}
          {filtered.length === 1 ? 'reseña' : 'reseñas'}
          {isFiltered ? ' (filtradas)' : ''}
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por tour, autor o comentario…"
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
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon name="chart-pie" className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {reviews.length === 0 ? 'Aún no hay reseñas' : 'Ningún tour coincide con el filtro'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{t('reviews.subtitle')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginated.map((group) => (
              <section key={group.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {/* Cabecera del tour con promedio agregado */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-slate-900">{group.name}</h2>
                    <p className="text-xs text-slate-400">
                      {group.reviews.length} {group.reviews.length === 1 ? 'reseña' : 'reseñas'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stars rating={group.average} />
                    <span className="text-sm font-semibold text-slate-700">{group.average.toFixed(1)}</span>
                  </div>
                </div>

                {/* Reseñas del tour */}
                <div className="divide-y divide-slate-100">
                  {group.reviews.map((r) => {
                    const author = r.author_username || '—';
                    return (
                      <article key={r.id} className="px-4 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                              {author.charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800">{author}</p>
                              <p className="truncate text-xs text-slate-400">{fmtDate(r.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Stars rating={r.rating} />
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[r.status]}`}>
                              {statusLabel(r.status)}
                            </span>
                          </div>
                        </div>

                        {r.title && <p className="mt-2 font-medium text-slate-800">{r.title}</p>}
                        {r.comment && <p className="mt-1 text-sm leading-relaxed text-slate-600">{r.comment}</p>}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
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

export default ReviewsByTours;
