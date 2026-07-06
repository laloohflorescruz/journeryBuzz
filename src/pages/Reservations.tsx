import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listBookings, type Booking } from '../services/resources';

interface Reservation {
  id: number;
  customerName: string;
  tourName: string;
  date: string;
  participants: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  price: number;
  currency: string;
  contactEmail: string;
  contactPhone: string;
}

function toReservation(b: Booking): Reservation {
  return {
    id: b.id,
    customerName: b.customer_username || b.contact_name || '—',
    tourName: b.tour?.name || '—',
    date: b.scheduled_date || '—',
    participants: b.participants,
    status: b.status,
    price: Number(b.total_amount),
    currency: b.currency,
    contactEmail: b.contact_email,
    contactPhone: b.contact_phone,
  };
}

const money = (amount: number, currency: string) => `${currency} ${amount.toLocaleString()}`;

function Reservations() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    let active = true;
    setLoading(true);
    listBookings()
      .then((data) => { if (active) { setReservations(data.map(toReservation)); setError(null); } })
      .catch(() => { if (active) setError(t('common.loadError', 'No se pudieron cargar los datos.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [t]);

  const totalPages = Math.ceil(reservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReservations = reservations.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
      else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const getStatusLabel = (status: string) => {
    if (status === 'confirmed') return t('common.confirmed');
    if (status === 'pending') return t('common.pending');
    if (status === 'cancelled') return t('common.cancelled');
    if (status === 'completed') return t('common.completed');
    return status;
  };

  const statusClass = (status: string) =>
    status === 'confirmed' || status === 'completed' ? 'bg-green-200 text-green-800' :
    status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
    'bg-red-200 text-red-800';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-yellow-50">
      <div className="bg-gradient-to-r from-green-600 via-lime-600 to-yellow-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">📅 {t('reservations.title')}</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">{t('reservations.subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {loading && <p className="text-center text-gray-500 py-10">{t('common.loading', 'Cargando...')}</p>}
        {error && <p className="text-center text-red-600 py-10">{error}</p>}
        {!loading && !error && reservations.length === 0 && (
          <p className="text-center text-gray-500 py-10">{t('common.noData', 'No hay datos para mostrar.')}</p>
        )}

        {!loading && !error && reservations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-lg">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="py-3 px-6 text-left">{t('reservations.customer')}</th>
                <th className="py-3 px-6 text-left">{t('reservations.tourItinerary')}</th>
                <th className="py-3 px-6 text-left">{t('common.date')}</th>
                <th className="py-3 px-6 text-left">{t('reservations.participants')}</th>
                <th className="py-3 px-6 text-left">{t('common.status')}</th>
                <th className="py-3 px-6 text-left">{t('reservations.priceEur')}</th>
                <th className="py-3 px-6 text-left">{t('reservations.contact')}</th>
              </tr>
            </thead>
            <tbody>
              {currentReservations.map((reservation) => (
                <tr key={reservation.id} className="border-b border-gray-200 hover:bg-green-100 transition-colors">
                  <td className="py-4 px-6">{reservation.customerName}</td>
                  <td className="py-4 px-6">{reservation.tourName}</td>
                  <td className="py-4 px-6">{reservation.date}</td>
                  <td className="py-4 px-6">{reservation.participants}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass(reservation.status)}`}>
                      {getStatusLabel(reservation.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6">{money(reservation.price, reservation.currency)}</td>
                  <td className="py-4 px-6">
                    <div>{reservation.contactEmail}</div>
                    <div>{reservation.contactPhone}</div>
                  </td>
                  <td className="py-4 px-6">
                    <button onClick={() => handleViewDetails(reservation)} className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm">
                      {t('common.viewDetails')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {t('common.previous')}
            </button>
            {renderPagination().map((page, index) => (
              <button key={index} onClick={() => typeof page === 'number' && handlePageChange(page)} disabled={page === '...'}
                className={`px-4 py-2 rounded-lg border transition-colors ${page === currentPage ? 'bg-green-500 text-white border-green-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                {page}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {t('common.next')}
            </button>
          </div>
        )}

        {isModalOpen && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">{t('reservations.details')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <p><strong>{t('reservations.customer')}:</strong> {selectedReservation.customerName}</p>
                <p><strong>{t('reservations.tourItinerary')}:</strong> {selectedReservation.tourName}</p>
                <p><strong>{t('common.date')}:</strong> {selectedReservation.date}</p>
                <p><strong>{t('reservations.participants')}:</strong> {selectedReservation.participants}</p>
                <p><strong>{t('common.status')}:</strong> {getStatusLabel(selectedReservation.status)}</p>
                <p><strong>{t('reservations.priceEur')}:</strong> {money(selectedReservation.price, selectedReservation.currency)}</p>
                <p><strong>{t('reservations.contactEmail')}:</strong> {selectedReservation.contactEmail}</p>
                <p><strong>{t('reservations.contactPhone')}:</strong> {selectedReservation.contactPhone}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reservations;
