// Piezas comunes de los formularios de tours (Tours.tsx y CityTours.tsx): son
// el mismo modelo Tour, así que comparten pestañas, opciones, plantillas por
// defecto y el mapeo API → formulario. Lo propio de cada pantalla (tipo de
// tour, POIs vinculados) se añade encima en cada página.

export interface Category { id: number; name_en: string; name_es: string; icon: string }
export interface Activity { id: number; name_en: string; name_es: string; icon: string }
export interface Penalty { window: string; penalty: string; refund: string; tone: 'ok' | 'warn' | 'bad' }
export interface AvailableDate { date: string; spots: number }
export interface ItineraryStep { time: string; activity: string; description: string }

/** Campos del tour que devuelve la API y que usan los dos formularios. */
export interface ApiTourBase {
  id: number; name: string; description: string; about: string;
  city: string; country: string; duration: string; price: string;
  prices?: { adult?: string; child?: string; senior?: string };
  difficulty: string; max_group: number; best_for: string; best_season: string;
  languages: string[]; image: string; gallery: string[];
  latitude: number; longitude: number; is_active: boolean;
  itinerary: ItineraryStep[]; highlights: string[]; includes: string[]; not_includes?: string[];
  departure_time?: string | null; return_time?: string | null; meeting_point?: string;
  what_to_bring: string[]; recommendations: string[]; not_suitable_for: string[];
  conditions: string[]; penalties: Penalty[]; available_dates: AvailableDate[];
  payment_options: number[];
  categories: { id: number }[]; activities: { id: number }[];
}

export type FormTab = 'resumen' | 'detalles' | 'multimedia' | 'itinerario' | 'incluye' | 'politicas';
export const TABS: { key: FormTab; label: string }[] = [
  { key: 'resumen', label: '📋 Resumen' },
  { key: 'detalles', label: '⏱️ Detalles' },
  { key: 'multimedia', label: '🖼️ Multimedia' },
  { key: 'itinerario', label: '🗺️ Itinerario' },
  { key: 'incluye', label: '✅ Incluye' },
  { key: 'politicas', label: '📄 Políticas' },
];

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Fácil', icon: 'hiking' },
  { value: 'moderate', label: 'Moderada', icon: 'compass' },
  { value: 'hard', label: 'Difícil', icon: 'mountain' },
  { value: 'extreme', label: 'Alta', icon: 'climb' },
];
// Deben coincidir con los filtros "Ideal para" y "Época" de la app (backpacking-app CityTours).
export const BEST_FOR_OPTIONS = [
  'Familias con niños', 'Parejas', 'Grupos de amigos', 'Viajeros solitarios',
  'Estudiantes', 'Aventureros', 'Amantes de la comida', 'Aficionados a la cultura',
];
export const SEASON_OPTIONS = [
  'Todo el año', 'Primavera (Mar-May)', 'Verano (Jun-Ago)', 'Otoño (Sep-Nov)', 'Invierno (Dic-Feb)',
];
// Idiomas que se ofrecen en el formulario del tour.
export const COMMON_LANGS = [
  { value: 'es', label: 'Español' }, { value: 'en', label: 'Inglés' },
  { value: 'pt', label: 'Portugués' }, { value: 'fr', label: 'Francés' },
  { value: 'de', label: 'Alemán' }, { value: 'it', label: 'Italiano' },
  { value: 'nl', label: 'Neerlandés' }, { value: 'ca', label: 'Catalán' },
];

// Plantillas por defecto de la sección "Incluye" (el creador las puede editar/eliminar).
const DEFAULT_INCLUDES = [
  'Guía profesional',
  'Entradas a los sitios indicados',
  'Transporte local',
  'Agua embotellada',
];
const DEFAULT_WHAT_TO_BRING = [
  'Documento de identidad o pasaporte',
  'Agua y protector solar',
  'Ropa y calzado cómodos',
  'Cámara de fotos',
  'Efectivo para gastos personales',
];
const DEFAULT_RECOMMENDATIONS = [
  'Llega puntual al punto de encuentro para no retrasar al grupo.',
  'Usa calzado cómodo; el recorrido incluye tramos a pie.',
  'Mantente hidratado y protégete del sol, sobre todo en verano.',
  'Respeta las indicaciones del guía y las normas de cada lugar.',
];
const DEFAULT_NOT_SUITABLE = [
  'Personas con movilidad reducida (el recorrido incluye tramos a pie y escaleras).',
  'Mujeres embarazadas.',
  'Menores de 6 años.',
  'Personas con afecciones cardíacas o respiratorias graves.',
];
const DEFAULT_CONDITIONS = [
  'Confirmación inmediata al reservar; recibirás un voucher por correo electrónico.',
  'Preséntate en el punto de encuentro 15 minutos antes de la hora de inicio.',
];
const DEFAULT_PENALTIES: Penalty[] = [
  { window: 'Más de 7 días antes', penalty: 'Sin penalidad', refund: 'Reembolso del 100%', tone: 'ok' },
  { window: 'Entre 3 y 7 días antes', penalty: 'Penalidad del 50%', refund: 'Reembolso parcial', tone: 'warn' },
  { window: 'Menos de 48 h o no presentarse', penalty: 'Penalidad del 100%', refund: 'Sin reembolso', tone: 'bad' },
];

/** Estado inicial común del formulario de tour. */
export const EMPTY_TOUR_FORM = {
  name: '', description: '', about: '', city: '', country: '',
  duration: '', price: '', priceChild: '', priceSenior: '', difficulty: 'easy', maxGroup: 10,
  image: '', latitude: '', longitude: '', category: '',
  isActive: true,
  bestFor: [] as string[],
  bestSeason: [] as string[],
  languages: [] as string[],
  activities: [] as number[],
  gallery: [] as string[],
  highlights: [''],
  includes: [...DEFAULT_INCLUDES],
  notIncludes: [''],
  // Horario: hora de salida y de regreso (HH:MM) y punto de encuentro.
  departureTime: '', returnTime: '', meetingPoint: '',
  whatToBring: [...DEFAULT_WHAT_TO_BRING],
  recommendations: [...DEFAULT_RECOMMENDATIONS],
  notSuitableFor: [...DEFAULT_NOT_SUITABLE],
  conditions: [...DEFAULT_CONDITIONS],
  itinerary: [{ time: '', activity: '', description: '' }] as ItineraryStep[],
  penalties: DEFAULT_PENALTIES.map((p) => ({ ...p })),
  availableDates: [{ date: '', spots: 10 }] as AvailableDate[],
  paymentOptions: [25, 50, 100] as number[],
};

// Mapea un tour de la API al estado del formulario (para editar).
const toList = (a?: string[]) => (a && a.length ? a : ['']);
const splitCsv = (s?: string) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : []);
export function tourToFormBase(t: ApiTourBase): typeof EMPTY_TOUR_FORM {
  return {
    name: t.name || '', description: t.description || '', about: t.about || '',
    city: t.city || '', country: t.country || '',
    duration: t.duration || '', price: t.prices?.adult || t.price || '',
    priceChild: t.prices?.child || '', priceSenior: t.prices?.senior || '',
    difficulty: t.difficulty || 'easy', maxGroup: t.max_group || 10,
    image: t.image || '', latitude: t.latitude != null ? String(t.latitude) : '', longitude: t.longitude != null ? String(t.longitude) : '',
    category: t.categories?.[0]?.id ? String(t.categories[0].id) : '',
    isActive: t.is_active ?? true,
    bestFor: splitCsv(t.best_for), bestSeason: splitCsv(t.best_season),
    languages: t.languages || [],
    activities: (t.activities || []).map((a) => a.id),
    gallery: t.gallery || [],
    highlights: toList(t.highlights), includes: toList(t.includes), notIncludes: toList(t.not_includes),
    departureTime: (t.departure_time || '').slice(0, 5), returnTime: (t.return_time || '').slice(0, 5),
    meetingPoint: t.meeting_point || '',
    whatToBring: toList(t.what_to_bring), recommendations: toList(t.recommendations),
    notSuitableFor: toList(t.not_suitable_for), conditions: toList(t.conditions),
    itinerary: t.itinerary?.length ? t.itinerary : [{ time: '', activity: '', description: '' }],
    penalties: t.penalties?.length ? t.penalties : DEFAULT_PENALTIES.map((p) => ({ ...p })),
    availableDates: t.available_dates?.length ? t.available_dates : [{ date: '', spots: 10 }],
    paymentOptions: t.payment_options?.length ? t.payment_options : [25, 50, 100],
  };
}
