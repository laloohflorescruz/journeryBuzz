const pois = [
  {
    id: 1,
    name: 'Museo del Prado',
    category: 'Cultura',
    activities: ['Tours de Ciudad'],
    description: 'Museo de arte en Madrid',
    rating: 9,
    price: { local: 15, tourist: 15 },
    location: 'Madrid, España',
    photos: ['photo1.jpg']
  },
  {
    id: 2,
    name: 'Playa de la Barceloneta',
    category: 'Naturaleza',
    activities: ['Surfing', 'Senderismo'],
    description: 'Playa en Barcelona',
    rating: 8,
    price: { local: 0, tourist: 0 },
    location: 'Barcelona, España',
    photos: ['photo2.jpg']
  },
  {
    id: 3,
    name: 'Hotel Ritz',
    category: 'Alojamiento',
    activities: [],
    description: 'Hotel de lujo en Madrid',
    rating: 10,
    price: { local: 200, tourist: 200 },
    location: 'Madrid, España',
    photos: ['photo3.jpg']
  },
  {
    id: 4,
    name: 'Restaurante Botín',
    category: 'AyB',
    activities: [],
    description: 'Restaurante tradicional en Madrid',
    rating: 9,
    price: { local: 50, tourist: 50 },
    location: 'Madrid, España',
    photos: ['photo4.jpg']
  },
  {
    id: 5,
    name: 'Estación de Atocha',
    category: 'Transporte',
    activities: ['Tours de Ciudad'],
    description: 'Estación de tren en Madrid',
    rating: 7,
    price: { local: 0, tourist: 0 },
    location: 'Madrid, España',
    photos: ['photo5.jpg']
  }
];

export default pois;
