import api from './api';

/** Estado de moderación que fija la API (el cliente no lo escribe). */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';


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
  featured_info?: string;
  operator?: string;
  admission?: { free?: boolean; tiers?: { currency?: string; adult?: string }[]; notes?: string[] };
  tips?: string[];
  activities?: { id: number; name_es: string; name_en: string }[];
  travel_styles?: { id: number; name_es: string; name_en: string }[];
  destination?: number | null;
  approval_status?: ApprovalStatus;
  approval_note?: string;
  submitted_by_username?: string | null;
  rating: number;
  country: Place | null;
  city: Place | null;
}

export interface POIPayload {
  name: string;
  slug?: string;
  category_id: number;
  description: string;
  /** Datos destacados (HTML del editor enriquecido). */
  featured_info?: string;
  /** Qué se puede hacer allí y a qué estilo de viaje encaja. */
  activity_ids?: number[];
  travel_style_ids?: number[];
  /** Destino al que pertenece (lo puede asignar el administrador al revisar). */
  destination?: number | null;
  /** Quién opera el lugar. */
  operator?: string;
  /** Precio de entrada: {free, tiers:[{currency, adult}], notes:[]} */
  admission?: Record<string, unknown>;
  /** Consejos para el visitante. */
  tips?: string[];
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

/**
  * Listado del panel del proveedor: `?mine=true` devuelve solo lo que él (o su
  * empresa) ha propuesto. El catálogo completo se gestiona en el panel admin.
  */
export async function listPois(): Promise<POI[]> {
  const { data } = await api.get<POI[]>('/pois/', { params: { mine: 'true' } });
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
