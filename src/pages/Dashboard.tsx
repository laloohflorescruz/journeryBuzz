import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import cities from '../data/cities';
import destinations from '../data/destinations';
import pois from '../data/pois';
import Icon from '../components/Icon';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend
);

const EMERALD = 'rgb(5, 150, 105)';
const EMERALD_SOFT = 'rgba(5, 150, 105, 0.12)';
const DOUGHNUT_COLORS = ['#059669', '#0f766e', '#334155', '#64748b', '#94a3b8', '#cbd5e1'];

const gridOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(15,23,42,0.06)' }, ticks: { color: '#64748b' } },
    x: { grid: { display: false }, ticks: { color: '#64748b' } },
  },
} as const;

const Dashboard = () => {
  const { t } = useTranslation();

  const totalPOIs = pois.length;
  const totalDestinations = Object.keys(destinations).length;
  const totalUsers = cities.reduce((sum, city) => sum + city.population.total, 0);

  const categoryCounts: Record<string, number> = pois.reduce((acc, poi) => {
    acc[poi.category] = (acc[poi.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const categoryLabels = Object.keys(categoryCounts);
  const categoryData = Object.values(categoryCounts);

  // KPIs principales.
  const kpis: Array<{ icon: string; label: string; value: string; trend: string; up: boolean }> = [
    { icon: 'van', label: t('dashboard.totalTours'), value: '45', trend: '+12%', up: true },
    { icon: 'map', label: t('dashboard.totalItineraries'), value: String(totalDestinations), trend: '+8%', up: true },
    { icon: 'users', label: t('dashboard.totalUsers'), value: totalUsers.toLocaleString(), trend: '+15%', up: true },
    { icon: 'pin', label: t('dashboard.totalPOIs'), value: String(totalPOIs), trend: '+10%', up: true },
    { icon: 'ticket', label: t('dashboard.totalEvents'), value: '25', trend: '-5%', up: false },
    { icon: 'money', label: t('dashboard.revenue'), value: '€25K', trend: '+15%', up: true },
  ];

  const quickActions: Array<{ icon: string; label: string; to: string }> = [
    { icon: 'van', label: t('nav.tours'), to: '/tours' },
    { icon: 'calendar', label: t('nav.reservations'), to: '/reservations' },
    { icon: 'credit-card', label: t('nav.payments'), to: '/payments' },
    { icon: 'star', label: t('nav.reviews'), to: '/reviews' },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t('dashboard.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('dashboard.subtitle')}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Icon name={k.icon} className="h-5 w-5" />
              </span>
              <span className={`text-xs font-semibold ${k.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {k.up ? '↑' : '↓'} {k.trend.replace(/^[+-]/, '')}
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">{k.value}</div>
            <div className="text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">{t('dashboard.userGrowth')}</h3>
          <div className="h-64">
            <Line
              data={{
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                  label: t('dashboard.totalUsers'),
                  data: [200, 350, 500, 650, 800, 950],
                  borderColor: EMERALD,
                  backgroundColor: EMERALD_SOFT,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: EMERALD,
                }],
              }}
              options={gridOpts}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">{t('dashboard.revenueSummary')}</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [{
                  label: t('dashboard.revenue'),
                  data: [5000, 7000, 9000, 11000],
                  backgroundColor: EMERALD,
                  borderRadius: 6,
                  maxBarThickness: 40,
                }],
              }}
              options={gridOpts}
            />
          </div>
        </div>
      </div>

      {/* Distribución + actividad */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">{t('dashboard.poiDistribution')}</h3>
          <div className="h-64">
            <Doughnut
              data={{
                labels: categoryLabels,
                datasets: [{
                  data: categoryData,
                  backgroundColor: DOUGHNUT_COLORS,
                  borderWidth: 0,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '62%',
                plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, color: '#475569' } } },
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h3 className="mb-4 text-base font-semibold text-slate-900">{t('dashboard.recentActivity')}</h3>
          <div className="divide-y divide-slate-100">
            {[
              { icon: 'user-plus', title: t('dashboard.newUserRegistered'), desc: t('dashboard.john_joined'), time: t('dashboard.hoursAgo_2') },
              { icon: 'credit-card', title: t('dashboard.paymentReceived'), desc: t('dashboard.paymentConfirmed'), time: t('dashboard.hoursAgo_5') },
              { icon: 'pin', title: t('dashboard.newPOIAdded'), desc: t('dashboard.trail_added'), time: t('dashboard.hoursAgo_4') },
              { icon: 'map', title: t('dashboard.itineraryCreated'), desc: t('dashboard.hiking_published'), time: t('dashboard.dayAgo_1') },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Icon name={a.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{a.title}</p>
                  <p className="truncate text-xs text-slate-500">{a.desc}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-base font-semibold text-slate-900">{t('dashboard.quickActions')}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-emerald-500 hover:bg-emerald-50/50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-emerald-600">
                <Icon name={a.icon} className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-slate-800">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
