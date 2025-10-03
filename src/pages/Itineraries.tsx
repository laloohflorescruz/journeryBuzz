import { useState } from 'react';
import { Link } from 'react-router-dom';

interface ItineraryFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  destinations: string[];
  category: string;
  difficulty: string;
  highlights: string[];
  image: string;
}

interface Itinerary {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  destinations: string[];
  category: string;
  difficulty: string;
  highlights: string[];
  image: string;
}

function Itineraries() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(null);
  const itemsPerPage = 10;

  // Mock itineraries data
  const [itineraries, setItineraries] = useState<Itinerary[]>([
    {
      id: 1,
      title: 'Madrid en 3 Días',
      description: 'Descubre la capital española con este itinerario perfecto para un fin de semana largo.',
      start_date: '2024-01-15',
      end_date: '2024-01-18',
      destinations: ['Madrid'],
      category: 'cultural',
      difficulty: 'Fácil',
      highlights: ['Museo del Prado', 'Plaza Mayor', 'Parque del Retiro'],
      image: '🏛️'
    },
    {
      id: 2,
      title: 'Costa Caribe Dominicana',
      description: 'Aventura y relax en las playas más hermosas del Caribe.',
      start_date: '2024-02-01',
      end_date: '2024-02-08',
      destinations: ['Punta Cana', 'Samaná', 'Miches'],
      category: 'adventure',
      difficulty: 'Moderado',
      highlights: ['Playas vírgenes', 'Observación de ballenas', 'Kayak en manglares'],
      image: '🏖️'
    },
    {
      id: 3,
      title: 'Barcelona Modernista',
      description: 'Sumérgete en la arquitectura de Gaudí y la cultura catalana.',
      start_date: '2024-03-10',
      end_date: '2024-03-15',
      destinations: ['Barcelona'],
      category: 'cultural',
      difficulty: 'Fácil',
      highlights: ['Sagrada Familia', 'Park Güell', 'La Rambla'],
      image: '🎭'
    },
    {
      id: 4,
      title: 'Aventura en los Andes',
      description: 'Senderismo y cultura en las alturas de Perú.',
      start_date: '2024-04-01',
      end_date: '2024-04-11',
      destinations: ['Cusco', 'Machu Picchu', 'Valle Sagrado'],
      category: 'adventure',
      difficulty: 'Difícil',
      highlights: ['Machu Picchu', 'Camino Inca', 'Lago Titicaca'],
      image: '🏔️'
    },
    {
      id: 5,
      title: 'México Colonial',
      description: 'Historia y cultura en las ciudades coloniales mexicanas.',
      start_date: '2024-05-01',
      end_date: '2024-05-09',
      destinations: ['Ciudad de México', 'Oaxaca', 'Puebla'],
      category: 'cultural',
      difficulty: 'Moderado',
      highlights: ['Pirámides de Teotihuacan', 'Centro Histórico', 'Mercados tradicionales'],
      image: '🌍'
    },
    {
      id: 6,
      title: 'Argentina Patagónica',
      description: 'Glaciares, lagos y fauna única en el fin del mundo.',
      start_date: '2024-06-01',
      end_date: '2024-06-13',
      destinations: ['Buenos Aires', 'El Calafate', 'Ushuaia'],
      category: 'nature',
      difficulty: 'Moderado',
      highlights: ['Glaciar Perito Moreno', 'Tierra del Fuego', 'Pingüinos'],
      image: '🧊'
    }
  ]);

  // Pagination logic
  const totalPages = Math.ceil(itineraries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItineraries = itineraries.slice(startIndex, endIndex);

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

  const handleAddItinerary = () => {
    setEditingItinerary(null);
    setIsModalOpen(true);
  };

  const handleEditItinerary = (itinerary: Itinerary) => {
    setEditingItinerary(itinerary);
    setIsModalOpen(true);
  };

  const handleDeleteItinerary = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este itinerario?')) {
      setItineraries(itineraries.filter(i => i.id !== id));
    }
  };

  const handleSaveItinerary = (itineraryData: ItineraryFormData) => {
    if (editingItinerary) {
      setItineraries(itineraries.map(i =>
        i.id === editingItinerary.id
          ? { ...i, ...itineraryData }
          : i
      ));
    } else {
      const newItinerary: Itinerary = {
        id: Math.max(...itineraries.map(i => i.id)) + 1,
        ...itineraryData
      };
      setItineraries([...itineraries, newItinerary]);
    }
    setIsModalOpen(false);
    setEditingItinerary(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">🗺️ Itineraries</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Gestiona todos los itinerarios de viaje disponibles en la plataforma.
            Desde aventuras alpinas hasta safaris africanos.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Itineraries</p>
                <p className="text-2xl font-bold text-gray-800">{itineraries.length}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categorías</p>
                <p className="text-2xl font-bold text-gray-800">{new Set(itineraries.map(i => i.category)).size}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dificultades</p>
                <p className="text-2xl font-bold text-gray-800">{new Set(itineraries.map(i => i.difficulty)).size}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Destinos Totales</p>
                <p className="text-2xl font-bold text-gray-800">{new Set(itineraries.flatMap(i => i.destinations)).size}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Lista de Itineraries</h2>
          <div className="flex gap-4">
            <button
              onClick={handleAddItinerary}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Itinerary
            </button>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Datos
            </button>
          </div>
        </div>

        {/* Itineraries Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinos</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dificultad</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Fin</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItineraries.map((itinerary) => (
                  <tr key={itinerary.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{itinerary.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-2xl">{itinerary.image}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{itinerary.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{itinerary.destinations.join(', ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        itinerary.category === 'cultural' ? 'bg-blue-100 text-blue-800' :
                        itinerary.category === 'adventure' ? 'bg-green-100 text-green-800' :
                        itinerary.category === 'nature' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {itinerary.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        itinerary.difficulty === 'Fácil' ? 'bg-green-100 text-green-800' :
                        itinerary.difficulty === 'Moderado' ? 'bg-yellow-100 text-yellow-800' :
                        itinerary.difficulty === 'Difícil' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {itinerary.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{itinerary.start_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{itinerary.end_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link
                          to={`/provider/${itinerary.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleEditItinerary(itinerary)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteItinerary(itinerary.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  page === currentPage ? 'bg-indigo-500 text-white border-indigo-500' : 'border-gray-300 hover:bg-gray-50'
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

        {/* Modal for Add/Edit Itinerary */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingItinerary ? 'Editar Itinerario' : 'Agregar Nuevo Itinerario'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const itineraryData: ItineraryFormData = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  start_date: formData.get('start_date') as string,
                  end_date: formData.get('end_date') as string,
                  destinations: (formData.get('destinations') as string).split(',').map(d => d.trim()),
                  category: formData.get('category') as string,
                  difficulty: formData.get('difficulty') as string,
                  highlights: (formData.get('highlights') as string).split(',').map(h => h.trim()),
                  image: formData.get('image') as string,
                };
                handleSaveItinerary(itineraryData);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingItinerary?.title}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                      name="category"
                      defaultValue={editingItinerary?.category}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="cultural">Cultural</option>
                      <option value="adventure">Adventure</option>
                      <option value="nature">Nature</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                    <input
                      type="date"
                      name="start_date"
                      defaultValue={editingItinerary?.start_date}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                    <input
                      type="date"
                      name="end_date"
                      defaultValue={editingItinerary?.end_date}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
                    <select
                      name="difficulty"
                      defaultValue={editingItinerary?.difficulty}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Fácil">Fácil</option>
                      <option value="Moderado">Moderado</option>
                      <option value="Difícil">Difícil</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagen (Emoji)</label>
                    <input
                      type="text"
                      name="image"
                      defaultValue={editingItinerary?.image}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destinos (separados por coma)</label>
                  <input
                    type="text"
                    name="destinations"
                    defaultValue={editingItinerary?.destinations.join(', ')}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highlights (separados por coma)</label>
                  <input
                    type="text"
                    name="highlights"
                    defaultValue={editingItinerary?.highlights.join(', ')}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    name="description"
                    defaultValue={editingItinerary?.description}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {editingItinerary ? 'Actualizar' : 'Crear'}
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

export default Itineraries;
