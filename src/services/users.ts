import api from './api';

// Gestión de usuarios (/users/). La lista exige admin+; ver detalle, editar y
// eliminar exige superadmin. El cambio de rol solo lo permite un superadmin.
// Buzz es superadmin-only, así que todas las acciones están disponibles aquí.

export type UserRole = 'superadmin' | 'admin' | 'provider' | 'customer';

export interface UserProfileBrief {
  id: number;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
  profile: UserProfileBrief | null;
}

export interface UserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  is_active?: boolean;
  profile?: { role?: UserRole };
}

export async function listUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>('/users/');
  return data;
}

export async function updateUser(id: number, payload: UserPayload): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/users/${id}/`, payload);
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}/`);
}
