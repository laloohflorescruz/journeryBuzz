import api from './api';

// CRUD de itinerarios contra /itineraries/. La API es IsAdminOrReadOnly: las
// lecturas son públicas y solo un admin (o superior) puede escribir. Los
// itinerarios acompañan a tours/destinos, por eso no tienen recurso RBAC propio.

export type Difficulty = 'Fácil' | 'Moderado' | 'Difícil';

export interface Itinerary {
  id: number;
  title: string;
  description: string;
  // La app pide días, no fechas concretas; start/end son opcionales.
  duration: number;
  start_date: string | null;
  end_date: string | null;
  destinations: string[];
  // Slug normalizado de una categoría de la BD (ej. 'cultural', 'aventura').
  category: string;
  difficulty: Difficulty;
  highlights: string[];
  tips: string[];
  // Nombre de icono del set compartido (Icon.tsx), no un emoji.
  image: string;
  latitude: number;
  longitude: number;
}

export type ItineraryPayload = Omit<Itinerary, 'id'>;

export async function listItineraries(): Promise<Itinerary[]> {
  const { data } = await api.get<Itinerary[]>('/itineraries/');
  return data;
}

export async function getItinerary(id: number): Promise<Itinerary> {
  const { data } = await api.get<Itinerary>(`/itineraries/${id}/`);
  return data;
}

export async function createItinerary(payload: ItineraryPayload): Promise<Itinerary> {
  const { data } = await api.post<Itinerary>('/itineraries/', payload);
  return data;
}

export async function updateItinerary(id: number, payload: ItineraryPayload): Promise<Itinerary> {
  const { data } = await api.put<Itinerary>(`/itineraries/${id}/`, payload);
  return data;
}

export async function deleteItinerary(id: number): Promise<void> {
  await api.delete(`/itineraries/${id}/`);
}
