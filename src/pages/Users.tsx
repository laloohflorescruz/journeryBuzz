import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import {
  listUsers, updateUser, deleteUser,
  type AdminUser, type UserPayload, type UserRole,
} from '../services/users';

// Gestión de usuarios para el superadmin: listar, editar (nombre/email/estado/rol)
// y eliminar. Mismo lenguaje visual sobrio que Tours/Hospedajes.

const PAGE_SIZE = 12;

const ROLES: UserRole[] = ['superadmin', 'admin', 'provider', 'customer'];
const ROLE_LABEL: Record<UserRole, string> = {
  superadmin: 'Superadmin', admin: 'Administrador', provider: 'Proveedor', customer: 'Cliente',
};
const ROLE_STYLE: Record<UserRole, string> = {
  superadmin: 'bg-violet-50 text-violet-700',
  admin: 'bg-emerald-50 text-emerald-700',
  provider: 'bg-sky-50 text-sky-700',
  customer: 'bg-slate-100 text-slate-600',
};

const fmtDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString('es', { dateStyle: 'medium' }) : '—');
const roleOf = (u: AdminUser): UserRole => u.profile?.role || 'customer';
const fullName = (u: AdminUser) => `${u.first_name} ${u.last_name}`.trim();

const fieldClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';
const labelClass = 'mb-1 block text-xs font-medium text-slate-600';

function Users() {
  const { t } = useTranslation();
  const { user: me } = useAuth();

  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', is_active: true, role: 'customer' as UserRole });

  const load = () => {
    setLoading(true);
    listUsers()
      .then((data) => { setItems(data); setError(''); })
      .catch(() => setError(t('common.loadError', 'No se pudieron cargar los usuarios.')))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const startEdit = (u: AdminUser) => {
    setError(''); setSuccess('');
    setForm({
      first_name: u.first_name || '', last_name: u.last_name || '', email: u.email || '',
      is_active: u.is_active, role: roleOf(u),
    });
    setEditing(u);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true); setError('');
    const payload: UserPayload = {
      first_name: form.first_name, last_name: form.last_name, email: form.email,
      is_active: form.is_active, profile: { role: form.role },
    };
    try {
      await updateUser(editing.id, payload);
      setSuccess(`Usuario ${editing.username} actualizado.`);
      setEditing(null);
      load();
    } catch (err) {
      const detail = (err as { response?: { data?: unknown } })?.response?.data;
      setError(typeof detail === 'string' ? detail : 'No se pudo actualizar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError('');
    try {
      await deleteUser(id);
      setDeleteId(null);
      setSuccess('Usuario eliminado.');
      load();
    } catch (err) {
      setDeleteId(null);
      const detail = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(detail || 'No se pudo eliminar el usuario.');
    }
  };

  const filtered = useMemo(() => items.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) || fullName(u).toLowerCase().includes(q);
    const matchRole = !filterRole || roleOf(u) === filterRole;
    return matchSearch && matchRole;
  }), [items, search, filterRole]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltered = !!search.trim() || !!filterRole;

  // ── FORM (edición) ──
  if (editing) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <button type="button" onClick={() => { setEditing(null); setError(''); }}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50">
            ← Volver
          </button>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Icon name="user" className="h-6 w-6 text-emerald-600" /> Editar usuario
          </h1>
          <span className="text-sm text-slate-400">@{editing.username}</span>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Nombre</label>
                <input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Apellido</label>
                <input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} className={fieldClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={fieldClass} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Rol</label>
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))} className={fieldClass}
                  disabled={me?.id === editing.id}>
                  {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                </select>
                {me?.id === editing.id && <p className="mt-1 text-xs text-slate-400">No puedes cambiar tu propio rol.</p>}
              </div>
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2 pb-2">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="h-4 w-4 accent-emerald-600" />
                  <span className="text-sm font-medium text-slate-600">Cuenta activa</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button type="button" onClick={() => { setEditing(null); setError(''); }}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
              <Icon name="check" className="h-4 w-4" />
              {saving ? t('common.saving', 'Guardando…') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── LISTA ──
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
          <Icon name="users" className="h-6 w-6 text-emerald-600" /> Usuarios
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {filtered.length} {filtered.length === 1 ? 'usuario' : 'usuarios'}{isFiltered ? ' (filtrados)' : ' en total'}
        </p>
      </div>

      {success && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por usuario, email o nombre…"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value as UserRole | ''); setCurrentPage(1); }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-56">
          <option value="">Todos los roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">{t('common.loading', 'Cargando…')}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon name="users" className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {items.length === 0 ? 'No hay usuarios' : 'Ningún usuario coincide con el filtro'}
          </h3>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Alta</th>
                  <th className="px-4 py-3 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((u) => {
                  const role = roleOf(u);
                  const isSelf = me?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                            {(u.username[0] || '?').toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800">{fullName(u) || u.username}</p>
                            <p className="truncate text-xs text-slate-400">@{u.username}{isSelf ? ' · tú' : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600"><span className="block max-w-[16rem] truncate">{u.email || '—'}</span></td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_STYLE[role]}`}>{ROLE_LABEL[role]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {u.is_active ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{fmtDate(u.date_joined)}</td>
                      <td className="px-4 py-3 text-right">
                        {deleteId === u.id ? (
                          <span className="inline-flex items-center gap-2 whitespace-nowrap">
                            <button type="button" onClick={() => handleDelete(u.id)} className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600">{t('common.delete')}</button>
                            <button type="button" onClick={() => setDeleteId(null)} className="text-xs text-slate-500 hover:text-slate-800">{t('common.cancel')}</button>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <button type="button" onClick={() => startEdit(u)} title={t('common.edit')}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600">
                              <Icon name="pencil" className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => setDeleteId(u.id)} disabled={isSelf}
                              title={isSelf ? 'No puedes eliminar tu cuenta' : t('common.delete')}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400">
                              <Icon name="close" className="h-4 w-4" />
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button type="button" onClick={() => setCurrentPage((p) => p - 1)} disabled={page === 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent">
                {t('common.previous')}
              </button>
              <span className="text-sm text-slate-500">{t('common.pageOf', { current: page, total: totalPages })}</span>
              <button type="button" onClick={() => setCurrentPage((p) => p + 1)} disabled={page === totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent">
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Users;
