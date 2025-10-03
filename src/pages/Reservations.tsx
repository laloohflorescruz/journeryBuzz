import { useState } from 'react';

interface Reservation {
  id: number;
  customerName: string;
  tourName: string;
  date: string;
  participants: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
  contactEmail: string;
  contactPhone: string;
}

function Reservations() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const itemsPerPage = 8;

  // Mock reservations data
  const reservations: Reservation[] = [
    {
      id: 1,
      customerName: 'Juan Pérez',
      tourName: 'Tour por Madrid Centro',
      date: '2024-07-15',
      participants: 2,
      status: 'confirmed',
      price: 90,
      contactEmail: 'juan.perez@example.com',
      contactPhone: '+34 600 123 456',
    },
    {
      id: 2,
      customerName: 'Maria Lopez',
      tourName: 'Tour Gaudí Barcelona',
      date: '2024-07-20',
      participants: 4,
      status: 'pending',
      price: 200,
      contactEmail: 'maria.lopez@example.com',
      contactPhone: '+34 600 654 321',
    },
    {
      id: 3,
      customerName: 'Carlos García',
      tourName: 'Tour Roma Antigua',
      date: '2024-08-01',
      participants: 1,
      status: 'cancelled',
      price: 60,
      contactEmail: 'carlos.garcia@example.com',
      contactPhone: '+39 600 987 654',
    },
    {
      id: 4,
      customerName: 'Ana Martínez',
      tourName: 'Tour París Iluminado',
      date: '2024-08-10',
      participants: 3,
      status: 'confirmed',
      price: 210,
      contactEmail: 'ana.martinez@example.com',
      contactPhone: '+33 600 321 987',
    },
    {
      id: 5,
      customerName: 'Luis Fernández',
      tourName: 'Tour Amsterdam Canales',
      date: '2024-08-15',
      participants: 2,
      status: 'pending',
      price: 80,
      contactEmail: 'luis.fernandez@example.com',
      contactPhone: '+31 600 456 789',
    },
  ];

  // Pagination logic
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
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-lime-600 to-yellow-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">📅 Reservations</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Visualiza y gestiona todas las reservas realizadas para tours e itinerarios.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Reservations Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-lg">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="py-3 px-6 text-left">Cliente</th>
                <th className="py-3 px-6 text-left">Tour/Itinerario</th>
                <th className="py-3 px-6 text-left">Fecha</th>
                <th className="py-3 px-6 text-left">Participantes</th>
                <th className="py-3 px-6 text-left">Estado</th>
                <th className="py-3 px-6 text-left">Precio (€)</th>
                <th className="py-3 px-6 text-left">Contacto</th>
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
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      reservation.status === 'confirmed'
                        ? 'bg-green-200 text-green-800'
                        : reservation.status === 'pending'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-6">€{reservation.price}</td>
                <td className="py-4 px-6">
                  <div>{reservation.contactEmail}</div>
                  <div>{reservation.contactPhone}</div>
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => handleViewDetails(reservation)}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {renderPagination().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...'}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  page === currentPage ? 'bg-green-500 text-white border-green-500' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Details Modal */}
        {isModalOpen && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Detalles de la Reserva</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <p><strong>Cliente:</strong> {selectedReservation.customerName}</p>
                <p><strong>Tour/Itinerario:</strong> {selectedReservation.tourName}</p>
                <p><strong>Fecha:</strong> {selectedReservation.date}</p>
                <p><strong>Participantes:</strong> {selectedReservation.participants}</p>
                <p><strong>Estado:</strong> {selectedReservation.status.charAt(0).toUpperCase() + selectedReservation.status.slice(1)}</p>
                <p><strong>Precio (€):</strong> €{selectedReservation.price}</p>
                <p><strong>Contacto Email:</strong> {selectedReservation.contactEmail}</p>
                <p><strong>Contacto Teléfono:</strong> {selectedReservation.contactPhone}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Cerrar
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
