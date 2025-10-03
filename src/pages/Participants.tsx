import { useState } from 'react';

interface Participant {
  id: number;
  name: string;
  email: string;
  phone: string;
  tourName: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

function Participants() {
  const [selectedTour, setSelectedTour] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Mock participants data
  const participants: Participant[] = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      phone: '+34 600 123 456',
      tourName: 'Tour por Madrid Centro',
      date: '2024-07-15',
      status: 'confirmed',
    },
    {
      id: 2,
      name: 'Maria Lopez',
      email: 'maria.lopez@example.com',
      phone: '+34 600 654 321',
      tourName: 'Tour Gaudí Barcelona',
      date: '2024-07-20',
      status: 'confirmed',
    },
    {
      id: 3,
      name: 'Carlos García',
      email: 'carlos.garcia@example.com',
      phone: '+39 600 987 654',
      tourName: 'Tour Roma Antigua',
      date: '2024-08-01',
      status: 'pending',
    },
    {
      id: 4,
      name: 'Ana Martínez',
      email: 'ana.martinez@example.com',
      phone: '+33 600 321 987',
      tourName: 'Tour París Iluminado',
      date: '2024-08-10',
      status: 'confirmed',
    },
    {
      id: 5,
      name: 'Luis Fernández',
      email: 'luis.fernandez@example.com',
      phone: '+31 600 456 789',
      tourName: 'Tour Amsterdam Canales',
      date: '2024-08-15',
      status: 'cancelled',
    },
    {
      id: 6,
      name: 'Elena Ruiz',
      email: 'elena.ruiz@example.com',
      phone: '+34 600 789 012',
      tourName: 'Tour por Madrid Centro',
      date: '2024-08-20',
      status: 'confirmed',
    },
    {
      id: 7,
      name: 'Pedro Sánchez',
      email: 'pedro.sanchez@example.com',
      phone: '+34 600 345 678',
      tourName: 'Tour Gaudí Barcelona',
      date: '2024-08-25',
      status: 'confirmed',
    },
  ];

  // Get unique tour names for filter
  const tourNames = ['All', ...Array.from(new Set(participants.map(participant => participant.tourName)))];

  // Filter participants based on selected tour
  const filteredParticipants = selectedTour === 'All' ? participants : participants.filter(participant => participant.tourName === selectedTour);

  // Group participants by tour
  const groupedParticipants = filteredParticipants.reduce((acc, participant) => {
    if (!acc[participant.tourName]) {
      acc[participant.tourName] = [];
    }
    acc[participant.tourName].push(participant);
    return acc;
  }, {} as Record<string, Participant[]>);

  // Pagination logic
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParticipants = filteredParticipants.slice(startIndex, endIndex);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">👥 Participants</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Visualiza y gestiona los participantes en tus tours e itinerarios.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Filter */}
        <div className="mb-8">
          <label htmlFor="tourFilter" className="block text-lg font-semibold text-gray-700 mb-2">
            Filtrar por Tour/Itinerario:
          </label>
          <select
            id="tourFilter"
            value={selectedTour}
            onChange={(e) => {
              setSelectedTour(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {tourNames.map((tour) => (
              <option key={tour} value={tour}>
                {tour}
              </option>
            ))}
          </select>
        </div>

        {/* Participants by Tours */}
        {Object.entries(groupedParticipants).map(([tourName, tourParticipants]) => (
          <div key={tourName} className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{tourName}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow-lg">
                <thead>
                  <tr className="bg-purple-600 text-white">
                    <th className="py-3 px-6 text-left">Nombre</th>
                    <th className="py-3 px-6 text-left">Email</th>
                    <th className="py-3 px-6 text-left">Teléfono</th>
                    <th className="py-3 px-6 text-left">Fecha</th>
                    <th className="py-3 px-6 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {tourParticipants.slice(startIndex, endIndex).map((participant) => (
                    <tr key={participant.id} className="border-b border-gray-200 hover:bg-purple-100 transition-colors">
                      <td className="py-4 px-6">{participant.name}</td>
                      <td className="py-4 px-6">{participant.email}</td>
                      <td className="py-4 px-6">{participant.phone}</td>
                      <td className="py-4 px-6">{participant.date}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            participant.status === 'confirmed'
                              ? 'bg-green-200 text-green-800'
                              : participant.status === 'pending'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

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
                  page === currentPage ? 'bg-purple-500 text-white border-purple-500' : 'border-gray-300 hover:bg-gray-50'
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
      </div>
    </div>
  );
}

export default Participants;
