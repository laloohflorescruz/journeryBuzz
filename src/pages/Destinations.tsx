import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Icon from '../components/Icon';
import { ImageUploader, GalleryUploader } from '../components/ImageUploader';
import {
  listDestinations, getDestination, createDestination, updateDestination, deleteDestination,
  type Destination, type DestinationPayload, type Region,
} from '../services/destinations';

// CRUD de destinos (campos núcleo). Diseño sobrio consistente con buzz.

interface Place { id: number; name: string }

const PAGE_SIZE = 10;

const REGIONS: { value: Region; label: string }[] = [
  { value: 'spain', label: 'España' }, { value: 'europe', label: 'Europa' },
  { value: 'caribbean', label: 'Caribe' }, { value: 'south-america', label: 'Sudamérica' },
  { value: 'americas', label: 'Américas' }, { value: 'asia', label: 'Asia' },
  { value: 'africa', label: 'África' }, { value: 'oceania', label: 'Oceanía' },
];
const REGION_LABEL: Record<string, string> = Object.fromEntries(REGIONS.map((r) => [r.value, r.label]));

const toSlug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const fieldClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';
const labelClass = 'mb-1 block text-xs font-medium text-slate-600';

const EMPTY_FORM = () => ({
  name: '', slug: '', slugTouched: false, region: '' as Region | '',
  country: '', city_id: '' as number | '',
  description: '', long_description: '', population: '',
  image: '', gallery: [] as string[],
  latitude: '', longitude: '', is_active: true, is_draft: false,
});
type FormState = ReturnType<typeof EMPTY_FORM>;

function Destinations() {
  const { t } = useTranslation();

  const [items, setItems] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM());

  const [countriesDb, setCountriesDb] = useState<Place[]>([]);
  const [citiesDb, setCitiesDb] = useState<Place[]>([]);

  const load = () => {
    setLoading(true);
    listDestinations()
      .then((data) => { setItems(data); setError(''); })
      .catch(() => setError(t('common.loadError', 'No se pudieron cargar los destinos.')))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    api.get('/countries/').then(({ data }) => setCountriesDb(data)).catch(() => setCountriesDb([]));
    // eslint-disable-next-line
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onCountryChange = (name: string) => {
    setForm((f) => ({ ...f, country: name, city_id: '' }));
    setCitiesDb([]);
    const country = countriesDb.find((c) => c.name === name);
    if (country) api.get(`/cities/?country_id=${country.id}`).then(({ data }) => setCitiesDb(data)).catch(() => setCitiesDb([]));
  };

  const startCreate = () => { setError(''); setSuccess(''); setForm(EMPTY_FORM()); setCitiesDb([]); setEditingId(null); setView('form'); };

  const startEdit = async (id: number) => {
    setError(''); setSuccess('');
    try {
      const d = await getDestination(id);
      const countryName = d.country?.name ?? '';
      setForm({
        name: d.name ?? '', slug: d.slug ?? '', slugTouched: true, region: d.region ?? '',
        country: countryName, city_id: d.city?.id ?? '',
        description: d.description ?? '', long_description: d.long_description ?? '', population: d.population ?? '',
        image: d.image ?? '', gallery: d.photos ?? [],
        latitude: d.latitude ? String(d.latitude) : '', longitude: d.longitude ? String(d.longitude) : '',
        is_active: d.is_active, is_draft: d.is_draft,
      });
      const country = countriesDb.find((c) => c.name === countryName);
      if (country) {
        try { const { data } = await api.get(`/cities/?country_id=${country.id}`); setCitiesDb(data); } catch { setCitiesDb([]); }
      }
      setEditingId(id); setView('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { setError('No se pudo cargar el destino para editar.'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true);
    const payload: DestinationPayload = {
      name: form.name.trim(),
      slug: (form.slug || toSlug(form.name)).trim(),
      region: form.region,
      country_id: null,
      city_id: form.city_id === '' ? null : Number(form.city_id),
      description: form.description,
      long_description: form.long_description,
      population: form.population,
      image: form.image,
      photos: form.gallery.filter(Boolean),
      latitude: Number(form.latitude) || 0,
      longitude: Number(form.longitude) || 0,
      is_active: form.is_active,
      is_draft: form.is_draft,
    };
    const country = countriesDb.find((c) => c.name === form.country);
    payload.country_id = country ? country.id : null;
    try {
      if (editingId) { await updateDestination(editingId, payload); setSuccess('Destino actualizado.'); }
      else { await createDestination(payload); setSuccess('Destino creado.'); }
      setView('list'); setEditingId(null); load();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const detail = (err as { response?: { data?: unknown } })?.response?.data;
      setError(typeof detail === 'string' ? detail : 'No se pudo guardar el destino. Revisa el nombre/slug (únicos).');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    setError('');
    try { await deleteDestination(id); setDeleteId(null); setSuccess('Destino eliminado.'); load(); }
    catch { setDeleteId(null); setError('No se pudo eliminar el destino.'); }
  };

  const filtered = items.filter((d) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || (d.country?.name ?? '').toLowerCase().includes(q);
    const matchRegion = !filterRegion || d.region === filterRegion;
    return matchSearch && matchRegion;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltered = !!search.trim() || !!filterRegion;

  // ── FORM ──
  if (view === 'form') {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <button type="button" onClick={() => { setView('list'); setError(''); setEditingId(null); }}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50">← Volver</button>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Icon name="pin" className="h-6 w-6 text-emerald-600" /> {editingId ? 'Editar destino' : 'Nuevo destino'}
          </h1>
          {editingId && <span className="text-sm text-slate-400">ID #{editingId}</span>}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Nombre *</label>
                <input value={form.name} required placeholder="Ej. Santo Domingo"
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slugTouched ? f.slug : toSlug(e.target.value) }))} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input value={form.slug} placeholder="santo-domingo"
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }))} className={fieldClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Región</label>
                <select value={form.region} onChange={(e) => set('region', e.target.value as Region | '')} className={fieldClass}>
                  <option value="">— Región —</option>
                  {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>País</label>
                <select value={form.country} onChange={(e) => onCountryChange(e.target.value)} className={fieldClass}>
                  <option value="">— País —</option>
                  {countriesDb.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Ciudad</label>
                <select value={form.city_id} disabled={!form.country} onChange={(e) => set('city_id', e.target.value ? Number(e.target.value) : '')}
                  className={`${fieldClass} disabled:bg-slate-50 disabled:text-slate-400`}>
                  <option value="">{form.country ? '— Ciudad —' : 'Elige país'}</option>
                  {citiesDb.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Descripción breve</label>
              <input value={form.description} placeholder="Resumen de una línea" onChange={(e) => set('description', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Descripción larga</label>
              <textarea value={form.long_description} rows={4} placeholder="Describe el destino…" onChange={(e) => set('long_description', e.target.value)} className={fieldClass} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Población</label>
                <input value={form.population} placeholder="Ej. 3.5M" onChange={(e) => set('population', e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Latitud</label>
                <input type="number" step="any" value={form.latitude} placeholder="18.4861" onChange={(e) => set('latitude', e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Longitud</label>
                <input type="number" step="any" value={form.longitude} placeholder="-69.9312" onChange={(e) => set('longitude', e.target.value)} className={fieldClass} />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <ImageUploader label="Imagen principal" value={form.image} folder="destinations" onChange={(url) => set('image', url)} />
              <div className="mt-4">
                <label className={labelClass}>Galería</label>
                <GalleryUploader items={form.gallery} folder="destinations" onChange={(urls) => set('gallery', urls)} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 border-t border-slate-100 pt-5">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="h-4 w-4 accent-emerald-600" />
                <span className="text-sm font-medium text-slate-600">{t('common.active')}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={form.is_draft} onChange={(e) => set('is_draft', e.target.checked)} className="h-4 w-4 accent-amber-500" />
                <span className="text-sm font-medium text-slate-600">Borrador</span>
                <span className="text-xs text-slate-400">(no visible en el sitio público)</span>
              </label>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3 pb-6">
            <button type="button" onClick={() => { setView('list'); setError(''); setEditingId(null); }}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">{t('common.cancel')}</button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
              <Icon name="check" className="h-4 w-4" />
              {saving ? t('common.saving', 'Guardando…') : editingId ? t('common.save') : 'Crear destino'}
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
            <Icon name="pin" className="h-6 w-6 text-emerald-600" /> Destinos
          </h1>
          <p className="mt-1 text-sm text-slate-500">{filtered.length} {filtered.length === 1 ? 'destino' : 'destinos'}{isFiltered ? ' (filtrados)' : ' en total'}</p>
        </div>
        <button type="button" onClick={startCreate}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:self-auto">
          <Icon name="plus" className="h-4 w-4" /> Nuevo destino
        </button>
      </div>

      {success && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por nombre o país…"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <select value={filterRegion} onChange={(e) => { setFilterRegion(e.target.value); setCurrentPage(1); }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-56">
          <option value="">Todas las regiones</option>
          {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">{t('common.loading', 'Cargando…')}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Icon name="pin" className="h-6 w-6" /></div>
          <h3 className="text-base font-semibold text-slate-900">{items.length === 0 ? 'Aún no hay destinos' : 'Ningún destino coincide con el filtro'}</h3>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Destino</th><th className="px-4 py-3">Región</th><th className="px-4 py-3">País</th><th className="px-4 py-3">{t('common.status')}</th><th className="px-4 py-3 text-right">{t('common.actions')}</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {d.image && <img src={d.image} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />}
                        </div>
                        <p className="min-w-0 font-medium text-slate-800">{d.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.region ? REGION_LABEL[d.region] : '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{d.country?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${d.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{d.is_active ? t('common.active') : t('common.inactive')}</span>
                        {d.is_draft && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">Borrador</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {deleteId === d.id ? (
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <button type="button" onClick={() => handleDelete(d.id)} className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600">{t('common.delete')}</button>
                          <button type="button" onClick={() => setDeleteId(null)} className="text-xs text-slate-500 hover:text-slate-800">{t('common.cancel')}</button>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <button type="button" onClick={() => startEdit(d.id)} title={t('common.edit')} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"><Icon name="pencil" className="h-4 w-4" /></button>
                          <button type="button" onClick={() => setDeleteId(d.id)} title={t('common.delete')} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"><Icon name="close" className="h-4 w-4" /></button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button type="button" onClick={() => setCurrentPage((p) => p - 1)} disabled={page === 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent">{t('common.previous')}</button>
              <span className="text-sm text-slate-500">{t('common.pageOf', { current: page, total: totalPages })}</span>
              <button type="button" onClick={() => setCurrentPage((p) => p + 1)} disabled={page === totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent">{t('common.next')}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Destinations;
