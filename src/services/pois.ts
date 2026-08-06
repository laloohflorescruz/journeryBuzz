import api from './api';

// POIs (/pois/): catálogo de puntos de interés. La escritura exige permiso RBAC
// poi:* (superadmin lo tiene) + propiedad. Versión enfocada a campos núcleo;
// los editores profundos (admisión multimoneda, horarios) quedan para después.

interface Place { id: number; name: string }
interface CategoryRef { id: number; name_en: string; name_es: string; icon: string }

export interface POI {
  id: number;
  name: string;
  slug: string | null;
  category: CategoryRef | null;
  description: string;
  location: string;
  image: string;
  photos: string[];
  latitude: number;
  longitude: number;
  is_national_park: boolean;
  is_unesco: boolean;
  is_active: boolean;
  rating: number;
  country: Place | null;
  city: Place | null;
}

export interface POIPayload {
  name: string;
  slug?: string;
  category_id: number;
  description: string;
  location?: string;
  image?: string;
  photos?: string[];
  latitude?: number;
  longitude?: number;
  is_national_park?: boolean;
  is_unesco?: boolean;
  is_active?: boolean;
  country_id?: number | null;
  city_id?: number | null;
}

export async function listPois(): Promise<POI[]> {
  const { data } = await api.get<POI[]>('/pois/');
  return data;
}
export async function getPoi(id: number): Promise<POI> {
  const { data } = await api.get<POI>(`/pois/${id}/`);
  return data;
}
export async function createPoi(payload: POIPayload): Promise<POI> {
  const { data } = await api.post<POI>('/pois/', payload);
  return data;
}
export async function updatePoi(id: number, payload: POIPayload): Promise<POI> {
  const { data } = await api.patch<POI>(`/pois/${id}/`, payload);
  return data;
}
export async function deletePoi(id: number): Promise<void> {
  await api.delete(`/pois/${id}/`);
}
