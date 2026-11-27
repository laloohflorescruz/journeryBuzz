import api from './api';

/** Estado de moderación que fija la API (el cliente no lo escribe). */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';


// Destinos (/destinations/) propuestos por el socio. El editor de
// Destinations.tsx cubre la ficha completa (la del panel admin salvo valoración
// y atracciones destacadas, que fija la plataforma al revisar).

export type Region = 'spain' | 'europe' | 'caribbean' | 'south-america' | 'americas' | 'asia' | 'africa' | 'oceania';

interface Place { id: number; name: string }

export interface Destination {
  id: number;
  name: string;
  slug: string | null;
  description: string;
  long_description: string;
  image: string;
  photos: string[];
  latitude: number;
  longitude: number;
  region: Region | '';
  rating: number;
  reviews: number;
  population: string;
  is_active: boolean;
  is_draft: boolean;
  featured_info?: string;
  visitors_per_year?: number | null;
  language?: string;
  currency?: string;
  best_time?: number;
  timezone?: number | null;
  iata_code?: string;
  climate_advice?: string;
  environment_nature?: string[];
  cost_of_living?: CostOfLiving;
  quality_of_life?: QualityOfLife;
  pros_cons?: ProsCons;
  travel_styles?: { id: number; name_es: string; name_en: string }[];
  categories?: { id: number; name_es: string; name_en: string }[];
  approval_status?: ApprovalStatus;
  approval_note?: string;
  submitted_by_username?: string | null;
  country: Place | null;
  city: (Place & { country_name?: string }) | null;
  weather?: Partial<Record<Season, Partial<WeatherSeason>>>;
  practical_info?: Partial<PracticalInfo>;
  itineraries?: ItineraryDay[];
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export interface WeatherSeason { temp: string; description: string; ideal_for: string[] }
export interface PracticalInfo { transportation: Record<string, string>; accommodation: Record<string, string>; food: Record<string, string> }
export interface ScheduleItem { time: string; activity: string; description: string; lat: string; lng: string; [k: string]: unknown }
export interface ItineraryDay { day: number; title: string; description: string; schedule: ScheduleItem[] }

/** Bloques estructurados de la ficha del destino (mismas formas que la API). */
export interface CostOfLiving {
  general?: string; accommodation_per_night?: string; daily_meal?: string;
  public_transport?: string; dinner?: string; breakfast?: string;
  airport_transfer?: string; coca_cola?: string; mc_burger?: string; pizza?: string;
}
export interface QualityOfLife {
  internet_speed?: string; safety_level?: string; electricity?: string; healthcare?: string;
  public_wifi?: string; friendly_to_foreigners?: string; recommended_days?: string;
}
export interface ProsCons { positives: string[]; negatives: string[] }

export interface DestinationPayload {
  name: string;
  slug?: string;
  description?: string;
  long_description?: string;
  /** Datos destacados (HTML del editor enriquecido). */
  featured_info?: string;
  /** Ficha técnica. */
  visitors_per_year?: number | null;
  language?: string;
  currency?: string;
  /** Mejor época: máscara de bits de los 12 meses. */
  best_time?: number;
  /** Zona horaria en minutos de desfase. */
  timezone?: number | null;
  iata_code?: string;
  climate_advice?: string;
  environment_nature?: string[];
  cost_of_living?: CostOfLiving;
  quality_of_life?: QualityOfLife;
  pros_cons?: ProsCons;
  travel_style_ids?: number[];
  category_ids?: number[];
  image?: string;
  photos?: string[];
  latitude?: number;
  longitude?: number;
  region?: Region | '';
  population?: string;
  is_active?: boolean;
  is_draft?: boolean;
  country_id?: number | null;
  city_id?: number | null;
  weather?: Record<Season, WeatherSeason>;
  practical_info?: PracticalInfo;
  itineraries?: ItineraryDay[];
}

export async function listDestinations(): Promise<Destination[]> {
  // `mine=true`: el proveedor solo ve los destinos que propuso, para seguir su
  // estado. El catálogo se gestiona en el panel admin.
  // `view=list`: la tabla solo pinta foto, nombre, región, país y estado.
  const { data } = await api.get<Destination[]>(
    '/destinations/', { params: { all: true, mine: 'true', view: 'list' } },
  );
  return data;
}
export async function createDestination(payload: DestinationPayload): Promise<Destination> {
  const { data } = await api.post<Destination>('/destinations/', payload);
  return data;
}
export async function getDestination(id: number): Promise<Destination> {
  const { data } = await api.get<Destination>(`/destinations/${id}/`);
  return data;
}
export async function updateDestination(id: number, payload: DestinationPayload): Promise<Destination> {
  const { data } = await api.patch<Destination>(`/destinations/${id}/`, payload);
  return data;
}
