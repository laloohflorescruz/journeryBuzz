import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Tour {
  id: number;
  name: string;
  type: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
  location: string;
  lat: number;
  lng: number;
  duration: string;
  description: string;
  maxParticipants: number;
  language: string;
  includes: string[];
  provider: string;
}

function CityTours() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Mock city tours data
  const tours: Tour[] = [
    {
      id: 1,
      name: 'Tour por Madrid Centro',
      type: 'city',
      rating: 4.8,
      reviews: 245,
      price: 45,
      image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400',
      location: 'Madrid Centro',
      lat: 40.4168,
      lng: -3.7038,
      duration: '4 horas',
      description: 'Descubre los principales monumentos históricos de Madrid en un tour completo.',
      maxParticipants: 15,
      language: 'Español/Inglés',
      includes: ['Guía experto', 'Entrada a monumentos', 'Transporte'],
      provider: 'Madrid Heritage Tours'
    },
    {
      id: 2,
      name: 'Tour Histórico de Madrid',
      type: 'historical',
      rating: 4.9,
      reviews: 312,
      price: 55,
      image: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=400',
      location: 'Madrid',
      lat: 40.4168,
      lng: -3.7038,
      duration: '6 horas',
      description: 'Viaje en el tiempo por la Antigua Madrid con monumentos emblemáticos.',
      maxParticipants: 12,
      language: 'Español/Inglés',
      includes: ['Guía experto', 'Almuerzo incluido', 'Fotografías'],
      provider: 'Madrid Heritage Tours'
    },
    {
      id: 3,
      name: 'Tour Gaudí Barcelona',
      type: 'architectural',
      rating: 4.7,
      reviews: 189,
      price: 50,
      image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400',
      location: 'Barcelona',
      lat: 41.3851,
      lng: 2.1734,
      duration: '5 horas',
      description: 'Explora las obras maestras de Antoni Gaudí en Barcelona.',
      maxParticipants: 20,
      language: 'Español/Inglés',
      includes: ['Guía experto', 'Entrada Sagrada Familia', 'Transporte'],
      provider: 'Barcelona Modernista Tours'
    },
    {
      id: 4,
      name: 'Tour Roma Antigua',
      type: 'historical',
      rating: 4.6,
      reviews: 267,
      price: 60,
      image: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=400',
      location: 'Roma',
      lat: 41.9028,
      lng: 12.4964,
      duration: '4 horas',
      description: 'Recorre los monumentos antiguos de Roma con un arqueólogo experto.',
      maxParticipants: 15,
      language: 'Italiano/Inglés',
      includes: ['Guía arqueólogo', 'Entrada Coliseo', 'Audioguía'],
      provider: 'Roma Antica Tours'
    },
    {
      id: 5,
      name: 'Tour París Iluminado',
      type: 'city',
      rating: 4.8,
      reviews: 198,
      price: 70,
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400',
      location: 'París',
      lat: 48.8566,
      lng: 2.3522,
      duration: '3 horas',
      description: 'Tour nocturno por las luces de París en barco por el Sena.',
      maxParticipants: 25,
      language: 'Francés/Inglés',
      includes: ['Crucero Sena', 'Guía', 'Bebida incluida'],
      provider: 'Paris Nights Tours'
    },
    {
      id: 6,
      name: 'Tour Amsterdam Canales',
      type: 'city',
      rating: 4.5,
      reviews: 156,
      price: 40,
      image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400',
      location: 'Ámsterdam',
      lat: 52.3676,
      lng: 4.9041,
      duration: '2 horas',
      description: 'Navega por los famosos canales de Ámsterdam en barco.',
      maxParticipants: 30,
      language: 'Holandés/Inglés',
      includes: ['Barco canal', 'Guía', 'Café incluido'],
      provider: 'Amsterdam Canal Tours'
    }
  ];

  // Pagination logic
  const totalPages = Math.ceil(tours.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTours = tours.slice(startIndex, endIndex);

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">🚐 City Tours</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Gestiona todos los tours urbanos disponibles en la plataforma.
            Desde tours históricos hasta recorridos nocturnos.
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
              <div className="bg-pink-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Precio Promedio</p>
                <p className="text-2xl font-bold text-gray-800">
                  €{Math.round(tours.reduce((sum, tour) => sum + tour.price, 0) / tours.length)}
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
          <h2 className="text-2xl font-bold text-gray-800">Lista de City Tours</h2>
          <div className="flex gap-4">
            <button className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium flex items-center gap-2">
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

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {currentTours.map((tour, index) => (
            <div
              key={tour.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                <img src={tour.image} alt={tour.name} className="w-full h-48 object-cover" />
                <div className="absolute top-3 right-3 bg-white rounded-lg px-3 py-2 shadow-md">
                  <div className="text-pink-600 font-semibold text-sm">€{tour.price}</div>
                  <div className="flex items-center text-yellow-500 text-xs">
                    <span>⭐</span>
                    <span className="ml-1 font-medium">{tour.rating}</span>
                    <span className="text-gray-500 ml-1">({tour.reviews})</span>
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-medium">
                  {tour.type}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{tour.name}</h3>
                <p className="text-gray-600 mb-3">{tour.location}</p>
                <div className="flex items-center mb-3">
                  <span className="text-yellow-500 mr-1">⭐</span>
                  <span className="font-medium">{tour.rating}</span>
                  <span className="text-gray-500 ml-1">({tour.reviews})</span>
                </div>
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">{tour.description}</p>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {tour.duration}
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Máx {tour.maxParticipants} personas
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/provider/${tour.id}`}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver Detalles
                  </Link>
                  <button className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors font-medium flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                  page === currentPage ? 'bg-pink-500 text-white border-pink-500' : 'border-gray-300 hover:bg-gray-50'
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
      </div>
    </div>
  );
}

export default CityTours;
