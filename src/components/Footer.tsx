import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Backpacking Buzz</h3>
            <p className="text-gray-300 mb-4">{t('footer.description')}</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="text-xl">📘</span>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="text-xl">🐦</span>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="text-xl">📷</span>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="text-xl">💼</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.dashboard')}
                </Link>
              </li>
              <li>
                <Link to="/hospedajes" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.hospedajes')}
                </Link>
              </li>
              <li>
                <Link to="/tours" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.tours')}
                </Link>
              </li>
              <li>
                <Link to="/itineraries" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.itineraries')}
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.reservations')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/payments" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.payments')}
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.reviews')}
                </Link>
              </li>
              <li>
                <Link to="/participants" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.participants')}
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.helpCenter')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2024 Backpacking Buzz. {t('footer.rights')}
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-300 text-sm">{t('footer.madeWith')}</span>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-yellow-400">⭐</span>
              <span className="text-yellow-400">⭐</span>
              <span className="text-yellow-400">⭐</span>
              <span className="text-yellow-400">⭐</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
