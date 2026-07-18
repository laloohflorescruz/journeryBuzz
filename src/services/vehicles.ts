import api from './api';

// CRUD de vehículos de alquiler (API: /vehicles/).
// El tenant (company) lo fija el servidor a partir del usuario autenticado;
// nunca se envía desde el cliente. Ver VehicleService en la API.

export type VehicleCategory = 'economy' | 'premium';
export type Transmission = 'manual' | 'automatic';
export type Fuel = 'gasoline' | 'diesel' | 'hybrid' | 'electric';

export interface CityRef { id: number; name: string; country_name?: string }
export interface CompanyRef { id: number; name: string }

export interface Vehicle {
  id: number;
  name: string;
  vehicle_type: string;
  category: VehicleCategory | '';
  transmission: Transmission | '';
  fuel: Fuel | '';
  seats: number;
  doors: number;
  year: number | null;
  color: string;
  consumption: string;
  price_per_day: string;
  currency: string;
  image: string;
  gallery: string[];
  features: string[];
  location: string;
  city: CityRef | null;
  rating: number;
  reviews: number;
  company: CompanyRef | null;
  creator_contact: { id: number; username: string } | null;
  last_edited_by_username: string | null;
  is_active: boolean;
  is_draft: boolean;
  created_at: string | null;
  updated_at: string | null;
}

/** Campos que acepta la API al crear/editar (company se ignora: la fija el servidor). */
export type VehiclePayload = Partial<
  Omit<Vehicle, 'id' | 'city' | 'company' | 'creator_contact' | 'last_edited_by_username' | 'created_at' | 'updated_at'>
> & { city_id?: number | null };

const list = (d: unknown): Vehicle[] =>
  Array.isArray(d) ? d : ((d as { results?: Vehicle[] })?.results ?? []);

/** `mine` = solo la flota de la empresa del usuario (los admins reciben todo). */
export async function listVehicles(params: { mine?: boolean } = {}): Promise<Vehicle[]> {
  const { data } = await api.get('/vehicles/', {
    params: params.mine ? { mine: 'true' } : undefined,
  });
  return list(data);
}

export async function getVehicle(id: number): Promise<Vehicle> {
  const { data } = await api.get<Vehicle>(`/vehicles/${id}/`);
  return data;
}

export async function createVehicle(payload: VehiclePayload): Promise<Vehicle> {
  const { data } = await api.post<Vehicle>('/vehicles/', payload);
  return data;
}

export async function updateVehicle(id: number, payload: VehiclePayload): Promise<Vehicle> {
  const { data } = await api.put<Vehicle>(`/vehicles/${id}/`, payload);
  return data;
}

export async function deleteVehicle(id: number): Promise<void> {
  await api.delete(`/vehicles/${id}/`);
}
