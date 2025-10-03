import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Backpacking Buzz</h3>
            <p className="text-gray-300 mb-4">
              Manage your backpacking business with ease. Connect with travelers,
              handle reservations, and grow your services.
            </p>
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

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/hospedajes" className="text-gray-300 hover:text-white transition-colors">
                  Hospedajes
                </Link>
              </li>
              <li>
                <Link to="/tours" className="text-gray-300 hover:text-white transition-colors">
                  Tours
                </Link>
              </li>
              <li>
                <Link to="/itineraries" className="text-gray-300 hover:text-white transition-colors">
                  Itineraries
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="text-gray-300 hover:text-white transition-colors">
                  Reservations
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/payments" className="text-gray-300 hover:text-white transition-colors">
                  Payments
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-gray-300 hover:text-white transition-colors">
                  Reviews
                </Link>
              </li>
              <li>
                <Link to="/participants" className="text-gray-300 hover:text-white transition-colors">
                  Participants
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2024 Backpacking Buzz. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-300 text-sm">Hecho con ❤️ para proveedores</span>
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
