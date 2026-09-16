import api from './api';

// --- Shapes mirroring the DRF serializers (Phase 3 domains) ---

export interface TourBrief {
  id: number;
  name: string;
  price: string;
  image: string;
  duration: string;
}

export interface CompanyBrief {
  id: number;
  name: string;
  slug: string;
  provider_type: string;
  is_verified: boolean;
}

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';

export interface Payment {
  id: number;
  booking: number;
  provider: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  gateway_reference: string;
  gateway_session_id: string;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: number;
  tour: TourBrief | null;
  company: CompanyBrief | null;
  customer_username: string | null;
  status: BookingStatus;
  participants: number;
  scheduled_date: string | null;
  total_amount: string;
  currency: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  notes: string;
  payments: Payment[];
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: number;
  tour: TourBrief | null;
  company: CompanyBrief | null;
  author_username: string | null;
  rating: number;
  title: string;
  comment: string;
  status: ReviewStatus;
  moderated_at: string | null;
  created_at: string;
  updated_at: string;
}

// Provider scoping is applied server-side based on the authenticated user's
// company, so plain GETs already return only this provider's data.

export interface DashboardSummary {
  counts: {
    tours: number; city_tours: number; itineraries: number;
    accommodations: number; vehicles: number; bookings: number; reviews: number;
  };
  pending: { bookings: number; reviews: number };
  revenue: { paid_total: string; paid_count: number };
  avg_rating: number;
  scope: 'all' | 'company' | 'none';
}

/**
 * Contadores del panel, agregados en la base.
 *
 * Sustituye a cinco listados completos —tours, tours de ciudad, itinerarios,
 * hospedajes y vehículos— que se bajaban enteros solo para contarlos. La
 * respuesta ronda los 200 bytes.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>('/dashboard/summary/');
  return data;
}

/**
 * Reservas del panel. El aislamiento lo aplica la API sin necesidad de
 * parámetros: un proveedor solo recibe las reservas de su empresa
 * (BookingService.list_for), y los administradores las ven todas.
 */
export async function listBookings(): Promise<Booking[]> {
  const { data } = await api.get<Booking[]>('/bookings/');
  return data;
}

export async function confirmBooking(id: number): Promise<Booking> {
  const { data } = await api.post<Booking>(`/bookings/${id}/confirm/`);
  return data;
}

export async function cancelBooking(id: number): Promise<Booking> {
  const { data } = await api.post<Booking>(`/bookings/${id}/cancel/`);
  return data;
}

export async function listPayments(): Promise<Payment[]> {
  const { data } = await api.get<Payment[]>('/payments/');
  return data;
}

export interface RefundResult {
  status: PaymentStatus;
  success: boolean;
}

/** Reembolsa un pago cobrado. `amount` omitido = reembolso total.
 *  La API responde 400 si la pasarela rechaza el reembolso (el pago NO cambia
 *  de estado) y 503 si la pasarela no está configurada. */
export async function refundPayment(id: number, amount?: string): Promise<RefundResult> {
  const { data } = await api.post<RefundResult>(
    `/payments/${id}/refund/`,
    amount ? { amount } : {},
  );
  return data;
}

/**
 * Reseñas del panel: `?mine=true` limita la respuesta a la empresa del usuario.
 * Sin ese parámetro la API devuelve además todas las aprobadas de la plataforma
 * (lo que necesita el portal público, no este panel).
 */
export async function listReviews(): Promise<Review[]> {
  const { data } = await api.get<Review[]>('/reviews/', { params: { mine: 'true' } });
  return data;
}

export async function moderateReview(id: number, decision: 'approved' | 'rejected'): Promise<Review> {
  const { data } = await api.post<Review>(`/reviews/${id}/moderate/`, { decision });
  return data;
}
