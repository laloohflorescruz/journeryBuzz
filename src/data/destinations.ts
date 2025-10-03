interface POI {
  id: number;
  name: string;
  category: string;
  activities: string[];
  description: string;
  rating: number;
  price: { local: number; tourist: number };
  photos: string[];
  latitude: number;
  longitude: number;
  travelStyles?: string[];
  environmentNature?: string[];
  infrastructureComodidades?: string[];
}

interface Destination {
  latitude: number;
  longitude: number;
  pois: POI[];
  photos: string[];
  travelStyles?: string[];
  environmentNature?: string[];
}

const destinations: Record<string, Destination> = {
  'Madrid': {
    latitude: 40.4168,
    longitude: -3.7038,
    photos: ['https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400&h=300&fit=crop&crop=center'],
    pois: [
      {
        id: 1,
        name: 'Museo del Prado',
        category: 'Cultura',
        activities: ['Tours de Ciudad'],
        description: 'Museo de arte en Madrid',
        rating: 9,
        price: { local: 15, tourist: 15 },
        photos: ['photo1.jpg'],
        latitude: 40.4138,
        longitude: -3.6921,
        travelStyles: ['Family Friendly', 'LGBTQ+ Friendly'],
        environmentNature: []
      },
      {
        id: 3,
        name: 'Hotel Ritz',
        category: 'Alojamiento',
        activities: [],
        description: 'Hotel de lujo en Madrid',
        rating: 10,
        price: { local: 200, tourist: 200 },
        photos: ['photo3.jpg'],
        latitude: 40.4169,
        longitude: -3.6939,
        travelStyles: ['Safe for Women'],
        environmentNature: [],
        infrastructureComodidades: ['Admite mascotas', 'Km desde el aeropuerto: 12', 'Centro Histórico']
      },
      {
        id: 4,
        name: 'Restaurante Botín',
        category: 'AyB',
        activities: [],
        description: 'Restaurante tradicional en Madrid',
        rating: 9,
        price: { local: 50, tourist: 50 },
        photos: ['photo4.jpg'],
        latitude: 40.4140,
        longitude: -3.7080
      },
      {
        id: 5,
        name: 'Estación de Atocha',
        category: 'Transporte',
        activities: ['Tours de Ciudad'],
        description: 'Estación de tren en Madrid',
        rating: 7,
        price: { local: 0, tourist: 0 },
        photos: ['photo5.jpg'],
        latitude: 40.4068,
        longitude: -3.6894
      }
    ]
  },
  'Barcelona': {
    latitude: 41.3851,
    longitude: 2.1734,
    photos: ['https://images.unsplash.com/photo-1583779457094-ab30f5812c4b?w=400&h=300&fit=crop&crop=center'],
    travelStyles: ['Family Friendly'],
    environmentNature: ['Near Beach', 'Near Ocean'],
    pois: [
      {
        id: 2,
        name: 'Playa de la Barceloneta',
        category: 'Naturaleza',
        activities: ['Surf', 'Senderismo'],
        description: 'Playa en Barcelona',
        rating: 8,
        price: { local: 0, tourist: 0 },
        photos: ['photo2.jpg'],
        latitude: 41.3764,
        longitude: 2.1920,
        travelStyles: ['Family Friendly', 'Safe for Women'],
        environmentNature: ['Near Beach', 'Near Ocean'],
        infrastructureComodidades: ['Ciclorruta']
      }
    ]
  },
  'Punta Cana': {
    latitude: 18.5601,
    longitude: -68.3725,
    photos: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center'],
    travelStyles: ['Family Friendly', 'Safe for Women'],
    environmentNature: ['Near Beach', 'Near Ocean', 'Island'],
    pois: [
      {
        id: 6,
        name: 'Punta Cana Beach',
        category: 'Naturaleza',
        activities: ['Surf', 'Buceo con Snorkel', 'Tours de Playa'],
        description: 'Hermosa playa en Punta Cana, República Dominicana',
        rating: 9,
        price: { local: 0, tourist: 10 },
        photos: ['punta-cana.jpg'],
        latitude: 18.5601,
        longitude: -68.3725,
        travelStyles: ['Family Friendly', 'Safe for Women'],
        environmentNature: ['Near Beach', 'Near Ocean']
      },
      {
        id: 16,
        name: 'Operador Turístico Punta Cana',
        category: 'Negocios',
        activities: ['Operadores Turísticos', 'Guías Turísticos'],
        description: 'Agencia de tours en Punta Cana para excursiones y guías',
        rating: 7,
        price: { local: 0, tourist: 0 },
        photos: ['tour-operator.jpg'],
        latitude: 18.5601,
        longitude: -68.3725
      },
      {
        id: 20,
        name: 'Cenotes de Punta Cana',
        category: 'Acuático',
        activities: ['Buceo con Snorkel', 'Exploración de Cenotes'],
        description: 'Cenotes naturales en Punta Cana para buceo y exploración',
        rating: 9,
        price: { local: 10, tourist: 25 },
        photos: ['cenotes-punta-cana.jpg'],
        latitude: 18.5601,
        longitude: -68.3725,
        travelStyles: ['Family Friendly'],
        environmentNature: ['Near Beach', 'Near Ocean'],
        infrastructureComodidades: ['Km desde el aeropuerto: 15']
      },
      {
        id: 29,
        name: 'Pesca Deportiva en Punta Cana',
        category: 'Acuático',
        activities: ['Deep-sea Pesca', 'Pesca'],
        description: 'Excursiones de pesca deportiva en alta mar',
        rating: 9,
        price: { local: 50, tourist: 100 },
        photos: ['pesca-punta-cana.jpg'],
        latitude: 18.5601,
        longitude: -68.3725
      }
    ]
  },
  'Samaná': {
    latitude: 19.2056,
    longitude: -69.3368,
    photos: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center'],
    pois: [
      {
        id: 8,
        name: 'Samaná Bay',
        category: 'Naturaleza',
        activities: ['Observación de Ballenas', 'Tours en Barco'],
        description: 'Bahía de Samaná, hogar de ballenas jorobadas en temporada',
        rating: 9,
        price: { local: 20, tourist: 50 },
        photos: ['samana-bay.jpg'],
        latitude: 19.2056,
        longitude: -69.3368
      },
      {
        id: 21,
        name: 'Tour de Observación de Ballenas - Samaná',
        category: 'Aventuras',
        activities: ['Observación de Ballenas', 'Tours en Barco'],
        description: 'Tour guiado para observar ballenas jorobadas en temporada',
        rating: 9,
        price: { local: 40, tourist: 80 },
        photos: ['whale-watching-samana.jpg'],
        latitude: 19.2056,
        longitude: -69.3368
      }
    ]
  },
  'Miches': {
    latitude: 19.0167,
    longitude: -69.0500,
    photos: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center'],
    pois: [
      {
        id: 23,
        name: 'Kayak en Río Chavón',
        category: 'Acuático',
        activities: ['Kayak', 'Rafting en Río'],
        description: 'Aventura en kayak por el río Chavón',
        rating: 8,
        price: { local: 20, tourist: 40 },
        photos: ['kayak-rio-chavon.jpg'],
        latitude: 19.0167,
        longitude: -69.0500
      },
      {
        id: 28,
        name: 'Reserva Científica Ébano Verde',
        category: 'Al Aire Libre',
        activities: ['Senderismo', 'Observación de Vida Silvestre', 'Jardines Botánicos'],
        description: 'Reserva con bosques nubosos y diversidad biológica',
        rating: 8,
        price: { local: 5, tourist: 15 },
        photos: ['ebano-verde.jpg'],
        latitude: 19.0167,
        longitude: -69.0500,
        travelStyles: ['Family Friendly'],
        environmentNature: ['Near Mountains', 'Desierto'],
        infrastructureComodidades: ['Jardín botánico']
      }
    ]
  },
  'Cusco': {
    latitude: -13.5319,
    longitude: -71.9675,
    photos: ['https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=300&fit=crop&crop=center'],
    travelStyles: ['Solo Travel'],
    environmentNature: ['Near Mountains'],
    pois: [
      {
        id: 9,
        name: 'Machu Picchu',
        category: 'Cultura',
        activities: ['Senderismo', 'Tours Históricos'],
        description: 'Antigua ciudad inca en las montañas de Perú',
        rating: 10,
        price: { local: 30, tourist: 70 },
        photos: ['machu-picchu.jpg'],
        latitude: -13.1631,
        longitude: -72.5450,
        travelStyles: ['Solo Travel'],
        environmentNature: ['Near Mountains']
      }
    ]
  },
  'Valle Sagrado': {
    latitude: -13.3333,
    longitude: -72.0000,
    photos: ['https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=300&fit=crop&crop=center'],
    pois: []
  },
  'Ciudad de México': {
    latitude: 19.4326,
    longitude: -99.1332,
    photos: ['https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&h=300&fit=crop&crop=center'],
    pois: []
  },
  'Oaxaca': {
    latitude: 17.0732,
    longitude: -96.7266,
    photos: ['https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&h=300&fit=crop&crop=center'],
    pois: []
  },
  'Puebla': {
    latitude: 19.0414,
    longitude: -98.2063,
    photos: ['https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&h=300&fit=crop&crop=center'],
    pois: []
  },
  'Buenos Aires': {
    latitude: -34.6118,
    longitude: -58.3966,
    photos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center'],
    pois: [
      {
        id: 11,
        name: 'Obelisco de Buenos Aires',
        category: 'Cultura',
        activities: ['Tours de Ciudad'],
        description: 'Monumento icónico en el centro de Buenos Aires',
        rating: 7,
        price: { local: 0, tourist: 0 },
        photos: ['obelisco-buenos-aires.jpg'],
        latitude: -34.6037,
        longitude: -58.3816
      }
    ]
  },
  'El Calafate': {
    latitude: -50.3370,
    longitude: -72.2640,
    photos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center'],
    pois: []
  },
  'Ushuaia': {
    latitude: -54.8019,
    longitude: -68.3030,
    photos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center'],
    pois: []
  }
};

export default destinations;
