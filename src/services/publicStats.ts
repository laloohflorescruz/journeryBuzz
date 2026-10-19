import { API_BASE } from './api';

// Cifras públicas del catálogo para el login (`/api/public/stats/`): no pide
// sesión y la API las sirve cacheadas. Solo cuenta lo publicado en el portal.

export interface TopDestination {
  name: string;
  slug: string;
  image: string;
  rating: number;
  country: string;
  region: string;
  pois: number;
}

export interface PublicStats {
  counts: { destinations: number; pois: number; tours: number; companies: number; countries: number };
  average_rating: number;
  top_destinations: TopDestination[];
}

/** null si la API no responde: el login se pinta igual, sin cifras. */
export async function fetchPublicStats(signal?: AbortSignal): Promise<PublicStats | null> {
  try {
    const res = await fetch(`${API_BASE}/public/stats/`, { signal });
    if (!res.ok) return null;
    return (await res.json()) as PublicStats;
  } catch {
    return null;
  }
}
