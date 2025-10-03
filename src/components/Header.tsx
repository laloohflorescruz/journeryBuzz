import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/hospedajes', label: 'Hospedajes', icon: '🏨' },
    { path: '/tours', label: 'Tours', icon: '🚐' },
    { path: '/itineraries', label: 'Itineraries', icon: '🗺️' },
    { path: '/reservations', label: 'Reservations', icon: '📅' },
    { path: '/payments', label: 'Payments', icon: '💳' },
    { path: '/reviews', label: 'Reviews', icon: '⭐' },
    { path: '/reviews-by-tours', label: 'Reviews by Tours', icon: '📊' },
    { path: '/participants', label: 'Participants', icon: '👥' },
  ];

  return (
    <header className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Backpacking Buzz</h1>
        <nav className="hidden md:flex space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
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
        </div>
      )}
    </header>
  );
}

export default Header;
