import { useState } from 'react';
import { useParams } from 'react-router-dom';

interface Tour {
  id: number;
  name: string;
  type: string;
  price: string;
  rating: number;
  duration: string;
  image: string;
  description: string;
}

interface CityTour {
  id: number;
  name: string;
  price: string;
  duration: string;
  rating: number;
}

interface Event {
  id: number;
  name: string;
  date: string;
  type: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  type: string;
}

interface Provider {
  name: string;
  description: string;
  rating: number;
  reviews: number;
  tours: number;
  founded: string;
  location: string;
  languages: string[];
  specialties: string[];
  verified?: boolean;
  contact: {
    email: string;
    phone: string;
    website: string;
    personInCharge?: string;
    personContact?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
  };
  allTours?: Tour[];
  cityTours?: CityTour[];
  events?: Event[];
  products?: Product[];
}

function ProviderProfile() {
  const { providerId } = useParams<{ providerId: string }>();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = 9;

  // Events pagination state
  const [currentEventsPage, setCurrentEventsPage] = useState(1);
  const eventsPerPage = 3;

  // Mock provider data - in a real app, this would come from an API
  const providers: Record<string, Provider> = {
    'madrid-heritage-tours': {
      name: 'Madrid Heritage Tours',
      description: 'Especialistas en tours históricos por Madrid con guías expertos locales.',
      rating: 4.8,
      reviews: 245,
      tours: 12,
      founded: '2015',
      location: 'Madrid, España',
      languages: ['Español', 'Inglés', 'Francés'],
      specialties: ['Historia', 'Arquitectura', 'Gastronomía'],
      verified: true,
      contact: {
        email: 'info@madridheritagetours.com',
        phone: '+34 911 123 456',
        website: 'www.madridheritagetours.com',
        personInCharge: 'María González',
        personContact: '+34 911 123 457',
        youtube: 'https://youtube.com/@MadridHeritageTours',
        instagram: 'https://instagram.com/madridheritagetours',
        facebook: 'https://facebook.com/MadridHeritageTours'
      },
      allTours: [
        { id: 1, name: 'Tour por Madrid Centro', type: 'city', price: '45€', rating: 4.8, duration: '4 horas', image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400', description: 'Descubre los principales monumentos históricos de Madrid en un tour completo.' },
        { id: 2, name: 'Tour Histórico de Madrid', type: 'historical', price: '55€', rating: 4.9, duration: '6 horas', image: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=400', description: 'Viaje en el tiempo por la Antigua Madrid con monumentos emblemáticos.' },
        { id: 3, name: 'Madrid Nocturno', type: 'night', price: '40€', rating: 4.6, duration: '3 horas', image: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=400', description: 'Descubre la Barcelona nocturna con música, tapas y vida local.' },
        { id: 4, name: 'Tour Gastronómico Madrid', type: 'food', price: '65€', rating: 4.7, duration: '3.5 horas', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400', description: 'Experiencia culinaria completa por los mejores mercados y restaurantes de Madrid.' },
        { id: 5, name: 'Madrid Moderno', type: 'city', price: '50€', rating: 4.7, duration: '3 horas', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', description: 'Explora la arquitectura moderna y contemporánea de Madrid.' },
        { id: 6, name: 'Tour de Arte Madrid', type: 'art', price: '60€', rating: 4.8, duration: '5 horas', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', description: 'Visita los mejores museos y galerías de arte de Madrid.' },
        { id: 7, name: 'Madrid en Bicicleta', type: 'adventure', price: '35€', rating: 4.5, duration: '2.5 horas', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', description: 'Recorre Madrid de manera sostenible y activa en bicicleta.' },
        { id: 8, name: 'Tour Familiar Madrid', type: 'family', price: '70€', rating: 4.9, duration: '4 horas', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', description: 'Tour diseñado especialmente para familias con niños.' },
        { id: 9, name: 'Madrid Real', type: 'historical', price: '75€', rating: 4.8, duration: '7 horas', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', description: 'Tour completo por el Palacio Real y sus alrededores.' },
        { id: 10, name: 'Madrid Verde', type: 'nature', price: '30€', rating: 4.6, duration: '2 horas', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', description: 'Descubre los parques y jardines más bellos de Madrid.' },
        { id: 11, name: 'Tour Fotográfico Madrid', type: 'photography', price: '80€', rating: 4.7, duration: '5 horas', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', description: 'Aprende técnicas de fotografía urbana con profesionales.' },
        { id: 12, name: 'Madrid Tapas Tour', type: 'food', price: '55€', rating: 4.8, duration: '4 horas', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', description: 'Degustación de tapas tradicionales en los mejores bares de Madrid.' }
      ],
      cityTours: [
        { id: 1, name: 'Tour por Madrid Centro', price: '45€', duration: '4 horas', rating: 4.8 },
        { id: 4, name: 'Madrid Moderno', price: '50€', duration: '3 horas', rating: 4.7 }
      ],
      events: [
        { id: 1, name: 'Festival de Primavera Madrid', date: '2024-04-15', type: 'Festival' },
        { id: 2, name: 'Concierto en Plaza Mayor', date: '2024-05-20', type: 'Concierto' }
      ],
      products: [
        { id: 1, name: 'Guía de Madrid', price: '15€', type: 'Libro' },
        { id: 2, name: 'Mapa Interactivo', price: '10€', type: 'Digital' },
        { id: 3, name: 'Merchandising Madrid', price: '25€', type: 'Ropa' }
      ]
    },
    // Add more providers as needed
  };

  const provider = providerId ? providers[providerId] : undefined;

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Proveedor no encontrado</h1>
          <p className="text-gray-600">El proveedor que buscas no existe.</p>
        </div>
      </div>
    );
  }

  // Pagination logic
  const totalTours = provider.allTours?.length || 0;
  const totalPages = Math.ceil(totalTours / toursPerPage);
  const startIndex = (currentPage - 1) * toursPerPage;
  const endIndex = startIndex + toursPerPage;
  const currentTours = provider.allTours?.slice(startIndex, endIndex) || [];

  // Events pagination logic
  const totalEvents = provider.events?.length || 0;
  const totalEventsPages = Math.ceil(totalEvents / eventsPerPage);
  const eventsStartIndex = (currentEventsPage - 1) * eventsPerPage;
  const eventsEndIndex = eventsStartIndex + eventsPerPage;
  const currentEvents = provider.events?.slice(eventsStartIndex, eventsEndIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEventsPageChange = (page: number) => {
    setCurrentEventsPage(page);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center mb-2">
                <h1 className="text-3xl font-bold text-gray-800 mr-3">{provider.name}</h1>
                {provider.verified && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    ✓ Verificado
                  </span>
                )}
              </div>
              <p className="text-gray-600">{provider.description}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center mb-2">
                <span className="text-2xl font-bold text-purple-600 mr-2">⭐ {provider.rating}</span>
                <span className="text-gray-600">({provider.reviews} reseñas)</span>
              </div>
              <p className="text-sm text-gray-500">{provider.tours} tours disponibles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">📍 Ubicación</h3>
              <p className="text-gray-600">{provider.location}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">📅 Fundación</h3>
              <p className="text-gray-600">{provider.founded}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">🌍 Idiomas</h3>
              <p className="text-gray-600">{provider.languages.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Especialidades</h2>
          <div className="flex flex-wrap gap-2">
            {provider.specialties.map((specialty, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📞 Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">👤 Persona a Cargo</h3>
              <p className="text-gray-600">{provider.contact.personInCharge || 'No especificado'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">📱 Contacto Directo</h3>
              <p className="text-gray-600">{provider.contact.personContact || 'No disponible'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">📧 Email</h3>
              <p className="text-gray-600">{provider.contact.email}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🌐 Sitio Web</h3>
              <a href={`https://${provider.contact.website}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                {provider.contact.website}
              </a>
            </div>
          </div>

          {/* Social Media */}
          {(provider.contact.youtube || provider.contact.instagram || provider.contact.facebook) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">📱 Redes Sociales</h3>
              <div className="flex flex-wrap gap-4">
                {provider.contact.youtube && (
                  <a href={provider.contact.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center text-red-600 hover:text-red-800">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    YouTube
                  </a>
                )}
                {provider.contact.instagram && (
                  <a href={provider.contact.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center text-pink-600 hover:text-pink-800">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C8.396 0 7.996.014 6.797.067 5.609.12 4.782.308 4.082.558c-.726.26-1.34.598-1.955 1.213C1.512 2.386 1.174 3 1.174 3.726c0 .726.338 1.34.953 1.955.615.615 1.229 1.213 1.955 1.213h.001c.726 0 1.34.338 1.955.953.615.615 1.213 1.229 1.213 1.955v.001c0 .726-.338 1.34-.953 1.955-.615.615-1.229 1.213-1.955 1.213-.726 0-1.34.338-1.955.953C1.512 15.614 1.174 16.228 1.174 16.954c0 .726.338 1.34.953 1.955.615.615 1.229 1.213 1.955 1.213.7.25 1.527.438 2.715.49 1.2.054 1.6.067 5.221.067s4.021-.013 5.221-.067c1.188-.052 2.015-.24 2.715-.49.726-.26 1.34-.598 1.955-1.213.615-.615 1.213-1.229 1.213-1.955 0-.726-.338-1.34-.953-1.955-.615-.615-1.229-1.213-1.955-1.213-.726 0-1.34-.338-1.955-.953-.615-.615-1.213-1.229-1.213-1.955v-.001c0-.726.338-1.34.953-1.955.615-.615 1.229-1.213 1.955-1.213.726 0 1.34-.338 1.955-.953.615-.615 1.213-1.229 1.213-1.955 0-.726-.338-1.34-.953-1.955C21.488 2.386 20.864 2.048 20.138 1.788c-.7-.25-1.527-.438-2.715-.49C16.223.014 15.823 0 12.202 0h-.185zm0 5.839a6.163 6.163 0 1 0 0 12.326 6.163 6.163 0 0 0 0-12.326zM12.017 16.48a4.321 4.321 0 1 1 0-8.642 4.321 4.321 0 0 1 0 8.642zm6.406-11.845a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/>
                    </svg>
                    Instagram
                  </a>
                )}
                {provider.contact.facebook && (
                  <a href={provider.contact.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* All Tours */}
        {provider.allTours && provider.allTours.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800">🏆 Tours Especializados</h2>
                <div className="text-sm text-gray-600 bg-purple-50 px-3 py-1 rounded-full">
                  {totalTours} tours disponibles
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Tours temáticos especializados en hoteles boutique y puntos de interés únicos con fechas programadas
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentTours.map(tour => (
                <div key={tour.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                  <div className="relative">
                    <img
                      src={tour.image}
                      alt={tour.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-white rounded-lg px-3 py-1 shadow-md">
                      <span className="text-lg font-bold text-purple-600">{tour.price}</span>
                    </div>
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                      ⭐ {tour.rating}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{tour.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tour.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {tour.duration}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {tour.type}
                      </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-[1.02] shadow-md">
                      Ver más detalles
                    </button>
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Events */}
        {provider.events && provider.events.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800">🎉 Eventos Especiales</h2>
                <div className="text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full">
                  {totalEvents} eventos disponibles
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Eventos únicos y experiencias especiales organizadas por {provider.name}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentEvents.map(event => (
                <div key={event.id} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {event.type}
                      </span>
                      <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg">
                        📅 {event.date}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{event.name}</h3>
                    <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] shadow-md">
                      Más información
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Events Pagination */}
            {totalEventsPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handleEventsPageChange(currentEventsPage - 1)}
                  disabled={currentEventsPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {Array.from({ length: totalEventsPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handleEventsPageChange(page)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      page === currentEventsPage ? 'bg-green-500 text-white border-green-500' : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handleEventsPageChange(currentEventsPage + 1)}
                  disabled={currentEventsPage === totalEventsPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default ProviderProfile;
