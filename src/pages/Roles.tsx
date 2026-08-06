import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import {
  listRoles, listPermissions, createRole, updateRole, deleteRole,
  type Role, type Permission, type RolePayload, type RoleScope,
} from '../services/roles';

// CRUD de roles RBAC con asignación de permisos (agrupados por recurso) e
// herencia por roles padre. Mismo lenguaje visual sobrio que el resto de buzz.

const SCOPES: RoleScope[] = ['system', 'provider', 'user'];
const SCOPE_LABEL: Record<RoleScope, string> = { system: 'Sistema', provider: 'Proveedor', user: 'Usuario' };
const SCOPE_STYLE: Record<RoleScope, string> = {
  system: 'bg-violet-50 text-violet-700', provider: 'bg-sky-50 text-sky-700', user: 'bg-slate-100 text-slate-600',
};

const toSlug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const fieldClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';
const labelClass = 'mb-1 block text-xs font-medium text-slate-600';

const EMPTY_FORM = () => ({
  name: '', slug: '', slugTouched: false, description: '', scope: 'user' as RoleScope,
  is_superuser: false, permission_ids: [] as number[], parent_ids: [] as number[],
});
type FormState = ReturnType<typeof EMPTY_FORM>;

function Roles() {
  const { t } = useTranslation();

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM());

  const load = () => {
    setLoading(true);
    Promise.all([listRoles(), listPermissions()])
      .then(([r, p]) => { setRoles(r); setPermissions(p); setError(''); })
      .catch(() => setError(t('common.loadError', 'No se pudieron cargar los roles.')))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  // Permisos agrupados por recurso (prefijo antes de ':').
  const grouped = useMemo(() => {
    const g = new Map<string, Permission[]>();
    permissions.forEach((p) => {
      const res = p.code === '*' ? '★ global' : p.code.split(':')[0];
      (g.get(res) ?? g.set(res, []).get(res)!).push(p);
    });
    return [...g.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [permissions]);

  const roleName = (id: number) => roles.find((r) => r.id === id)?.name ?? `#${id}`;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const togglePerm = (id: number) =>
    setForm((f) => ({ ...f, permission_ids: f.permission_ids.includes(id) ? f.permission_ids.filter((x) => x !== id) : [...f.permission_ids, id] }));
  const toggleParent = (id: number) =>
    setForm((f) => ({ ...f, parent_ids: f.parent_ids.includes(id) ? f.parent_ids.filter((x) => x !== id) : [...f.parent_ids, id] }));

  const startCreate = () => { setError(''); setSuccess(''); setForm(EMPTY_FORM()); setEditingId(null); setView('form'); };
  const startEdit = (r: Role) => {
    setError(''); setSuccess('');
    setForm({
      name: r.name, slug: r.slug, slugTouched: true, description: r.description || '',
      scope: r.scope, is_superuser: r.is_superuser, permission_ids: [...r.permissions], parent_ids: [...r.parents],
    });
    setEditingId(r.id);
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    const slug = (form.slug || toSlug(form.name)).trim();
    if (!slug) { setError('El slug es obligatorio.'); return; }
    setSaving(true);
    const payload: RolePayload = {
      slug, name: form.name.trim(), description: form.description, scope: form.scope,
      is_superuser: form.is_superuser, permission_ids: form.permission_ids, parent_ids: form.parent_ids,
    };
    try {
      if (editingId) { await updateRole(editingId, payload); setSuccess('Rol actualizado.'); }
      else { await createRole(payload); setSuccess('Rol creado.'); }
      setView('list'); setEditingId(null); load();
    } catch (err) {
      const detail = (err as { response?: { data?: unknown } })?.response?.data;
      setError(typeof detail === 'string' ? detail : 'No se pudo guardar el rol. Revisa el slug (único) y los campos.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    setError('');
    try { await deleteRole(id); setDeleteId(null); setSuccess('Rol eliminado.'); load(); }
    catch (err) {
      setDeleteId(null);
      const detail = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(detail || 'No se pudo eliminar el rol.');
    }
  };

  // ── FORM ──
  if (view === 'form') {
    const otherRoles = roles.filter((r) => r.id !== editingId);
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <button type="button" onClick={() => { setView('list'); setError(''); setEditingId(null); }}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50">← Volver</button>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Icon name="shield" className="h-6 w-6 text-emerald-600" /> {editingId ? 'Editar rol' : 'Nuevo rol'}
          </h1>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Nombre *</label>
                <input value={form.name} required placeholder="Ej. Gestor de contenidos"
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slugTouched ? f.slug : toSlug(e.target.value) }))}
                  className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Slug *</label>
                <input value={form.slug} required placeholder="gestor-de-contenidos"
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }))} className={fieldClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <input value={form.description} placeholder="Para qué sirve este rol"
                onChange={(e) => set('description', e.target.value)} className={fieldClass} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Ámbito</label>
                <select value={form.scope} onChange={(e) => set('scope', e.target.value as RoleScope)} className={fieldClass}>
                  {SCOPES.map((s) => <option key={s} value={s}>{SCOPE_LABEL[s]}</option>)}
                </select>
              </div>
              <label className="flex cursor-pointer items-center gap-2 sm:mt-6">
                <input type="checkbox" checked={form.is_superuser} onChange={(e) => set('is_superuser', e.target.checked)} className="h-4 w-4 accent-violet-600" />
                <span className="text-sm font-medium text-slate-600">Superusuario</span>
                <span className="text-xs text-slate-400">(acceso total)</span>
              </label>
            </div>
          </div>

          {/* Herencia */}
          {otherRoles.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-1 text-sm font-semibold text-slate-900">Hereda de</h3>
              <p className="mb-3 text-xs text-slate-400">El rol obtiene además todos los permisos de sus roles padre.</p>
              <div className="flex flex-wrap gap-2">
                {otherRoles.map((r) => {
                  const on = form.parent_ids.includes(r.id);
                  return (
                    <button key={r.id} type="button" onClick={() => toggleParent(r.id)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${on ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-emerald-400'}`}>
                      {r.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Permisos */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Permisos</h3>
              <span className="text-xs text-slate-400">{form.permission_ids.length} seleccionados</span>
            </div>
            {form.is_superuser ? (
              <p className="rounded-lg bg-violet-50 p-3 text-sm text-violet-700">Un superusuario ya tiene acceso total; no hace falta asignar permisos.</p>
            ) : grouped.length === 0 ? (
              <p className="text-sm text-slate-400">No hay permisos en el catálogo.</p>
            ) : (
              <div className="space-y-4">
                {grouped.map(([res, perms]) => {
                  const ids = perms.map((p) => p.id);
                  const allOn = ids.every((id) => form.permission_ids.includes(id));
                  return (
                    <div key={res}>
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{res}</span>
                        <button type="button"
                          onClick={() => setForm((f) => ({ ...f, permission_ids: allOn ? f.permission_ids.filter((id) => !ids.includes(id)) : [...new Set([...f.permission_ids, ...ids])] }))}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700">{allOn ? 'Quitar todos' : 'Todos'}</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {perms.map((p) => {
                          const on = form.permission_ids.includes(p.id);
                          return (
                            <button key={p.id} type="button" onClick={() => togglePerm(p.id)} title={p.description}
                              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${on ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-400'}`}>
                              {p.code}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pb-6">
            <button type="button" onClick={() => { setView('list'); setError(''); setEditingId(null); }}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">{t('common.cancel')}</button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
              <Icon name="check" className="h-4 w-4" />
              {saving ? t('common.saving', 'Guardando…') : editingId ? t('common.save') : 'Crear rol'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── LISTA ──
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Icon name="shield" className="h-6 w-6 text-emerald-600" /> Roles y permisos
          </h1>
          <p className="mt-1 text-sm text-slate-500">{roles.length} {roles.length === 1 ? 'rol' : 'roles'} · {permissions.length} permisos</p>
        </div>
        <button type="button" onClick={startCreate}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:self-auto">
          <Icon name="plus" className="h-4 w-4" /> Nuevo rol
        </button>
      </div>

      {success && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">{t('common.loading', 'Cargando…')}</div>
      ) : roles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Icon name="shield" className="h-6 w-6" /></div>
          <h3 className="text-base font-semibold text-slate-900">No hay roles</h3>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Ámbito</th>
                <th className="px-4 py-3">Hereda de</th>
                <th className="px-4 py-3">Permisos</th>
                <th className="px-4 py-3 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800">{r.name}</p>
                      {r.is_superuser && <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">superusuario</span>}
                      {r.is_system && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">sistema</span>}
                    </div>
                    <p className="text-xs text-slate-400">{r.slug}</p>
                  </td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${SCOPE_STYLE[r.scope]}`}>{SCOPE_LABEL[r.scope]}</span></td>
                  <td className="px-4 py-3 text-slate-500">
                    <span className="block max-w-[12rem] truncate">{r.parents.length ? r.parents.map(roleName).join(', ') : '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.is_superuser ? <span className="text-violet-600">todos</span> : `${r.permission_codes.length}`}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {deleteId === r.id ? (
                      <span className="inline-flex items-center gap-2 whitespace-nowrap">
                        <button type="button" onClick={() => handleDelete(r.id)} className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600">{t('common.delete')}</button>
                        <button type="button" onClick={() => setDeleteId(null)} className="text-xs text-slate-500 hover:text-slate-800">{t('common.cancel')}</button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <button type="button" onClick={() => startEdit(r)} title={t('common.edit')}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"><Icon name="pencil" className="h-4 w-4" /></button>
                        <button type="button" onClick={() => setDeleteId(r.id)} disabled={r.is_system}
                          title={r.is_system ? 'Los roles de sistema no se pueden eliminar' : t('common.delete')}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"><Icon name="close" className="h-4 w-4" /></button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Roles;
