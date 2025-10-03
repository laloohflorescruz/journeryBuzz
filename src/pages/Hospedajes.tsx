import { useState } from 'react';
import { Link } from 'react-router-dom';

interface HotelFormData {
  name: string;
  type: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  image: string;
  location: string;
  lat: number;
  lng: number;
  amenities: string[];
  description: string;
  rooms: number;
  petFriendly: boolean;
  seaView: boolean;
  couplesFriendly: boolean;
  privateParking: boolean;
  privatePool: boolean;
  freeWifi: boolean;
  breakfastIncluded: boolean;
  airConditioning: boolean;
  gym: boolean;
  earlyCheckIn: boolean;
  laundry: boolean;
  kitchenette: boolean;
  jacuzzi: boolean;
  spa: boolean;
  balcony: boolean;
  oceanView: boolean;
  mountainView: boolean;
  cityView: boolean;
  fireplace: boolean;
  hotTub: boolean;
}

interface Hotel {
  id: number;
  name: string;
  type: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  image: string;
  location: string;
  lat: number;
  lng: number;
  amenities: string[];
  description: string;
  rooms: number;
  petFriendly: boolean;
  seaView: boolean;
  couplesFriendly: boolean;
  privateParking: boolean;
  privatePool: boolean;
  freeWifi: boolean;
  breakfastIncluded: boolean;
  airConditioning: boolean;
  gym: boolean;
  earlyCheckIn: boolean;
  laundry: boolean;
  kitchenette: boolean;
  jacuzzi: boolean;
  spa: boolean;
  balcony: boolean;
  oceanView: boolean;
  mountainView: boolean;
  cityView: boolean;
  fireplace: boolean;
  hotTub: boolean;
}

function Hospedajes() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHotels, setSelectedHotels] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const itemsPerPage = 10;

  // Mock accommodations data
  const [hotels, setHotels] = useState<Hotel[]>([
    {
      id: 1,
      name: 'Hostal Madrid Centro',
      type: 'Hostales',
      rating: 4.2,
      reviews: 245,
      pricePerNight: 45,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      location: 'Madrid Centro',
      lat: 40.4168,
      lng: -3.7038,
      amenities: ['WiFi gratuito', 'Desayuno incluido', 'Recepción 24h', 'Limpieza diaria'],
      description: 'Hostal moderno en el corazón de Madrid, perfecto para mochileros.',
      rooms: 25,
      petFriendly: false,
      seaView: false,
      couplesFriendly: true,
      privateParking: false,
      privatePool: false,
      freeWifi: true,
      breakfastIncluded: true,
      airConditioning: true,
      gym: false,
      earlyCheckIn: false,
      laundry: true,
      kitchenette: false,
      jacuzzi: false,
      spa: false,
      balcony: true,
      oceanView: false,
      mountainView: false,
      cityView: true,
      fireplace: false,
      hotTub: false
    },
    {
      id: 2,
      name: 'Hotel Barcelona Plaza',
      type: 'Hoteles',
      rating: 4.5,
      reviews: 312,
      pricePerNight: 85,
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',
      location: 'Barcelona',
      lat: 41.3851,
      lng: 2.1734,
      amenities: ['WiFi gratuito', 'Piscina', 'Gimnasio', 'Restaurante', 'Servicio de habitaciones'],
      description: 'Hotel de 4 estrellas con vistas a la plaza principal.',
      rooms: 120,
      petFriendly: true,
      seaView: false,
      couplesFriendly: true,
      privateParking: true,
      privatePool: true,
      freeWifi: true,
      breakfastIncluded: true,
      airConditioning: true,
      gym: true,
      earlyCheckIn: true,
      laundry: true,
      kitchenette: false,
      jacuzzi: true,
      spa: true,
      balcony: true,
      oceanView: false,
      mountainView: false,
      cityView: true,
      fireplace: false,
      hotTub: true
    },
    {
      id: 3,
      name: 'Apartamento Roma Antica',
      type: 'Apartamentos',
      rating: 4.7,
      reviews: 189,
      pricePerNight: 65,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      location: 'Roma',
      lat: 41.9028,
      lng: 12.4964,
      amenities: ['Cocina equipada', 'Kitchenette', 'WiFi', 'Lavandería', 'Terraza privada'],
      description: 'Apartamento moderno con todas las comodidades cerca del Coliseo.',
      rooms: 8,
      petFriendly: true,
      seaView: false,
      couplesFriendly: true,
      privateParking: false,
      privatePool: false,
      freeWifi: true,
      breakfastIncluded: false,
      airConditioning: true,
      gym: false,
      earlyCheckIn: false,
      laundry: true,
      kitchenette: true,
      jacuzzi: false,
      spa: false,
      balcony: true,
      oceanView: true,
      mountainView: false,
      cityView: false,
      fireplace: false,
      hotTub: false
    },
    {
      id: 4,
      name: 'Albergue Paris Jeunes',
      type: 'Dormitorios',
      rating: 4.0,
      reviews: 567,
      pricePerNight: 25,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
      location: 'París',
      lat: 48.8566,
      lng: 2.3522,
      amenities: ['WiFi gratuito', 'Cocina compartida', 'Taquillas', 'Sala común'],
      description: 'Albergue juvenil en el corazón de París, ideal para viajeros jóvenes.',
      rooms: 80,
      petFriendly: false,
      seaView: false,
      couplesFriendly: false,
      privateParking: false,
      privatePool: false,
      freeWifi: true,
      breakfastIncluded: false,
      airConditioning: false,
      gym: false,
      earlyCheckIn: false,
      laundry: true,
      kitchenette: false,
      jacuzzi: false,
      spa: false,
      balcony: false,
      oceanView: false,
      mountainView: false,
      cityView: false,
      fireplace: false,
      hotTub: false
    },
    {
      id: 5,
      name: 'Villa Toscana Luxury',
      type: 'Villas',
      rating: 4.9,
      reviews: 98,
      pricePerNight: 150,
      image: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=400',
      location: 'Toscana',
      lat: 43.7696,
      lng: 11.2558,
      amenities: ['Piscina privada', 'Jardín', 'Cocina completa', 'Kitchenette', 'WiFi', 'Parking'],
      description: 'Villa privada con piscina en las colinas de Toscana.',
      rooms: 4,
      petFriendly: true,
      seaView: false,
      couplesFriendly: true,
      privateParking: true,
      privatePool: true,
      freeWifi: true,
      breakfastIncluded: true,
      airConditioning: true,
      gym: false,
      earlyCheckIn: true,
      laundry: true,
      kitchenette: true,
      jacuzzi: true,
      spa: true,
      balcony: true,
      oceanView: false,
      mountainView: true,
      cityView: false,
      fireplace: true,
      hotTub: true
    },
    {
      id: 6,
      name: 'Hotel Boutique Ámsterdam',
      type: 'Hoteles',
      rating: 4.6,
      reviews: 234,
      pricePerNight: 95,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      location: 'Ámsterdam',
      lat: 52.3676,
      lng: 4.9041,
      amenities: ['WiFi gratuito', 'Desayuno gourmet', 'Bar', 'Spa', 'Bicicletas gratuitas'],
      description: 'Hotel boutique con encanto en el centro de Ámsterdam.',
      rooms: 45,
      petFriendly: true,
      seaView: false,
      couplesFriendly: true,
      privateParking: false,
      privatePool: false,
      freeWifi: true,
      breakfastIncluded: true,
      airConditioning: true,
      gym: false,
      earlyCheckIn: true,
      laundry: true,
      kitchenette: false,
      jacuzzi: false,
      spa: true,
      balcony: true,
      oceanView: false,
      mountainView: false,
      cityView: true,
      fireplace: false,
      hotTub: false
    }
  ]);

  // Filter hotels by type
  const filteredHotels = filterType === 'all' ? hotels : hotels.filter(hotel => hotel.type === filterType);

  // Pagination logic
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHotels = filteredHotels.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHotel = (id: number) => {
    setSelectedHotels(prev =>
      prev.includes(id) ? prev.filter(hotelId => hotelId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedHotels.length === currentHotels.length) {
      setSelectedHotels([]);
    } else {
      setSelectedHotels(currentHotels.map(hotel => hotel.id));
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
  const handleAddHotel = () => {
    setEditingHotel(null);
    setIsModalOpen(true);
  };

  const handleEditHotel = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setIsModalOpen(true);
  };

  const handleDeleteHotel = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este hospedaje?')) {
      setHotels(prev => prev.filter(hotel => hotel.id !== id));
      setSelectedHotels(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleSaveHotel = (hotelData: HotelFormData) => {
    if (editingHotel) {
      // Update existing hotel
      setHotels(prev => prev.map(hotel =>
        hotel.id === editingHotel.id
          ? { ...hotel, ...hotelData, id: hotel.id }
          : hotel
      ));
    } else {
      // Add new hotel
      const newHotel: Hotel = {
        ...hotelData,
        id: Math.max(...hotels.map(h => h.id)) + 1
      };
      setHotels(prev => [...prev, newHotel]);
    }
    setIsModalOpen(false);
    setEditingHotel(null);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">🏨 Hospedajes</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Gestiona todos los alojamientos disponibles en la plataforma.
            Desde hostales económicos hasta villas de lujo.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hospedajes</p>
                <p className="text-2xl font-bold text-gray-800">{hotels.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  €{Math.round(hotels.reduce((sum, hotel) => sum + hotel.pricePerNight, 0) / hotels.length)}
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
                  {(hotels.reduce((sum, hotel) => sum + hotel.rating, 0) / hotels.length).toFixed(1)} ⭐
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
                  {hotels.reduce((sum, hotel) => sum + hotel.reviews, 0)}
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
          <h2 className="text-2xl font-bold text-gray-800">Lista de Hospedajes</h2>
          <div className="flex gap-4">
            <button
              onClick={handleAddHotel}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Hospedaje
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
            <option value="Hostales">Hostales</option>
            <option value="Hoteles">Hoteles</option>
            <option value="Apartamentos">Apartamentos</option>
            <option value="Dormitorios">Dormitorios</option>
            <option value="Villas">Villas</option>
          </select>
        </div>

        {/* Hotels List */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedHotels.length === currentHotels.length && currentHotels.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio por noche</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentHotels.map(hotel => (
                <tr key={hotel.id} className={selectedHotels.includes(hotel.id) ? 'bg-green-50' : ''}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedHotels.includes(hotel.id)}
                      onChange={() => handleSelectHotel(hotel.id)}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{hotel.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{hotel.type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{hotel.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">€{hotel.pricePerNight}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{hotel.rating} ⭐</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 flex gap-2">
                    <Link
                      to={`/provider/${hotel.id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Ver Perfil
                    </Link>
                    <button
                      onClick={() => handleEditHotel(hotel)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteHotel(hotel.id)}
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

        {/* Modal for Add/Edit Hotel */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingHotel ? 'Editar Hospedaje' : 'Agregar Nuevo Hospedaje'}
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
                const hotelData: HotelFormData = {
                  name: formData.get('name') as string,
                  type: formData.get('type') as string,
                  rating: parseFloat(formData.get('rating') as string),
                  reviews: parseInt(formData.get('reviews') as string),
                  pricePerNight: parseInt(formData.get('pricePerNight') as string),
                  image: formData.get('image') as string,
                  location: formData.get('location') as string,
                  lat: parseFloat(formData.get('lat') as string),
                  lng: parseFloat(formData.get('lng') as string),
                  amenities: (formData.get('amenities') as string).split(',').map(a => a.trim()),
                  description: formData.get('description') as string,
                  rooms: parseInt(formData.get('rooms') as string),
                  petFriendly: formData.get('petFriendly') === 'on',
                  seaView: formData.get('seaView') === 'on',
                  couplesFriendly: formData.get('couplesFriendly') === 'on',
                  privateParking: formData.get('privateParking') === 'on',
                  privatePool: formData.get('privatePool') === 'on',
                  freeWifi: formData.get('freeWifi') === 'on',
                  breakfastIncluded: formData.get('breakfastIncluded') === 'on',
                  airConditioning: formData.get('airConditioning') === 'on',
                  gym: formData.get('gym') === 'on',
                  earlyCheckIn: formData.get('earlyCheckIn') === 'on',
                  laundry: formData.get('laundry') === 'on',
                  kitchenette: formData.get('kitchenette') === 'on',
                  jacuzzi: formData.get('jacuzzi') === 'on',
                  spa: formData.get('spa') === 'on',
                  balcony: formData.get('balcony') === 'on',
                  oceanView: formData.get('oceanView') === 'on',
                  mountainView: formData.get('mountainView') === 'on',
                  cityView: formData.get('cityView') === 'on',
                  fireplace: formData.get('fireplace') === 'on',
                  hotTub: formData.get('hotTub') === 'on'
                };
                handleSaveHotel(hotelData);
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingHotel?.name}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      name="type"
                      defaultValue={editingHotel?.type}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Hostales">Hostales</option>
                      <option value="Hoteles">Hoteles</option>
                      <option value="Apartamentos">Apartamentos</option>
                      <option value="Dormitorios">Dormitorios</option>
                      <option value="Villas">Villas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <input
                      type="number"
                      name="rating"
                      step="0.1"
                      min="0"
                      max="5"
                      defaultValue={editingHotel?.rating}
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
                      defaultValue={editingHotel?.reviews}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio por Noche (€)</label>
                    <input
                      type="number"
                      name="pricePerNight"
                      min="0"
                      defaultValue={editingHotel?.pricePerNight}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                    <input
                      type="text"
                      name="location"
                      defaultValue={editingHotel?.location}
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
                      defaultValue={editingHotel?.lat}
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
                      defaultValue={editingHotel?.lng}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagen URL</label>
                    <input
                      type="url"
                      name="image"
                      defaultValue={editingHotel?.image}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
                    <input
                      type="number"
                      name="rooms"
                      min="1"
                      defaultValue={editingHotel?.rooms}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    name="description"
                    defaultValue={editingHotel?.description}
                    required
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (separados por coma)</label>
                  <input
                    type="text"
                    name="amenities"
                    defaultValue={editingHotel?.amenities.join(', ')}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="petFriendly"
                      defaultChecked={editingHotel?.petFriendly}
                      className="mr-2"
                    />
                    <span className="text-sm">Pet Friendly</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="seaView"
                      defaultChecked={editingHotel?.seaView}
                      className="mr-2"
                    />
                    <span className="text-sm">Vista al Mar</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="couplesFriendly"
                      defaultChecked={editingHotel?.couplesFriendly}
                      className="mr-2"
                    />
                    <span className="text-sm">Parejas</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="privateParking"
                      defaultChecked={editingHotel?.privateParking}
                      className="mr-2"
                    />
                    <span className="text-sm">Parking Privado</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="privatePool"
                      defaultChecked={editingHotel?.privatePool}
                      className="mr-2"
                    />
                    <span className="text-sm">Piscina Privada</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="freeWifi"
                      defaultChecked={editingHotel?.freeWifi}
                      className="mr-2"
                    />
                    <span className="text-sm">WiFi Gratis</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="breakfastIncluded"
                      defaultChecked={editingHotel?.breakfastIncluded}
                      className="mr-2"
                    />
                    <span className="text-sm">Desayuno Incluido</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="airConditioning"
                      defaultChecked={editingHotel?.airConditioning}
                      className="mr-2"
                    />
                    <span className="text-sm">Aire Acondicionado</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="gym"
                      defaultChecked={editingHotel?.gym}
                      className="mr-2"
                    />
                    <span className="text-sm">Gimnasio</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="earlyCheckIn"
                      defaultChecked={editingHotel?.earlyCheckIn}
                      className="mr-2"
                    />
                    <span className="text-sm">Check-in Temprano</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="laundry"
                      defaultChecked={editingHotel?.laundry}
                      className="mr-2"
                    />
                    <span className="text-sm">Lavandería</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="kitchenette"
                      defaultChecked={editingHotel?.kitchenette}
                      className="mr-2"
                    />
                    <span className="text-sm">Kitchenette</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="jacuzzi"
                      defaultChecked={editingHotel?.jacuzzi}
                      className="mr-2"
                    />
                    <span className="text-sm">Jacuzzi</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="spa"
                      defaultChecked={editingHotel?.spa}
                      className="mr-2"
                    />
                    <span className="text-sm">Spa</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="balcony"
                      defaultChecked={editingHotel?.balcony}
                      className="mr-2"
                    />
                    <span className="text-sm">Balcón</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="oceanView"
                      defaultChecked={editingHotel?.oceanView}
                      className="mr-2"
                    />
                    <span className="text-sm">Vista al Océano</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="mountainView"
                      defaultChecked={editingHotel?.mountainView}
                      className="mr-2"
                    />
                    <span className="text-sm">Vista a la Montaña</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="cityView"
                      defaultChecked={editingHotel?.cityView}
                      className="mr-2"
                    />
                    <span className="text-sm">Vista a la Ciudad</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="fireplace"
                      defaultChecked={editingHotel?.fireplace}
                      className="mr-2"
                    />
                    <span className="text-sm">Chimenea</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="hotTub"
                      defaultChecked={editingHotel?.hotTub}
                      className="mr-2"
                    />
                    <span className="text-sm">Jacuzzi Exterior</span>
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
                    {editingHotel ? 'Actualizar' : 'Agregar'}
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

export default Hospedajes;
