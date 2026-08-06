import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import {
  listBookings, listPayments, listReviews,
  type Booking, type Payment, type Review, type BookingStatus,
} from '../services/resources';
import { listMyTours, listMyCityTours } from '../services/tours';
import { listItineraries } from '../services/itineraries';
import { listAccommodations } from '../services/accommodations';
import { listVehicles } from '../services/vehicles';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler,
);

// ─────────────────────────── constantes de estilo ───────────────────────────
const EMERALD = 'rgb(5, 150, 105)';
const EMERALD_SOFT = 'rgba(5, 150, 105, 0.14)';

const BOOKING_STATUS: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: 'Pendientes', color: '#f59e0b' },
  confirmed: { label: 'Confirmadas', color: '#059669' },
  completed: { label: 'Completadas', color: '#0f766e' },
  cancelled: { label: 'Canceladas', color: '#f43f5e' },
};

const PERIODS = [
  { key: '7d', label: '7 días', days: 7 },
  { key: '30d', label: '30 días', days: 30 },
  { key: '90d', label: '90 días', days: 90 },
  { key: '12m', label: '12 meses', days: 365 },
  { key: 'all', label: 'Todo', days: Infinity },
] as const;
type PeriodKey = (typeof PERIODS)[number]['key'];

// Animación de entrada (respeta prefers-reduced-motion).
const REVEAL_CSS = `
@keyframes dashReveal { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.dash-reveal { animation: dashReveal .5s cubic-bezier(.22,.61,.36,1) both; }
@media (prefers-reduced-motion: reduce) { .dash-reveal { animation: none; } }
`;

const gridOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { intersect: false, mode: 'index' as const } },
  scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(15,23,42,0.06)' }, ticks: { color: '#64748b', font: { size: 11 } } },
    x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
  },
} as const;

// ─────────────────────────── helpers ───────────────────────────
const num = (s: string | number | null | undefined) => Number(s) || 0;
const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
const moneyCompact = (n: number) =>
  n >= 1000 ? '$' + (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'K' : '$' + Math.round(n);

const startOf = (days: number) => {
  if (!isFinite(days)) return new Date(0);
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
};

const relTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'hace un momento';
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' });
};

// Cuenta ascendente animada para los KPI.
function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

// Genera buckets temporales continuos (día o mes) entre `from` y ahora.
function buildBuckets(from: Date, granularity: 'day' | 'month') {
  const buckets: { key: string; label: string }[] = [];
  const now = new Date();
  const cur = new Date(from);
  if (granularity === 'day') {
    cur.setHours(0, 0, 0, 0);
    while (cur <= now && buckets.length < 400) {
      buckets.push({
        key: cur.toISOString().slice(0, 10),
        label: cur.toLocaleDateString('es', { day: '2-digit', month: '2-digit' }),
      });
      cur.setDate(cur.getDate() + 1);
    }
  } else {
    cur.setDate(1); cur.setHours(0, 0, 0, 0);
    while (cur <= now && buckets.length < 60) {
      buckets.push({
        key: `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`,
        label: cur.toLocaleDateString('es', { month: 'short' }),
      });
      cur.setMonth(cur.getMonth() + 1);
    }
  }
  return buckets;
}
const bucketKey = (iso: string, granularity: 'day' | 'month') =>
  granularity === 'day' ? iso.slice(0, 10) : iso.slice(0, 7);

// ─────────────────────────── subcomponentes ───────────────────────────
function Sparkline({ data, color = EMERALD }: { data: number[]; color?: string }) {
  const id = useMemo(() => 'sp' + Math.random().toString(36).slice(2, 8), []);
  if (data.length < 2 || data.every((d) => d === 0)) return <div className="h-7" />;
  const w = 100, h = 28;
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d - min) / rng) * (h - 4) - 2}`);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-7 w-full">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts.join(' ')} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

interface Kpi {
  icon: string; label: string; target: number;
  format: (n: number) => string; trend: number | null; spark?: number[];
}

function KpiCard({ kpi, delay }: { kpi: Kpi; delay: number }) {
  const animated = useCountUp(kpi.target);
  const up = (kpi.trend ?? 0) >= 0;
  return (
    <div className="dash-reveal rounded-2xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Icon name={kpi.icon} className="h-5 w-5" />
        </span>
        {kpi.trend !== null && (
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
            up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
          }`}>
            {up ? '▲' : '▼'} {Math.abs(kpi.trend).toFixed(0)}%
          </span>
        )}
      </div>
      <div className="mt-3 text-2xl font-bold tabular-nums text-slate-900">{kpi.format(animated)}</div>
      <div className="text-xs text-slate-500">{kpi.label}</div>
      {kpi.spark && <div className="mt-2"><Sparkline data={kpi.spark} /></div>}
    </div>
  );
}

function Card({ title, action, children, className = '', delay = 0 }: {
  title: string; action?: React.ReactNode; children: React.ReactNode; className?: string; delay?: number;
}) {
  return (
    <div className={`dash-reveal rounded-2xl border border-slate-200 bg-white p-6 ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <div className="flex h-64 items-center justify-center text-center text-sm text-slate-400">{text}</div>;
}

// ─────────────────────────── Dashboard ───────────────────────────
const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [softError, setSoftError] = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [inventory, setInventory] = useState({ tours: 0, itineraries: 0, accommodations: 0, vehicles: 0 });

  const fetchAll = async (initial = false) => {
    if (initial) setLoading(true); else setRefreshing(true);
    const [b, p, r, mt, ct, it, ac, ve] = await Promise.allSettled([
      listBookings(), listPayments(), listReviews(),
      listMyTours(), listMyCityTours(), listItineraries(),
      listAccommodations({ mine: true }), listVehicles({ mine: true }),
    ]);
    const val = <T,>(res: PromiseSettledResult<T[]>): T[] => (res.status === 'fulfilled' ? res.value : []);
    setBookings(val(b)); setPayments(val(p)); setReviews(val(r));
    setInventory({
      tours: val(mt).length + val(ct).length,
      itineraries: val(it).length,
      accommodations: val(ac).length,
      vehicles: val(ve).length,
    });
    setSoftError(b.status === 'rejected' && p.status === 'rejected'
      ? 'No se pudieron cargar algunos datos. Reintenta en unos segundos.' : '');
    setUpdatedAt(new Date());
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { fetchAll(true); /* eslint-disable-next-line */ }, []);

  const cfg = PERIODS.find((p) => p.key === period)!;

  // ── Agregaciones (memoizadas por periodo/datos) ──
  const stats = useMemo(() => {
    const from = startOf(cfg.days);
    const prevFrom = startOf(isFinite(cfg.days) ? cfg.days * 2 : Infinity);
    const inCur = (iso: string) => new Date(iso) >= from;
    const inPrev = (iso: string) => new Date(iso) >= prevFrom && new Date(iso) < from;

    const paid = payments.filter((p) => p.status === 'paid');
    const revCur = paid.filter((p) => inCur(p.created_at)).reduce((s, p) => s + num(p.amount), 0);
    const revPrev = paid.filter((p) => inPrev(p.created_at)).reduce((s, p) => s + num(p.amount), 0);

    const bkCur = bookings.filter((b) => inCur(b.created_at));
    const bkPrev = bookings.filter((b) => inPrev(b.created_at));

    const paidCountCur = bkCur.filter((b) => b.is_paid).length;
    const travelersCur = bkCur.reduce((s, b) => s + (b.participants || 0), 0);
    const travelersPrev = bkPrev.reduce((s, b) => s + (b.participants || 0), 0);

    const revsCur = reviews.filter((r) => inCur(r.created_at));
    const avgRating = revsCur.length ? revsCur.reduce((s, r) => s + r.rating, 0) / revsCur.length : 0;
    const avgTicket = paidCountCur ? revCur / paidCountCur : 0;
    const done = bkCur.filter((b) => b.status === 'confirmed' || b.status === 'completed').length;
    const convRate = bkCur.length ? (done / bkCur.length) * 100 : 0;

    const pct = (cur: number, prev: number) => (prev === 0 ? (cur > 0 ? 100 : null) : ((cur - prev) / prev) * 100);

    // Series temporales
    const granularity: 'day' | 'month' = cfg.days <= 31 ? 'day' : 'month';
    let effFrom = from;
    if (!isFinite(cfg.days)) {
      const dates = [...bookings, ...paid].map((x) => +new Date(x.created_at)).filter(Boolean);
      effFrom = dates.length ? new Date(Math.min(...dates)) : startOf(365);
    }
    const buckets = buildBuckets(effFrom, granularity);
    const revByBucket = new Map(buckets.map((bk) => [bk.key, 0]));
    paid.forEach((p) => {
      const k = bucketKey(p.created_at, granularity);
      if (revByBucket.has(k)) revByBucket.set(k, (revByBucket.get(k) || 0) + num(p.amount));
    });
    const bkByBucket = new Map(buckets.map((bk) => [bk.key, 0]));
    bookings.forEach((b) => {
      const k = bucketKey(b.created_at, granularity);
      if (bkByBucket.has(k)) bkByBucket.set(k, (bkByBucket.get(k) || 0) + 1);
    });
    const revSeries = buckets.map((bk) => revByBucket.get(bk.key) || 0);
    const bkSeries = buckets.map((bk) => bkByBucket.get(bk.key) || 0);

    // Reservas por estado
    const statusCounts = (Object.keys(BOOKING_STATUS) as BookingStatus[])
      .map((s) => ({ status: s, count: bkCur.filter((b) => b.status === s).length }));

    // Top tours por ingresos (desde las reservas del periodo)
    const tourAgg = new Map<string, { count: number; revenue: number }>();
    bkCur.forEach((b) => {
      const name = b.tour?.name || b.company?.name || 'Sin asignar';
      const e = tourAgg.get(name) || { count: 0, revenue: 0 };
      e.count += 1; e.revenue += num(b.total_amount);
      tourAgg.set(name, e);
    });
    const topTours = [...tourAgg.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Distribución de valoraciones (1..5)
    const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
      star, count: revsCur.filter((r) => r.rating === star).length,
    }));

    return {
      revCur, revTrend: pct(revCur, revPrev),
      bookings: bkCur.length, bookingsTrend: pct(bkCur.length, bkPrev.length),
      travelers: travelersCur, travelersTrend: pct(travelersCur, travelersPrev),
      avgRating, avgTicket, convRate,
      labels: buckets.map((b) => b.label), revSeries, bkSeries,
      statusCounts, topTours, ratingDist,
      pendingBookings: bookings.filter((b) => b.status === 'pending').length,
      pendingReviews: reviews.filter((r) => r.status === 'pending').length,
    };
  }, [bookings, payments, reviews, cfg.days]);

  // ── Actividad reciente (real, fusionando eventos) ──
  const activity = useMemo(() => {
    type Ev = { date: string; icon: string; title: string; desc: string };
    const evs: Ev[] = [];
    bookings.forEach((b) => evs.push({
      date: b.created_at, icon: 'calendar', title: 'Nueva reserva',
      desc: `${b.tour?.name || 'Reserva'} · ${b.participants || 1} pers.`,
    }));
    payments.forEach((p) => evs.push({
      date: p.created_at, icon: 'credit-card',
      title: p.status === 'paid' ? 'Pago recibido' : `Pago ${p.status}`,
      desc: money(num(p.amount)),
    }));
    reviews.forEach((r) => evs.push({
      date: r.created_at, icon: 'star', title: 'Nueva reseña',
      desc: `${r.rating}★ ${r.tour?.name || ''}`.trim(),
    }));
    return evs.sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 7);
  }, [bookings, payments, reviews]);

  const kpis: Kpi[] = [
    { icon: 'money', label: 'Ingresos', target: stats.revCur, format: (n) => moneyCompact(n), trend: stats.revTrend, spark: stats.revSeries },
    { icon: 'calendar', label: 'Reservas', target: stats.bookings, format: (n) => String(Math.round(n)), trend: stats.bookingsTrend, spark: stats.bkSeries },
    { icon: 'users', label: 'Viajeros', target: stats.travelers, format: (n) => String(Math.round(n)), trend: stats.travelersTrend },
    { icon: 'ticket', label: 'Ticket promedio', target: stats.avgTicket, format: (n) => money(n), trend: null },
    { icon: 'star', label: 'Valoración media', target: stats.avgRating, format: (n) => n.toFixed(1) + ' / 5', trend: null },
    { icon: 'check-circle', label: 'Tasa de confirmación', target: stats.convRate, format: (n) => n.toFixed(0) + '%', trend: null },
  ];

  const inventoryStats = [
    { icon: 'van', label: 'Tours', value: inventory.tours, to: '/tours' },
    { icon: 'map', label: 'Itinerarios', value: inventory.itineraries, to: '/itineraries' },
    { icon: 'bed', label: 'Hospedajes', value: inventory.accommodations, to: '/hospedajes' },
    { icon: 'car', label: 'Vehículos', value: inventory.vehicles, to: '/rentacar' },
  ];

  const greeting = user?.first_name || user?.username || '';
  const hasBookings = bookings.length > 0;
  const hasRevenue = stats.revSeries.some((v) => v > 0);

  // ── Estado de carga ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
        </div>
      </div>
    );
  }

  const maxTourRev = Math.max(1, ...stats.topTours.map((tr) => tr.revenue));
  const maxRating = Math.max(1, ...stats.ratingDist.map((r) => r.count));
  const totalStatus = stats.statusCounts.reduce((s, x) => s + x.count, 0);

  return (
    <div className="space-y-6">
      <style>{REVEAL_CSS}</style>

      {/* Encabezado + filtros */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {greeting ? `Hola, ${greeting} 👋` : t('dashboard.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('dashboard.subtitle')}
            {updatedAt && <span className="ml-1 text-slate-400">· actualizado {relTime(updatedAt.toISOString())}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            {PERIODS.map((p) => (
              <button key={p.key} type="button" onClick={() => setPeriod(p.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  period === p.key ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}>
                {p.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => fetchAll()} disabled={refreshing} title="Actualizar"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50">
            <Icon name="compass" className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {softError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{softError}</div>
      )}

      {/* Acciones pendientes */}
      {(stats.pendingBookings > 0 || stats.pendingReviews > 0) && (
        <div className="flex flex-wrap gap-3">
          {stats.pendingBookings > 0 && (
            <Link to="/reservations" className="dash-reveal inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100">
              <Icon name="calendar" className="h-4 w-4" />
              {stats.pendingBookings} {stats.pendingBookings === 1 ? 'reserva pendiente' : 'reservas pendientes'} · gestionar
            </Link>
          )}
          {stats.pendingReviews > 0 && (
            <Link to="/reviews" className="dash-reveal inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-500 hover:bg-emerald-50">
              <Icon name="star" className="h-4 w-4 text-amber-400" />
              {stats.pendingReviews} {stats.pendingReviews === 1 ? 'reseña por moderar' : 'reseñas por moderar'} · revisar
            </Link>
          )}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k, i) => <KpiCard key={k.label} kpi={k} delay={i * 60} />)}
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Ingresos en el tiempo" className="lg:col-span-2" delay={80}
          action={<span className="text-sm font-semibold text-emerald-600">{money(stats.revCur)}</span>}>
          <div className="h-72">
            {hasRevenue ? (
              <Line data={{
                labels: stats.labels,
                datasets: [{
                  label: 'Ingresos', data: stats.revSeries,
                  borderColor: EMERALD, backgroundColor: EMERALD_SOFT,
                  tension: 0.4, fill: true, pointRadius: 0, pointHoverRadius: 5, pointBackgroundColor: EMERALD, borderWidth: 2,
                }],
              }} options={gridOpts} />
            ) : <EmptyHint text="Aún no hay ingresos registrados en este periodo." />}
          </div>
        </Card>

        <Card title="Reservas por estado" delay={140}>
          <div className="relative h-72">
            {totalStatus > 0 ? (
              <>
                <Doughnut data={{
                  labels: stats.statusCounts.map((s) => BOOKING_STATUS[s.status].label),
                  datasets: [{
                    data: stats.statusCounts.map((s) => s.count),
                    backgroundColor: stats.statusCounts.map((s) => BOOKING_STATUS[s.status].color),
                    borderWidth: 0,
                  }],
                }} options={{
                  responsive: true, maintainAspectRatio: false, cutout: '68%',
                  plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, color: '#475569', font: { size: 11 } } } },
                }} />
                <div className="pointer-events-none absolute inset-0 top-[-2.5rem] flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{totalStatus}</span>
                  <span className="text-xs text-slate-400">reservas</span>
                </div>
              </>
            ) : <EmptyHint text="Sin reservas en este periodo." />}
          </div>
        </Card>
      </div>

      {/* Segunda fila: reservas en el tiempo + top tours */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Volumen de reservas" className="lg:col-span-2" delay={80}>
          <div className="h-64">
            {hasBookings ? (
              <Bar data={{
                labels: stats.labels,
                datasets: [{ label: 'Reservas', data: stats.bkSeries, backgroundColor: EMERALD, borderRadius: 6, maxBarThickness: 34 }],
              }} options={gridOpts} />
            ) : <EmptyHint text="Aún no hay reservas para mostrar." />}
          </div>
        </Card>

        <Card title="Top tours por ingresos" delay={140}>
          {stats.topTours.length ? (
            <div className="space-y-3">
              {stats.topTours.map((tr, i) => (
                <div key={tr.name}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500">{i + 1}</span>
                      <span className="truncate text-slate-700">{tr.name}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-slate-900">{money(tr.revenue)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${(tr.revenue / maxTourRev) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyHint text="Sin datos de tours en este periodo." />}
        </Card>
      </div>

      {/* Tercera fila: valoraciones + actividad + inventario */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Distribución de valoraciones" delay={80}>
          {reviews.length ? (
            <div className="space-y-2.5">
              {stats.ratingDist.map((r) => (
                <div key={r.star} className="flex items-center gap-3">
                  <span className="flex w-10 shrink-0 items-center gap-1 text-sm text-slate-500">
                    {r.star} <Icon name="star" className="h-3.5 w-3.5 text-amber-400" />
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${(r.count / maxRating) * 100}%` }} />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs font-medium text-slate-500">{r.count}</span>
                </div>
              ))}
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="text-slate-500">Media global</span>
                <span className="font-semibold text-slate-900">{stats.avgRating.toFixed(1)} / 5</span>
              </div>
            </div>
          ) : <EmptyHint text="Aún no hay reseñas." />}
        </Card>

        <Card title={t('dashboard.recentActivity')} className="lg:col-span-2" delay={140}>
          {activity.length ? (
            <div className="divide-y divide-slate-100">
              {activity.map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Icon name={a.icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{a.title}</p>
                    <p className="truncate text-xs text-slate-500">{a.desc}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{relTime(a.date)}</span>
                </div>
              ))}
            </div>
          ) : <EmptyHint text="Sin actividad reciente." />}
        </Card>
      </div>

      {/* Inventario */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {inventoryStats.map((s, i) => (
          <Link key={s.label} to={s.to}
            className="dash-reveal flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-500 hover:bg-emerald-50/40"
            style={{ animationDelay: `${i * 60}ms` }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-emerald-600">
              <Icon name={s.icon} className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
