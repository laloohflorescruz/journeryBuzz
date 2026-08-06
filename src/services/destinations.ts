import api from './api';

// Destinos (/destinations/). Escritura solo superadmin (IsSuperAdminOrReadOnly).
// Versión enfocada a los campos núcleo del catálogo; los campos codificados
// (idioma/moneda/mejor época) se gestionan aparte y no se tocan aquí.

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
  country: Place | null;
  city: (Place & { country_name?: string }) | null;
}

export interface DestinationPayload {
  name: string;
  slug?: string;
  description?: string;
  long_description?: string;
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
}

export async function listDestinations(): Promise<Destination[]> {
  // ?all=true intenta incluir borradores para la gestión (el backend lo ignora
  // si no aplica; para superadmin la lista debería venir completa).
  const { data } = await api.get<Destination[]>('/destinations/', { params: { all: true } });
  return data;
}
export async function getDestination(id: number): Promise<Destination> {
  const { data } = await api.get<Destination>(`/destinations/${id}/`);
  return data;
}
export async function createDestination(payload: DestinationPayload): Promise<Destination> {
  const { data } = await api.post<Destination>('/destinations/', payload);
  return data;
}
export async function updateDestination(id: number, payload: DestinationPayload): Promise<Destination> {
  const { data } = await api.patch<Destination>(`/destinations/${id}/`, payload);
  return data;
}
export async function deleteDestination(id: number): Promise<void> {
  await api.delete(`/destinations/${id}/`);
}
