import api from './api';

// CRUD de hospedajes (API: /accommodations/).
// El tenant (company) lo fija el servidor a partir del usuario autenticado;
// nunca se envía desde el cliente. Ver AccommodationService en la API.

export type AccommodationType = 'hotel' | 'hostel' | 'apartment' | 'dorm' | 'villa';

/** Banderas de comodidades: el mismo set que el modelo de la API. */
export const AMENITY_FLAGS = [
  'pet_friendly', 'sea_view', 'couples_friendly', 'private_parking',
  'private_pool', 'free_wifi', 'breakfast_included', 'air_conditioning',
  'gym', 'early_check_in', 'laundry', 'kitchenette', 'jacuzzi', 'spa',
  'balcony', 'ocean_view', 'mountain_view', 'city_view', 'fireplace', 'hot_tub',
] as const;

export type AmenityFlag = (typeof AMENITY_FLAGS)[number];

export interface CityRef { id: number; name: string; country_name?: string }
export interface CompanyRef { id: number; name: string }

export type Accommodation = {
  id: number;
  name: string;
  accommodation_type: AccommodationType | '';
  description: string;
  location: string;
  city: CityRef | null;
  latitude: number;
  longitude: number;
  price_per_night: string;
  currency: string;
  rating: number;
  reviews: number;
  rooms: number;
  image: string;
  gallery: string[];
  amenities: string[];
  company: CompanyRef | null;
  creator_contact: { id: number; username: string } | null;
  last_edited_by_username: string | null;
  is_active: boolean;
  is_draft: boolean;
  created_at: string | null;
  updated_at: string | null;
} & Record<AmenityFlag, boolean>;

/** Campos que acepta la API al crear/editar (company se ignora: la fija el servidor). */
export type AccommodationPayload = Partial<
  Omit<Accommodation, 'id' | 'city' | 'company' | 'creator_contact' | 'last_edited_by_username' | 'created_at' | 'updated_at'>
> & { city_id?: number | null };

const list = (d: unknown): Accommodation[] =>
  Array.isArray(d) ? d : ((d as { results?: Accommodation[] })?.results ?? []);

/** `mine` = solo los hospedajes de la empresa del usuario (scoping server-side). */
export async function listAccommodations(params: { mine?: boolean } = {}): Promise<Accommodation[]> {
  const { data } = await api.get('/accommodations/', {
    params: params.mine ? { mine: 'true' } : undefined,
  });
  return list(data);
}

export async function getAccommodation(id: number): Promise<Accommodation> {
  const { data } = await api.get<Accommodation>(`/accommodations/${id}/`);
  return data;
}

export async function createAccommodation(payload: AccommodationPayload): Promise<Accommodation> {
  const { data } = await api.post<Accommodation>('/accommodations/', payload);
  return data;
}

export async function updateAccommodation(id: number, payload: AccommodationPayload): Promise<Accommodation> {
  const { data } = await api.put<Accommodation>(`/accommodations/${id}/`, payload);
  return data;
}

export async function deleteAccommodation(id: number): Promise<void> {
  await api.delete(`/accommodations/${id}/`);
}
