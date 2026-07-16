import api from './api';
import type { CompanyBrief } from './resources';

// --- Tour catalog (Phase 4: buzz providers publish their own tours) ---
//
// The DRF `Tour` model is the backing entity for what providers publish
// (tours, excursions, hospedajes = tour_type 'hotels', city tours = 'city',
// etc.). Provider scoping is applied server-side: `?mine=true` returns only
// the authenticated company's rows, and creates auto-assign the owning
// company. See api/tenancy.py.

export type TourType =
  | 'adventure' | 'cultural' | 'nature' | 'beach' | 'city' | 'hotels' | 'poi' | '';

export type Difficulty = 'easy' | 'moderate' | 'hard' | 'extreme' | '';

/** Shape returned by TourSerializer (read side, subset used by buzz). */
export interface Penalty { window: string; penalty: string; refund: string; tone: 'ok' | 'warn' | 'bad' }
export interface AvailableDate { date: string; spots: number }
export interface ItineraryStep { time: string; activity: string; description: string }
export interface TourPrices { adult?: string; child?: string; senior?: string }
/** POI compacto embebido en un tour (relación Tour↔POI). */
export interface PoiBrief { id: number; name: string; slug: string }

export interface Tour {
  id: number;
  name: string;
  description: string;
  about: string;
  city: string;
  country: string;
  duration: string;
  duration_hours: number | null;
  price: string;
  prices: TourPrices;
  rating: number;
  reviews: number;
  max_group: number;
  languages: string[];
  image: string;
  gallery: string[];
  difficulty: Difficulty;
  best_for: string;
  best_season: string;
  latitude: number;
  longitude: number;
  tour_type: TourType;
  includes: string[];
  what_to_bring: string[];
  highlights: string[];
  recommendations: string[];
  not_suitable_for: string[];
  conditions: string[];
  penalties: Penalty[];
  available_dates: AvailableDate[];
  payment_options: number[];
  itinerary: ItineraryStep[];
  is_active: boolean;
  company: CompanyBrief | null;
  categories: { id: number }[];
  activities: { id: number }[];
  pois: PoiBrief[];
  creator_contact: { id: number } | null;
  created_at: string;
  updated_at: string;
}

/** Writable fields accepted by the serializer on create/update. */
export interface TourPayload {
  name: string;
  description?: string;
  about?: string;
  city?: string;
  country?: string;
  duration?: string;
  price?: string;
  prices?: TourPrices;
  rating?: number;
  reviews?: number;
  max_group?: number;
  image?: string;
  gallery?: string[];
  difficulty?: Difficulty;
  best_for?: string;
  best_season?: string;
  languages?: string[];
  latitude?: number;
  longitude?: number;
  tour_type?: TourType;
  includes?: string[];
  what_to_bring?: string[];
  highlights?: string[];
  recommendations?: string[];
  not_suitable_for?: string[];
  conditions?: string[];
  penalties?: Penalty[];
  available_dates?: AvailableDate[];
  payment_options?: number[];
  itinerary?: ItineraryStep[];
  is_active?: boolean;
  destination_id?: number | null;
  category_ids?: number[];
  activity_ids?: number[];
  poi_ids?: number[];
}

/** Provider's own tours (server scopes to the caller's company). */
export async function listMyTours(): Promise<Tour[]> {
  const { data } = await api.get<Tour[]>('/tours/', { params: { mine: 'true' } });
  return data;
}

/** Provider's own city tours only. */
export async function listMyCityTours(): Promise<Tour[]> {
  const { data } = await api.get<Tour[]>('/tours/', { params: { mine: 'true', tour_type: 'city' } });
  return data;
}

export async function getTour(id: number): Promise<Tour> {
  const { data } = await api.get<Tour>(`/tours/${id}/`);
  return data;
}

export async function createTour(payload: TourPayload): Promise<Tour> {
  const { data } = await api.post<Tour>('/tours/', payload);
  return data;
}

export async function updateTour(id: number, payload: TourPayload): Promise<Tour> {
  const { data } = await api.patch<Tour>(`/tours/${id}/`, payload);
  return data;
}

export async function deleteTour(id: number): Promise<void> {
  await api.delete(`/tours/${id}/`);
}
