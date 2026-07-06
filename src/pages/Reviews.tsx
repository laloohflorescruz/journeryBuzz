import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listReviews, type Review as ApiReview } from '../services/resources';

interface Review {
  id: number;
  customerName: string;
  tourOrItinerary: string;
  rating: number;
  comment: string;
  date: string;
}

function toReview(r: ApiReview): Review {
  return {
    id: r.id,
    customerName: r.author_username || '—',
    tourOrItinerary: r.tour?.name || r.company?.name || '—',
    rating: r.rating,
    comment: r.comment,
    date: r.created_at ? new Date(r.created_at).toLocaleDateString() : '—',
  };
}

function Reviews() {
  const { t } = useTranslation();
  const [selectedTour, setSelectedTour] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    let active = true;
    setLoading(true);
    listReviews()
      .then((data) => { if (active) { setReviews(data.map(toReview)); setError(null); } })
      .catch(() => { if (active) setError(t('common.loadError', 'No se pudieron cargar los datos.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [t]);

  const tourNames = ['All', ...Array.from(new Set(reviews.map(review => review.tourOrItinerary)))];
  const filteredReviews = selectedTour === 'All' ? reviews : reviews.filter(review => review.tourOrItinerary === selectedTour);
  const groupedReviews = filteredReviews.reduce((acc, review) => {
    if (!acc[review.tourOrItinerary]) acc[review.tourOrItinerary] = [];
    acc[review.tourOrItinerary].push(review);
    return acc;
  }, {} as Record<string, Review[]>);

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">⭐ {t('reviews.title')}</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">{t('reviews.subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {loading && <p className="text-center text-gray-500 py-10">{t('common.loading', 'Cargando...')}</p>}
        {error && <p className="text-center text-red-600 py-10">{error}</p>}
        {!loading && !error && reviews.length === 0 && (
          <p className="text-center text-gray-500 py-10">{t('common.noData', 'No hay datos para mostrar.')}</p>
        )}

        {!loading && !error && reviews.length > 0 && (
        <>
        <div className="mb-8">
          <label htmlFor="tourFilter" className="block text-lg font-semibold text-gray-700 mb-2">
            {t('reviews.filterByTour')}
          </label>
          <select
            id="tourFilter"
            value={selectedTour}
            onChange={(e) => { setSelectedTour(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            {tourNames.map((tour) => (
              <option key={tour} value={tour}>
                {tour === 'All' ? t('common.all') : tour}
              </option>
            ))}
          </select>
        </div>

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
        </>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {t('common.previous')}
            </button>
            {renderPagination().map((page, index) => (
              <button key={index} onClick={() => typeof page === 'number' && handlePageChange(page)} disabled={page === '...'}
                className={`px-4 py-2 rounded-lg border transition-colors ${page === currentPage ? 'bg-yellow-500 text-white border-yellow-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                {page}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {t('common.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reviews;
