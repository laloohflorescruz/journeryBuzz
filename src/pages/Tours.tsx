import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  listMyTours,
  createTour,
  updateTour,
  deleteTour,
  type Tour,
  type TourPayload,
  type TourType,
  type Difficulty,
} from '../services/tours';

// The four "included" checkboxes are persisted as tokens inside the Tour's
// `includes` JSON list, so the boolean UX round-trips against the API.
const INCLUDE_TOKENS = ['guide', 'equipment', 'meals', 'transportation'] as const;

// Buzz keeps a free-text location label; the Tour model has no dedicated
// location string (it uses latitude/longitude + destination), so we store the
// label in `best_for`, which is currently unused by the public app.
const priceNum = (t: Tour) => parseFloat(t.price) || 0;
const daysOf = (t: Tour) => {
  const n = parseInt(t.duration, 10);
  return Number.isNaN(n) ? '' : n;
};

function Tours() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTours, setSelectedTours] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const itemsPerPage = 10;

  const TOUR_TYPES: { value: TourType; label: string }[] = [
    { value: 'adventure', label: t('tours.adventure') },
    { value: 'cultural', label: t('tours.cultural') },
    { value: 'nature', label: t('tours.nature') },
    { value: 'beach', label: t('tours.beach') },
    { value: 'city', label: t('tours.city') },
  ];
  const typeLabel = (v: string) => TOUR_TYPES.find(o => o.value === v)?.label ?? (v || '—');

  const loadTours = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listMyTours();
      setTours(data);
    } catch {
      setError(t('tours.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadTours();
  }, [loadTours]);

  // Filter tours by tour_type
  const filteredTours = filterType === 'all' ? tours : tours.filter(tour => tour.tour_type === filterType);

  // Pagination logic
  const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTours = filteredTours.slice(startIndex, endIndex);

  const avgPrice = tours.length
    ? Math.round(tours.reduce((sum, tour) => sum + priceNum(tour), 0) / tours.length)
    : 0;
  const avgRating = tours.length
    ? (tours.reduce((sum, tour) => sum + tour.rating, 0) / tours.length).toFixed(1)
    : '0.0';
  const totalReviews = tours.reduce((sum, tour) => sum + tour.reviews, 0);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTour = (id: number) => {
    setSelectedTours(prev =>
      prev.includes(id) ? prev.filter(tourId => tourId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTours.length === currentTours.length) {
      setSelectedTours([]);
    } else {
      setSelectedTours(currentTours.map(tour => tour.id));
    }
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

  // CRUD Functions
  const handleAddTour = () => {
    setEditingTour(null);
    setIsModalOpen(true);
  };

  const handleEditTour = (tour: Tour) => {
    setEditingTour(tour);
    setIsModalOpen(true);
  };

  const handleDeleteTour = async (id: number) => {
    if (!window.confirm(t('tours.confirmDelete'))) return;
    try {
      await deleteTour(id);
      setTours(prev => prev.filter(tour => tour.id !== id));
      setSelectedTours(prev => prev.filter(selectedId => selectedId !== id));
    } catch {
      setError(t('tours.saveError'));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const includes = INCLUDE_TOKENS.filter(token => form.get(token) === 'on');
    const payload: TourPayload = {
      name: form.get('name') as string,
      tour_type: form.get('type') as TourType,
      duration: String(form.get('duration') ?? ''),
      difficulty: form.get('difficulty') as Difficulty,
      price: String(form.get('pricePerPerson') ?? ''),
      rating: parseFloat(form.get('rating') as string) || 0,
      reviews: parseInt(form.get('reviews') as string, 10) || 0,
      image: (form.get('image') as string) || '',
      best_for: (form.get('location') as string) || '',
      latitude: parseFloat(form.get('lat') as string) || 0,
      longitude: parseFloat(form.get('lng') as string) || 0,
      max_group: parseInt(form.get('maxParticipants') as string, 10) || 0,
      description: (form.get('description') as string) || '',
      includes,
      is_active: editingTour ? editingTour.is_active : true,
    };

    setSaving(true);
    setError('');
    try {
      if (editingTour) {
        const updated = await updateTour(editingTour.id, payload);
        setTours(prev => prev.map(tour => (tour.id === updated.id ? updated : tour)));
      } else {
        const created = await createTour(payload);
        setTours(prev => [...prev, created]);
      }
      setIsModalOpen(false);
      setEditingTour(null);
    } catch {
      setError(t('tours.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">🏔️ {t('tours.title')}</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            {t('tours.subtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('tours.totalTours')}</p>
                <p className="text-2xl font-bold text-gray-800">{tours.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('tours.avgPricePerPerson')}</p>
                <p className="text-2xl font-bold text-gray-800">€{avgPrice}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('tours.avgRating')}</p>
                <p className="text-2xl font-bold text-gray-800">{avgRating} ⭐</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('tours.totalReviews')}</p>
                <p className="text-2xl font-bold text-gray-800">{totalReviews}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">{t('tours.list')}</h2>
          <div className="flex gap-4">
            <button
              onClick={handleAddTour}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('tours.add')}
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <label htmlFor="filterType" className="mr-2 font-medium text-gray-700">
            {t('common.filterByType')}
          </label>
          <select
            id="filterType"
            value={filterType}
            onChange={e => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="all">{t('common.all')}</option>
            {TOUR_TYPES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Tours List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-500">
            {t('tours.loading')}
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-500">
            {t('tours.empty')}
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedTours.length === currentTours.length && currentTours.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.name')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.type')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.location')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('tours.duration')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('tours.pricePerPerson')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.rating')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentTours.map(tour => (
                  <tr key={tour.id} className={selectedTours.includes(tour.id) ? 'bg-green-50' : ''}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTours.includes(tour.id)}
                        onChange={() => handleSelectTour(tour.id)}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{tour.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{typeLabel(tour.tour_type)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{tour.best_for || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{daysOf(tour)} {t('tours.durationDays')}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">€{priceNum(tour)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{tour.rating} ⭐</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 flex gap-2">
                      <Link
                        to={`/provider/${tour.id}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        {t('common.viewProfile')}
                      </Link>
                      <button
                        onClick={() => handleEditTour(tour)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteTour(tour.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                      >
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Modal for Add/Edit Tour */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingTour ? t('tours.edit') : t('tours.addNew')}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.name')}</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingTour?.name}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.type')}</label>
                    <select
                      name="type"
                      defaultValue={editingTour?.tour_type || 'adventure'}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {TOUR_TYPES.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tours.duration')}</label>
                    <input
                      type="number"
                      name="duration"
                      min="1"
                      defaultValue={editingTour ? daysOf(editingTour) : undefined}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tours.difficulty')}</label>
                    <select
                      name="difficulty"
                      defaultValue={editingTour?.difficulty || 'easy'}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="easy">{t('tours.easy')}</option>
                      <option value="moderate">{t('tours.medium')}</option>
                      <option value="hard">{t('tours.hard')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tours.pricePerPerson')}</label>
                    <input
                      type="number"
                      name="pricePerPerson"
                      min="0"
                      defaultValue={editingTour ? priceNum(editingTour) : undefined}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.rating')}</label>
                    <input
                      type="number"
                      name="rating"
                      step="0.1"
                      min="0"
                      max="5"
                      defaultValue={editingTour?.rating}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.reviews')}</label>
                    <input
                      type="number"
                      name="reviews"
                      min="0"
                      defaultValue={editingTour?.reviews}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.location')}</label>
                    <input
                      type="text"
                      name="location"
                      defaultValue={editingTour?.best_for}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tours.latitude')}</label>
                    <input
                      type="number"
                      name="lat"
                      step="any"
                      defaultValue={editingTour?.latitude}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tours.longitude')}</label>
                    <input
                      type="number"
                      name="lng"
                      step="any"
                      defaultValue={editingTour?.longitude}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tours.imageUrl')}</label>
                    <input
                      type="url"
                      name="image"
                      defaultValue={editingTour?.image}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tours.maxParticipants')}</label>
                    <input
                      type="number"
                      name="maxParticipants"
                      min="1"
                      defaultValue={editingTour?.max_group}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label>
                  <textarea
                    name="description"
                    defaultValue={editingTour?.description}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="guide"
                      defaultChecked={editingTour?.includes.includes('guide')}
                      className="mr-2"
                    />
                    <span className="text-sm">{t('tours.guideIncluded')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="equipment"
                      defaultChecked={editingTour?.includes.includes('equipment')}
                      className="mr-2"
                    />
                    <span className="text-sm">{t('tours.equipmentIncluded')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="meals"
                      defaultChecked={editingTour?.includes.includes('meals')}
                      className="mr-2"
                    />
                    <span className="text-sm">{t('tours.mealsIncluded')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="transportation"
                      defaultChecked={editingTour?.includes.includes('transportation')}
                      className="mr-2"
                    />
                    <span className="text-sm">{t('tours.transportationIncluded')}</span>
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? t('tours.saving') : editingTour ? t('common.update') : t('common.add')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tours;
