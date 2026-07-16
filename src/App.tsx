import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AnalyticsTracker from './components/AnalyticsTracker';
import Sidebar from './components/Sidebar';
import Icon from './components/Icon';
import Footer from './components/Footer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CityTours from './pages/CityTours';
import ProviderProfile from './pages/ProviderProfile';
import Hospedajes from './pages/Hospedajes';
import Tours from './pages/Tours';
import Itineraries from './pages/Itineraries';
import Reservations from './pages/Reservations';
import Payments from './pages/Payments';
import Reviews from './pages/Reviews';
import ReviewsByTours from './pages/ReviewsByTours';
import Participants from './pages/Participants';

function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { i18n } = useTranslation();
  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar fijo (escritorio) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar />
      </aside>

      {/* Drawer (móvil) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 shadow-xl">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Contenido */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Icon name="menu" className="h-6 w-6" />
          </button>
          <span className="text-sm font-semibold text-slate-900">Backpacking Buzz</span>
          <button
            onClick={toggleLanguage}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Icon name="globe" className="h-4 w-4" /> {i18n.language === 'es' ? 'ES' : 'EN'}
          </button>
        </header>

        <main className="p-4 md:p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnalyticsTracker />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected — superadmin required */}
          <Route
            path="/"
            element={
              <ProtectedRoute requireRole="superadmin">
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/:providerId"
            element={
              <ProtectedRoute requireRole="superadmin">
                <AppLayout><ProviderProfile /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospedajes"
            element={
              <ProtectedRoute requireRole="superadmin">
                <AppLayout><Hospedajes /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tours"
            element={
              <ProtectedRoute requireRole="superadmin">
                <AppLayout><Tours /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/city-tours"
            element={
              <ProtectedRoute>
                <AppLayout><CityTours /></AppLayout>
              </ProtectedRoute>
            }
          />
          {/* Ruta antigua unificada en /tours */}
          <Route path="/poi-tours" element={<Navigate to="/tours" replace />} />
          <Route
            path="/itineraries"
            element={
              <ProtectedRoute requireRole="superadmin">
                <AppLayout><Itineraries /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute requireRole="superadmin">
                <AppLayout><Reservations /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute requireRole="superadmin">
                <AppLayout><Payments /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute requireRole="superadmin">
                <AppLayout><Reviews /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews-by-tours"
            element={
              <ProtectedRoute requireRole="superadmin">
                <AppLayout><ReviewsByTours /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/participants"
            element={
              <ProtectedRoute requireRole="superadmin">
                <AppLayout><Participants /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
