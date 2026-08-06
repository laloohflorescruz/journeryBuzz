import api from './api';

// RBAC: catálogo de permisos y roles dinámicos (/permissions/, /roles/).
// Gestionado por admin+. Los roles de sistema (is_system) no se pueden eliminar.

export interface Permission {
  id: number;
  code: string;         // 'resource:action', ej. 'tour:create'
  description: string;
}

export type RoleScope = 'system' | 'provider' | 'user';

export interface Role {
  id: number;
  slug: string;
  name: string;
  description: string;
  scope: RoleScope;
  is_system: boolean;
  is_superuser: boolean;
  permissions: number[];        // ids de permisos propios
  parents: number[];            // ids de roles padre
  permission_codes: string[];   // permisos efectivos (con herencia), read-only
}

export interface RolePayload {
  slug: string;
  name: string;
  description?: string;
  scope: RoleScope;
  is_superuser?: boolean;
  permission_ids: number[];
  parent_ids: number[];
}

export async function listPermissions(): Promise<Permission[]> {
  const { data } = await api.get<Permission[]>('/permissions/');
  return data;
}

export async function listRoles(): Promise<Role[]> {
  const { data } = await api.get<Role[]>('/roles/');
  return data;
}

export async function createRole(payload: RolePayload): Promise<Role> {
  const { data } = await api.post<Role>('/roles/', payload);
  return data;
}

export async function updateRole(id: number, payload: RolePayload): Promise<Role> {
  const { data } = await api.put<Role>(`/roles/${id}/`, payload);
  return data;
}

export async function deleteRole(id: number): Promise<void> {
  await api.delete(`/roles/${id}/`);
}
