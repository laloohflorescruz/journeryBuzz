import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const ROLE_BADGE: Record<string, string> = {
  superadmin: 'bg-red-500',
  admin: 'bg-orange-500',
  provider: 'bg-green-500',
  customer: 'bg-gray-500',
};

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: '📊' },
    { path: '/categories', label: t('nav.categories'), icon: '🏷️' },
    { path: '/activities', label: t('nav.activities'), icon: '🎯' },
    { path: '/hospedajes', label: t('nav.hospedajes'), icon: '🏨' },
    { path: '/tours', label: t('nav.tours'), icon: '🚐' },
    { path: '/itineraries', label: t('nav.itineraries'), icon: '🗺️' },
    { path: '/reservations', label: t('nav.reservations'), icon: '📅' },
    { path: '/payments', label: t('nav.payments'), icon: '💳' },
    { path: '/reviews', label: t('nav.reviews'), icon: '⭐' },
    { path: '/reviews-by-tours', label: t('nav.reviewsByTours'), icon: '📊' },
    { path: '/participants', label: t('nav.participants'), icon: '👥' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es');
  };

  const role = user?.role ?? user?.profile?.role ?? 'customer';
  const badgeClass = ROLE_BADGE[role] ?? 'bg-gray-500';

  return (
    <header className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold shrink-0">Backpacking Buzz</h1>

        <nav className="hidden md:flex space-x-1 mx-4 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-2 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
                location.pathname === item.path
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-3 shrink-0">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm rounded-lg transition-colors font-medium"
            title={t('common.language')}
          >
            🌐 {i18n.language === 'es' ? 'ES' : 'EN'}
          </button>
          {user && (
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-sm font-semibold">{user.username}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${badgeClass}`}>
                  {role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white text-sm rounded-lg transition-colors"
              >
                {t('nav.logout')}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-blue-500">
          <nav className="flex flex-col space-y-1 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-blue-500 flex items-center justify-between px-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm rounded-lg transition-colors font-medium"
            >
              🌐 {i18n.language === 'es' ? 'ES' : 'EN'}
            </button>
            {user && (
              <>
                <div>
                  <div className="text-sm font-semibold">{user.username}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full text-white ${badgeClass}`}>{role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white text-sm rounded-lg transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
