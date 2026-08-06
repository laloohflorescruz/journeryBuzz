import api from './api';

// Catálogo geográfico: países y ciudades (/countries/, /cities/). Gestionado por
// admin+. Las ciudades cuelgan de un país (cascada).

export interface Country {
  id: number;
  name: string;
  code: string;        // ISO opcional (máx. 3)
  is_active: boolean;
}

export interface City {
  id: number;
  name: string;
  country: number;         // id del país
  country_name?: string;   // read-only
  is_active: boolean;
}

export async function listCountries(): Promise<Country[]> {
  const { data } = await api.get<Country[]>('/countries/');
  return data;
}
export async function createCountry(payload: Partial<Country>): Promise<Country> {
  const { data } = await api.post<Country>('/countries/', payload);
  return data;
}
export async function updateCountry(id: number, payload: Partial<Country>): Promise<Country> {
  const { data } = await api.patch<Country>(`/countries/${id}/`, payload);
  return data;
}
export async function deleteCountry(id: number): Promise<void> {
  await api.delete(`/countries/${id}/`);
}

export async function listCities(countryId?: number): Promise<City[]> {
  const { data } = await api.get<City[]>('/cities/', { params: countryId ? { country_id: countryId } : {} });
  return data;
}
export async function createCity(payload: { name: string; country: number; is_active?: boolean }): Promise<City> {
  const { data } = await api.post<City>('/cities/', payload);
  return data;
}
export async function updateCity(id: number, payload: Partial<{ name: string; country: number; is_active: boolean }>): Promise<City> {
  const { data } = await api.patch<City>(`/cities/${id}/`, payload);
  return data;
}
export async function deleteCity(id: number): Promise<void> {
  await api.delete(`/cities/${id}/`);
}
