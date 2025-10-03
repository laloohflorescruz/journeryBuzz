import { useState } from 'react';

interface Review {
  id: number;
  customerName: string;
  tourOrItinerary: string;
  rating: number;
  comment: string;
  date: string;
}

function ReviewsByTours() {
  const [selectedTour, setSelectedTour] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: 1,
      customerName: 'Juan Pérez',
      tourOrItinerary: 'Tour por Madrid Centro',
      rating: 5,
      comment: 'Excelente tour, muy bien organizado y divertido.',
      date: '2024-07-16',
    },
    {
      id: 2,
      customerName: 'Maria Lopez',
      tourOrItinerary: 'Tour Gaudí Barcelona',
      rating: 4,
      comment: 'Muy interesante, el guía fue muy amable.',
      date: '2024-07-21',
    },
    {
      id: 3,
      customerName: 'Carlos García',
      tourOrItinerary: 'Tour Roma Antigua',
      rating: 3,
      comment: 'Buena experiencia, pero un poco cansado.',
      date: '2024-08-02',
    },
    {
      id: 4,
      customerName: 'Ana Martínez',
      tourOrItinerary: 'Tour París Iluminado',
      rating: 5,
      comment: 'Hermosas vistas y excelente guía.',
      date: '2024-08-11',
    },
    {
      id: 5,
      customerName: 'Luis Fernández',
      tourOrItinerary: 'Tour Amsterdam Canales',
      rating: 4,
      comment: 'Muy relajante y bien organizado.',
      date: '2024-08-16',
    },
    {
      id: 6,
      customerName: 'Elena Ruiz',
      tourOrItinerary: 'Tour por Madrid Centro',
      rating: 4,
      comment: 'Gran experiencia, recomendado.',
      date: '2024-08-20',
    },
    {
      id: 7,
      customerName: 'Pedro Sánchez',
      tourOrItinerary: 'Tour Gaudí Barcelona',
      rating: 5,
      comment: 'Increíble, volvería a hacerlo.',
      date: '2024-08-25',
    },
  ];

  // Get unique tour names for filter
  const tourNames = ['All', ...Array.from(new Set(reviews.map(review => review.tourOrItinerary)))];

  // Filter reviews based on selected tour
  const filteredReviews = selectedTour === 'All' ? reviews : reviews.filter(review => review.tourOrItinerary === selectedTour);

  // Group reviews by tour
  const groupedReviews = filteredReviews.reduce((acc, review) => {
    if (!acc[review.tourOrItinerary]) {
      acc[review.tourOrItinerary] = [];
    }
    acc[review.tourOrItinerary].push(review);
    return acc;
  }, {} as Record<string, Review[]>);

  // Pagination logic
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = filteredReviews.slice(startIndex, endIndex);

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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">⭐ Reviews by Tours</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Visualiza y gestiona todas las reseñas agrupadas por tours e itinerarios.
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            {tourNames.map((tour) => (
              <option key={tour} value={tour}>
                {tour}
              </option>
            ))}
          </select>
        </div>

        {/* Reviews by Tours */}
        {Object.entries(groupedReviews).map(([tourName, tourReviews]) => (
          <div key={tourName} className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{tourName}</h2>
            <div className="space-y-4">
              {tourReviews.slice(startIndex, endIndex).map((review) => (
                <div key={review.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{review.customerName}</h3>
                    <span className="text-yellow-500 font-semibold">{'⭐'.repeat(review.rating)}</span>
                  </div>
                  <p className="text-gray-600 mb-2">{review.comment}</p>
                  <p className="text-sm text-gray-400">{review.date}</p>
                </div>
              ))}
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
                  page === currentPage ? 'bg-yellow-500 text-white border-yellow-500' : 'border-gray-300 hover:bg-gray-50'
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

export default ReviewsByTours;
