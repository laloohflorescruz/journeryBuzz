interface City {
  id: number;
  name: string;
  iataCode?: string;
  languages: string[];
  latitude: number;
  longitude: number;
  population: {
    total: number;
    men: number;
    women: number;
    young: number;
    adult: number;
  };
  predominantReligion: string;
  airports: string[];
  description: string;
  currency: string;
  areaCode: string;
  country: string;
  score: number;
  likedByMembers: boolean;
  qualityOfLife: {
    internetSpeed: string;
    currentTemperature: number;
    safetyLevel: string;
    electricity: string;
    healthcare: string;
    publicWifi: string;
    friendlyToForeigners: string;
    bestTimeToVisit: string;
    recommendedDays: number;
    taxiApps: string[];
    annualVisitors: number;
    localAirlines: string[];
  };
  costOfLiving: {
    general: string;
    accommodationPerNight: number;
    dailyMeal: number;
    publicTransport: number;
    transportTypes: string[];
    dinnerPrice: number;
    breakfastPrice: number;
    airportTransfer: number;
    referencePrices: {
      cocaCola: number;
      mcBurger: number;
      beer: number;
      water: number;
      pizza: number;
    };
  };
  prosCons: {
    positives: string[];
    negatives: string[];
  };
}

const cities: City[] = [
  {
    id: 1,
    name: 'Santo Domingo',
    iataCode: 'SDQ',
    languages: ['Español'],
    latitude: 18.4861,
    longitude: -69.9311,
    population: {
      total: 965040,
      men: 470000,
      women: 495040,
      young: 250000,
      adult: 715040
    },
    predominantReligion: 'Cristianismo',
    airports: ['Aeropuerto Internacional Las Américas (SDQ)', 'Aeropuerto Internacional del Cibao (STI)'],
    description: 'Capital de la República Dominicana, conocida por su rica historia colonial y vibrante cultura.',
    currency: 'DOP (Peso Dominicano)',
    areaCode: '+1-809',
    country: 'República Dominicana',
    score: 8.5,
    likedByMembers: true,
    qualityOfLife: {
      internetSpeed: '50 Mbps promedio',
      currentTemperature: 28,
      safetyLevel: 'Moderado',
      electricity: '110V, Tipo A/B',
      healthcare: 'Bueno',
      publicWifi: 'Disponible en plazas y cafés',
      friendlyToForeigners: 'Muy amigable',
      bestTimeToVisit: 'Diciembre a Abril',
      recommendedDays: 5,
      taxiApps: ['Uber', 'DiDi', 'Taxi Seguro'],
      annualVisitors: 2500000,
      localAirlines: ['Arajet', 'Air Century']
    },
    costOfLiving: {
      general: 'Asequible',
      accommodationPerNight: 50,
      dailyMeal: 8,
      publicTransport: 0.5,
      transportTypes: ['Autobús', 'Metro', 'Taxi', 'Uber'],
      dinnerPrice: 15,
      breakfastPrice: 5,
      airportTransfer: 25,
      referencePrices: {
        cocaCola: 1,
        mcBurger: 6,
        beer: 2,
        water: 1,
        pizza: 10
      }
    },
    prosCons: {
      positives: [
        'Affordable to live',
        'Lots of fun stuff to do',
        'Warm all year round',
        'Good air quality on average',
        'Very safe for women',
        'Very family friendly'
      ],
      negatives: [
        'Way too expensive in tourist areas',
        'Feels crowded in center',
        'Traffic can be bad'
      ]
    }
  },
  {
    id: 2,
    name: 'Punta Cana',
    iataCode: 'PUJ',
    languages: ['Español', 'Inglés'],
    latitude: 18.5601,
    longitude: -68.3725,
    population: {
      total: 540538,
      men: 270000,
      women: 270538,
      young: 150000,
      adult: 390538
    },
    predominantReligion: 'Cristianismo',
    airports: ['Aeropuerto Internacional Punta Cana (PUJ)'],
    description: 'Destino turístico famoso por sus playas paradisíacas y resorts de lujo.',
    currency: 'DOP (Peso Dominicano)',
    areaCode: '+1-809',
    country: 'República Dominicana',
    score: 9.0,
    likedByMembers: true,
    qualityOfLife: {
      internetSpeed: '60 Mbps promedio',
      currentTemperature: 29,
      safetyLevel: 'Alto',
      electricity: '110V, Tipo A/B',
      healthcare: 'Excelente en resorts',
      publicWifi: 'Excelente en resorts y hoteles',
      friendlyToForeigners: 'Muy amigable',
      bestTimeToVisit: 'Diciembre a Abril',
      recommendedDays: 7,
      taxiApps: ['Uber', 'DiDi'],
      annualVisitors: 4000000,
      localAirlines: ['Arajet']
    },
    costOfLiving: {
      general: 'Moderado a alto',
      accommodationPerNight: 150,
      dailyMeal: 20,
      publicTransport: 2,
      transportTypes: ['Taxi', 'Uber', 'Autobús turístico'],
      dinnerPrice: 30,
      breakfastPrice: 10,
      airportTransfer: 30,
      referencePrices: {
        cocaCola: 2,
        mcBurger: 8,
        beer: 3,
        water: 2,
        pizza: 15
      }
    },
    prosCons: {
      positives: [
        'Lots of fun stuff to do',
        'Warm all year round',
        'Perfect humidity now',
        'Very safe for women',
        'Very family friendly',
        'Great hospitals in resorts'
      ],
      negatives: [
        'Way too expensive',
        'Feels crowded in high season',
        'Limited public transport'
      ]
    }
  }
];

export default cities;
