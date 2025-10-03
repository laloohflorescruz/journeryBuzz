import { useState } from 'react';
import { Link } from 'react-router-dom';

interface TourFormData {
  name: string;
  type: string;
  duration: number;
  difficulty: string;
  pricePerPerson: number;
  rating: number;
  reviews: number;
  image: string;
  location: string;
  lat: number;
  lng: number;
  description: string;
  maxParticipants: number;
  guideIncluded: boolean;
  equipmentIncluded: boolean;
  mealsIncluded: boolean;
  transportationIncluded: boolean;
}

interface Tour {
  id: number;
  name: string;
  type: string;
  duration: number;
  difficulty: string;
  pricePerPerson: number;
  rating: number;
  reviews: number;
  image: string;
  location: string;
  lat: number;
  lng: number;
  description: string;
  maxParticipants: number;
  guideIncluded: boolean;
  equipmentIncluded: boolean;
  mealsIncluded: boolean;
  transportationIncluded: boolean;
}

function Tours() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTours, setSelectedTours] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const itemsPerPage = 10;

  // Mock tours data
  const [tours, setTours] = useState<Tour[]>([
    {
      id: 1,
      name: 'Ruta de los Picos de Europa',
      type: 'Senderismo',
      duration: 5,
      difficulty: 'Medio',
      pricePerPerson: 250,
      rating: 4.8,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
      location: 'Picos de Europa, España',
      lat: 43.1767,
      lng: -4.8025,
      description: 'Una aventura inolvidable por los majestuosos Picos de Europa, con vistas panorámicas y refugios tradicionales.',
      maxParticipants: 12,
      guideIncluded: true,
      equipmentIncluded: true,
      mealsIncluded: true,
      transportationIncluded: true
    },
    {
      id: 2,
      name: 'Tour Cultural de Roma Antigua',
      type: 'Cultural',
      duration: 3,
      difficulty: 'Fácil',
      pricePerPerson: 180,
      rating: 4.6,
      reviews: 203,
      image: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=400',
      location: 'Roma, Italia',
      lat: 41.9028,
      lng: 12.4964,
      description: 'Descubre la historia milenaria de Roma, visitando el Coliseo, el Vaticano y otros monumentos icónicos.',
      maxParticipants: 20,
      guideIncluded: true,
      equipmentIncluded: false,
      mealsIncluded: false,
      transportationIncluded: true
    },
    {
      id: 3,
      name: 'Aventura en los Alpes Suizos',
      type: 'Aventura',
      duration: 7,
      difficulty: 'Difícil',
      pricePerPerson: 450,
      rating: 4.9,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      location: 'Alpes Suizos',
      lat: 46.8182,
      lng: 8.2275,
      description: 'Una experiencia extrema en los Alpes, con escalada, rafting y camping en altitudes elevadas.',
      maxParticipants: 8,
      guideIncluded: true,
      equipmentIncluded: true,
      mealsIncluded: true,
      transportationIncluded: true
    },
    {
      id: 4,
      name: 'Tour Gastronómico de Toscana',
      type: 'Cultural',
      duration: 4,
      difficulty: 'Fácil',
      pricePerPerson: 320,
      rating: 4.7,
      reviews: 134,
      image: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=400',
      location: 'Toscana, Italia',
      lat: 43.7696,
      lng: 11.2558,
      description: 'Degusta los sabores auténticos de Toscana, visitando viñedos, queserías y restaurantes tradicionales.',
      maxParticipants: 15,
      guideIncluded: true,
      equipmentIncluded: false,
      mealsIncluded: true,
      transportationIncluded: true
    },
    {
      id: 5,
      name: 'Expedición al Monte Everest Base Camp',
      type: 'Aventura',
      duration: 14,
      difficulty: 'Difícil',
      pricePerPerson: 1200,
      rating: 5.0,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400',
      location: 'Nepal',
      lat: 27.9881,
      lng: 86.9250,
      description: 'La aventura definitiva: llegar al Campo Base del Everest, con aclimatación y vistas inolvidables.',
      maxParticipants: 6,
      guideIncluded: true,
      equipmentIncluded: true,
      mealsIncluded: true,
      transportationIncluded: true
    },
    {
      id: 6,
      name: 'Senderismo en los Fiordos Noruegos',
      type: 'Senderismo',
      duration: 6,
      difficulty: 'Medio',
      pricePerPerson: 380,
      rating: 4.5,
      reviews: 178,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      location: 'Noruega',
      lat: 61.1520,
      lng: 8.7425,
      description: 'Explora los espectaculares fiordos noruegos, con caminatas moderadas y paisajes de ensueño.',
      maxParticipants: 10,
      guideIncluded: true,
      equipmentIncluded: true,
      mealsIncluded: true,
      transportationIncluded: true
    }
  ]);

  // Filter tours by type
  const filteredTours = filterType === 'all' ? tours : tours.filter(tour => tour.type === filterType);

  // Pagination logic
  const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTours = filteredTours.slice(startIndex, endIndex);

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

  const handleDeleteTour = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tour?')) {
      setTours(prev => prev.filter(tour => tour.id !== id));
      setSelectedTours(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleSaveTour = (tourData: TourFormData) => {
    if (editingTour) {
      // Update existing tour
      setTours(prev => prev.map(tour =>
        tour.id === editingTour.id
          ? { ...tour, ...tourData, id: tour.id }
          : tour
      ));
    } else {
      // Add new tour
      const newTour: Tour = {
        ...tourData,
        id: Math.max(...tours.map(t => t.id)) + 1
      };
      setTours(prev => [...prev, newTour]);
    }
    setIsModalOpen(false);
    setEditingTour(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">🏔️ Tours</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Gestiona todos los tours disponibles en la plataforma.
            Desde senderismo hasta aventuras culturales y extremas.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tours</p>
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
                <p className="text-sm text-gray-600">Precio Promedio por Persona</p>
                <p className="text-2xl font-bold text-gray-800">
                  €{Math.round(tours.reduce((sum, tour) => sum + tour.pricePerPerson, 0) / tours.length)}
                </p>
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
                <p className="text-sm text-gray-600">Rating Promedio</p>
                <p className="text-2xl font-bold text-gray-800">
                  {(tours.reduce((sum, tour) => sum + tour.rating, 0) / tours.length).toFixed(1)} ⭐
                </p>
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
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-800">
                  {tours.reduce((sum, tour) => sum + tour.reviews, 0)}
                </p>
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
          <h2 className="text-2xl font-bold text-gray-800">Lista de Tours</h2>
          <div className="flex gap-4">
            <button
              onClick={handleAddTour}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Tour
            </button>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Datos
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <label htmlFor="filterType" className="mr-2 font-medium text-gray-700">
            Filtrar por tipo:
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
            <option value="all">Todos</option>
            <option value="Senderismo">Senderismo</option>
            <option value="Cultural">Cultural</option>
            <option value="Aventura">Aventura</option>
          </select>
        </div>

        {/* Tours List */}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio por Persona</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
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
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{tour.type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{tour.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{tour.duration} días</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">€{tour.pricePerPerson}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{tour.rating} ⭐</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 flex gap-2">
                    <Link
                      to={`/provider/${tour.id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Ver Perfil
                    </Link>
                    <button
                      onClick={() => handleEditTour(tour)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteTour(tour.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
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
                  {editingTour ? 'Editar Tour' : 'Agregar Nuevo Tour'}
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

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const tourData: TourFormData = {
                  name: formData.get('name') as string,
                  type: formData.get('type') as string,
                  duration: parseInt(formData.get('duration') as string),
                  difficulty: formData.get('difficulty') as string,
                  pricePerPerson: parseInt(formData.get('pricePerPerson') as string),
                  rating: parseFloat(formData.get('rating') as string),
                  reviews: parseInt(formData.get('reviews') as string),
                  image: formData.get('image') as string,
                  location: formData.get('location') as string,
                  lat: parseFloat(formData.get('lat') as string),
                  lng: parseFloat(formData.get('lng') as string),
                  description: formData.get('description') as string,
                  maxParticipants: parseInt(formData.get('maxParticipants') as string),
                  guideIncluded: formData.get('guideIncluded') === 'on',
                  equipmentIncluded: formData.get('equipmentIncluded') === 'on',
                  mealsIncluded: formData.get('mealsIncluded') === 'on',
                  transportationIncluded: formData.get('transportationIncluded') === 'on'
                };
                handleSaveTour(tourData);
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingTour?.name}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      name="type"
                      defaultValue={editingTour?.type}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Senderismo">Senderismo</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Aventura">Aventura</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duración (días)</label>
                    <input
                      type="number"
                      name="duration"
                      min="1"
                      defaultValue={editingTour?.duration}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
                    <select
                      name="difficulty"
                      defaultValue={editingTour?.difficulty}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Fácil">Fácil</option>
                      <option value="Medio">Medio</option>
                      <option value="Difícil">Difícil</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio por Persona (€)</label>
                    <input
                      type="number"
                      name="pricePerPerson"
                      min="0"
                      defaultValue={editingTour?.pricePerPerson}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <input
                      type="number"
                      name="rating"
                      step="0.1"
                      min="0"
                      max="5"
                      defaultValue={editingTour?.rating}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reviews</label>
                    <input
                      type="number"
                      name="reviews"
                      min="0"
                      defaultValue={editingTour?.reviews}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                    <input
                      type="text"
                      name="location"
                      defaultValue={editingTour?.location}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
                    <input
                      type="number"
                      name="lat"
                      step="any"
                      defaultValue={editingTour?.lat}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
                    <input
                      type="number"
                      name="lng"
                      step="any"
                      defaultValue={editingTour?.lng}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagen URL</label>
                    <input
                      type="url"
                      name="image"
                      defaultValue={editingTour?.image}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Participantes Máximos</label>
                    <input
                      type="number"
                      name="maxParticipants"
                      min="1"
                      defaultValue={editingTour?.maxParticipants}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    name="description"
                    defaultValue={editingTour?.description}
                    required
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="guideIncluded"
                      defaultChecked={editingTour?.guideIncluded}
                      className="mr-2"
                    />
                    <span className="text-sm">Guía Incluido</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="equipmentIncluded"
                      defaultChecked={editingTour?.equipmentIncluded}
                      className="mr-2"
                    />
                    <span className="text-sm">Equipo Incluido</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="mealsIncluded"
                      defaultChecked={editingTour?.mealsIncluded}
                      className="mr-2"
                    />
                    <span className="text-sm">Comidas Incluidas</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="transportationIncluded"
                      defaultChecked={editingTour?.transportationIncluded}
                      className="mr-2"
                    />
                    <span className="text-sm">Transporte Incluido</span>
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    {editingTour ? 'Actualizar' : 'Agregar'}
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
