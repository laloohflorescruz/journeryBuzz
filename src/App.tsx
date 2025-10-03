import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProviderProfile from './pages/ProviderProfile';
import Hospedajes from './pages/Hospedajes';
import Tours from './pages/Tours';
import Itineraries from './pages/Itineraries';
import Reservations from './pages/Reservations';
import Payments from './pages/Payments';
import Reviews from './pages/Reviews';
import ReviewsByTours from './pages/ReviewsByTours';
import Participants from './pages/Participants';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/provider/:providerId" element={<ProviderProfile />} />
            <Route path="/hospedajes" element={<Hospedajes />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/reviews-by-tours" element={<ReviewsByTours />} />
            <Route path="/participants" element={<Participants />} />
            {/* Add more routes later */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
