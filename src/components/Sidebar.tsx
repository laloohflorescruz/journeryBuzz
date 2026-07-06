import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

interface NavItem { to: string; label: string; icon: string; end?: boolean }

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm transition-colors ${
    isActive
      ? 'border-emerald-400 bg-white/10 text-white'
      : 'border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
  }`;

const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  // Nota: Categorías y Actividades NO se gestionan en el panel del proveedor.
  const navItems: NavItem[] = [
    { to: '/', label: t('nav.dashboard'), icon: 'chart-bar', end: true },
    { to: '/hospedajes', label: t('nav.hospedajes'), icon: 'bed' },
    { to: '/tours', label: t('nav.tours'), icon: 'van' },
    { to: '/city-tours', label: 'Tours de ciudad', icon: 'city' },
    { to: '/itineraries', label: t('nav.itineraries'), icon: 'map' },
    { to: '/reservations', label: t('nav.reservations'), icon: 'calendar' },
    { to: '/payments', label: t('nav.payments'), icon: 'credit-card' },
    { to: '/reviews', label: t('nav.reviews'), icon: 'star' },
    { to: '/reviews-by-tours', label: t('nav.reviewsByTours'), icon: 'chart-pie' },
    { to: '/participants', label: t('nav.participants'), icon: 'users' },
  ];

  const role = (user?.role ?? user?.profile?.role ?? 'provider') as string;
  const initial = (user?.username?.[0] ?? 'B').toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-slate-300">
      {/* Marca */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Icon name="sparkles" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold leading-tight text-white">Backpacking Buzz</div>
          <div className="text-[11px] text-slate-400">{t('nav.providerPanel', 'Panel de proveedor')}</div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} className={itemClass} onClick={onNavigate}>
            <Icon name={it.icon} className="h-5 w-5 shrink-0" />
            <span className="truncate">{it.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Usuario */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">{user?.username ?? 'Usuario'}</div>
            <div className="truncate text-xs capitalize text-slate-400">{role}</div>
          </div>
          <button
            onClick={handleLogout}
            title={t('nav.logout')}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Icon name="logout" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
