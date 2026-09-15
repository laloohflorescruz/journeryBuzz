import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Icon, { resolveIcon } from '../components/Icon';
import ApprovalBadge, { ApprovalNotice } from '../components/ApprovalBadge';
import { ImageUploader, GalleryUploader } from '../components/ImageUploader';
import RichTextEditor from '../components/RichTextEditor';
import {
  listPois, getPoi, createPoi, updatePoi, deletePoi,
  type POI, type POIPayload,
} from '../services/pois';

// CRUD de POIs (campos núcleo): identidad, categoría, geografía, multimedia y
// distinciones. Diseño sobrio consistente con buzz.

interface Place { id: number; name: string }
interface NamedCatalog { id: number; name_en: string; name_es: string; is_active?: boolean }
interface CategoryDb { id: number; name_en: string; name_es: string; icon: string; is_active: boolean }

const PAGE_SIZE = 10;

const toSlug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const fieldClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';
const labelClass = 'mb-1 block text-xs font-medium text-slate-600';

const toggleId = (list: number[], id: number) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

// Selector múltiple en forma de etiquetas, igual que en el perfil de usuario.
function ChipPicker({ label, options, selected, onToggle }: {
  label: string;
  options: { id: number; name_es: string; name_en: string; is_active?: boolean }[];
  selected: number[];
  onToggle: (id: number) => void;
}) {
  const visible = options.filter((o) => o.is_active !== false);
  return (
    <div>
      <label className={labelClass}>
        {label} {selected.length > 0 && <span className="font-normal text-slate-400">· {selected.length}</span>}
      </label>
      {visible.length === 0 ? (
        <p className="text-sm text-slate-400">Sin opciones disponibles.</p>
      ) : (
        <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/60 p-2">
          {visible.map((o) => {
            const on = selected.includes(o.id);
            return (
              <button key={o.id} type="button" onClick={() => onToggle(o.id)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                }`}>
                {o.name_es || o.name_en}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = () => ({
  name: '', slug: '', slugTouched: false, category_id: '' as number | '',
  country: '', city_id: '' as number | '',
  description: '', location: '',
  image: '', gallery: [] as string[],
  latitude: '', longitude: '',
  is_national_park: false, is_unesco: false, is_active: true,
  // Campos que antes no se podían capturar desde este panel.
  featured_info: '',
  activity_ids: [] as number[],
  travel_style_ids: [] as number[],
  operator: '',
  admission_free: false,
  admission_currency: 'DOP',
  admission_adult: '',
  tips: [] as string[],
});
type FormState = ReturnType<typeof EMPTY_FORM>;

function POIs() {
  const { t, i18n } = useTranslation();
  const en = i18n.language.startsWith('en');

  const [items, setItems] = useState<POI[]>([]);
  const [categories, setCategories] = useState<CategoryDb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<number | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM());

  const [activitiesDb, setActivitiesDb] = useState<NamedCatalog[]>([]);
  const [stylesDb, setStylesDb] = useState<NamedCatalog[]>([]);
  const [countriesDb, setCountriesDb] = useState<Place[]>([]);
  const [citiesDb, setCitiesDb] = useState<Place[]>([]);

  const catName = (c: CategoryDb) => (en ? c.name_en : c.name_es) || c.name_es || c.name_en;

  const load = () => {
    setLoading(true);
    listPois()
      .then((data) => { setItems(data); setError(''); })
      .catch(() => setError(t('common.loadError', 'No se pudieron cargar los POIs.')))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    api.get('/categories/').then(({ data }) => setCategories(data)).catch(() => setCategories([]));
    api.get('/countries/').then(({ data }) => setCountriesDb(data)).catch(() => setCountriesDb([]));
    // Actividades y estilos de viaje salen de la BD (regla del proyecto).
    // Solo los tipos genéricos: las actividades comerciales (kind='venue') no son etiquetas.
    api.get('/activities/', { params: { kind: 'type', brief: '1' } })
      .then(({ data }) => setActivitiesDb(data)).catch(() => setActivitiesDb([]));
    api.get('/travel-styles/').then(({ data }) => setStylesDb(data)).catch(() => setStylesDb([]));
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
      const p = await getPoi(id);
      const countryName = p.country?.name ?? '';
      setForm({
        name: p.name ?? '', slug: p.slug ?? '', slugTouched: true, category_id: p.category?.id ?? '',
        country: countryName, city_id: p.city?.id ?? '',
        description: p.description ?? '', location: p.location ?? '',
        image: p.image ?? '', gallery: p.photos ?? [],
        latitude: p.latitude ? String(p.latitude) : '', longitude: p.longitude ? String(p.longitude) : '',
        is_national_park: p.is_national_park, is_unesco: p.is_unesco, is_active: p.is_active,
        featured_info: p.featured_info ?? '',
        activity_ids: (p.activities ?? []).map((a) => a.id),
        travel_style_ids: (p.travel_styles ?? []).map((t) => t.id),
        operator: p.operator ?? '',
        admission_free: !!p.admission?.free,
        admission_currency: p.admission?.tiers?.[0]?.currency || 'DOP',
        admission_adult: p.admission?.tiers?.[0]?.adult || '',
        tips: p.tips ?? [],
      });
      const country = countriesDb.find((c) => c.name === countryName);
      if (country) { try { const { data } = await api.get(`/cities/?country_id=${country.id}`); setCitiesDb(data); } catch { setCitiesDb([]); } }
      setEditingId(id); setView('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { setError('No se pudo cargar el POI para editar.'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    if (form.category_id === '') { setError('La categoría es obligatoria.'); return; }
    setSaving(true);
    const country = countriesDb.find((c) => c.name === form.country);
    const payload: POIPayload = {
      name: form.name.trim(),
      slug: (form.slug || toSlug(form.name)).trim() || undefined,
      category_id: Number(form.category_id),
      description: form.description,
      location: form.location,
      image: form.image,
      photos: form.gallery.filter(Boolean),
      latitude: Number(form.latitude) || 0,
      longitude: Number(form.longitude) || 0,
      is_national_park: form.is_national_park,
      is_unesco: form.is_unesco,
      is_active: form.is_active,
      country_id: country ? country.id : null,
      city_id: form.city_id === '' ? null : Number(form.city_id),
      featured_info: form.featured_info,
      activity_ids: form.activity_ids,
      travel_style_ids: form.travel_style_ids,
      operator: form.operator.trim(),
      tips: form.tips.map((t) => t.trim()).filter(Boolean),
      // La entrada se guarda con la misma forma que espera la API:
      // {free, tiers:[{currency, adult}]}. Sin importe, solo se marca si es gratis.
      admission: form.admission_free
        ? { free: true, tiers: [] }
        : form.admission_adult.trim()
          ? { free: false, tiers: [{ currency: form.admission_currency, adult: form.admission_adult.trim() }] }
          : { free: false, tiers: [] },
    };
    try {
      if (editingId) { await updatePoi(editingId, payload); setSuccess('POI actualizado.'); }
      else { await createPoi(payload); setSuccess('POI creado.'); }
      setView('list'); setEditingId(null); load();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const detail = (err as { response?: { data?: unknown } })?.response?.data;
      setError(typeof detail === 'string' ? detail : 'No se pudo guardar el POI. Revisa los campos obligatorios.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    setError('');
    try { await deletePoi(id); setDeleteId(null); setSuccess('POI eliminado.'); load(); }
    catch { setDeleteId(null); setError('No se pudo eliminar el POI.'); }
  };

  // Una propuesta solo se puede corregir mientras el administrador no la haya
  // revisado; lo aprobado se gestiona desde el panel admin.
  const canEdit = (p: POI) => p.approval_status === 'pending' || p.approval_status === 'rejected';

  const filtered = items.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.location ?? '').toLowerCase().includes(q) || (p.city?.name ?? '').toLowerCase().includes(q);
    const matchCat = !filterCat || p.category?.id === filterCat;
    return matchSearch && matchCat;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltered = !!search.trim() || !!filterCat;

  const catLabel = (p: POI) => {
    if (!p.category) return '—';
    return (en ? p.category.name_en : p.category.name_es) || p.category.name_es || p.category.name_en;
  };

  // ── FORM ──
  if (view === 'form') {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <button type="button" onClick={() => { setView('list'); setError(''); setEditingId(null); }}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50">← Volver</button>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Icon name="pin" className="h-6 w-6 text-emerald-600" /> {editingId ? 'Corregir propuesta' : 'Proponer punto de interés'}
          </h1>
          {editingId && <span className="text-sm text-slate-400">ID #{editingId}</span>}
        </div>

        {!editingId && <ApprovalNotice noun="el punto de interés" />}
        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Nombre *</label>
                <input value={form.name} required placeholder="Ej. Faro a Colón"
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slugTouched ? f.slug : toSlug(e.target.value) }))} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Categoría *</label>
                <select value={form.category_id} required onChange={(e) => set('category_id', e.target.value ? Number(e.target.value) : '')} className={fieldClass}>
                  <option value="">— Categoría —</option>
                  {categories.filter((c) => c.is_active).map((c) => <option key={c.id} value={c.id}>{catName(c)}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <label className={labelClass}>Ubicación (texto)</label>
              <input value={form.location} placeholder="Ej. Av. España, Santo Domingo Este" onChange={(e) => set('location', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea value={form.description} rows={4} placeholder="Describe el punto de interés…" onChange={(e) => set('description', e.target.value)} className={fieldClass} />
            </div>

            <div>
              <label className={labelClass}>Datos destacados <span className="font-normal text-slate-400">(lo que no debe perderse el visitante)</span></label>
              <RichTextEditor value={form.featured_info} onChange={(v) => set('featured_info', v)} placeholder="Horario recomendado, qué llevar, detalles que marcan la diferencia…" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Operador <span className="font-normal text-slate-400">(quién gestiona el lugar)</span></label>
                <input value={form.operator} placeholder="Ej. Ministerio de Medio Ambiente" onChange={(e) => set('operator', e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Entrada</label>
                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm text-slate-600">
                    <input type="checkbox" checked={form.admission_free}
                      onChange={(e) => set('admission_free', e.target.checked)} className="h-4 w-4 accent-emerald-600" />
                    Gratis
                  </label>
                  <select value={form.admission_currency} disabled={form.admission_free}
                    onChange={(e) => set('admission_currency', e.target.value)}
                    className={`${fieldClass} w-24 disabled:bg-slate-50 disabled:text-slate-400`}>
                    <option value="DOP">DOP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <input type="number" min="0" step="0.01" value={form.admission_adult} disabled={form.admission_free}
                    placeholder="Importe adulto"
                    onChange={(e) => set('admission_adult', e.target.value)}
                    className={`${fieldClass} disabled:bg-slate-50 disabled:text-slate-400`} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ChipPicker
                label="Actividades"
                options={activitiesDb}
                selected={form.activity_ids}
                onToggle={(id) => set('activity_ids', toggleId(form.activity_ids, id))}
              />
              <ChipPicker
                label="Estilos de viaje"
                options={stylesDb}
                selected={form.travel_style_ids}
                onToggle={(id) => set('travel_style_ids', toggleId(form.travel_style_ids, id))}
              />
            </div>

            <div>
              <label className={labelClass}>Consejos para el visitante</label>
              <div className="space-y-2">
                {form.tips.map((tip, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={tip} placeholder="Ej. Lleva calzado cerrado"
                      onChange={(e) => set('tips', form.tips.map((x, idx) => (idx === i ? e.target.value : x)))}
                      className={fieldClass} />
                    <button type="button" onClick={() => set('tips', form.tips.filter((_, idx) => idx !== i))}
                      className="rounded-lg px-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
                      <Icon name="close" className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => set('tips', [...form.tips, ''])}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900">
                  <Icon name="plus" className="h-4 w-4" /> Añadir consejo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:max-w-md">
              <div>
                <label className={labelClass}>Latitud</label>
                <input type="number" step="any" value={form.latitude} placeholder="18.4761" onChange={(e) => set('latitude', e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Longitud</label>
                <input type="number" step="any" value={form.longitude} placeholder="-69.8674" onChange={(e) => set('longitude', e.target.value)} className={fieldClass} />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <ImageUploader label="Imagen principal" value={form.image} folder="pois" onChange={(url) => set('image', url)} />
              <div className="mt-4">
                <label className={labelClass}>Galería</label>
                <GalleryUploader items={form.gallery} folder="pois" onChange={(urls) => set('gallery', urls)} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 border-t border-slate-100 pt-5">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="h-4 w-4 accent-emerald-600" />
                <span className="text-sm font-medium text-slate-600">{t('common.active')}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={form.is_national_park} onChange={(e) => set('is_national_park', e.target.checked)} className="h-4 w-4 accent-emerald-600" />
                <span className="text-sm font-medium text-slate-600">Parque nacional</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={form.is_unesco} onChange={(e) => set('is_unesco', e.target.checked)} className="h-4 w-4 accent-emerald-600" />
                <span className="text-sm font-medium text-slate-600">Sitio UNESCO</span>
              </label>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3 pb-6">
            <button type="button" onClick={() => { setView('list'); setError(''); setEditingId(null); }}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">{t('common.cancel')}</button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
              <Icon name="check" className="h-4 w-4" />
              {saving ? t('common.saving', 'Guardando…') : editingId ? t('common.save') : 'Crear POI'}
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
            <Icon name="pin" className="h-6 w-6 text-emerald-600" /> Mis propuestas de POI
          </h1>
          <p className="mt-1 text-sm text-slate-500">{filtered.length} {filtered.length === 1 ? 'punto de interés' : 'puntos de interés'}{isFiltered ? ' (filtrados)' : ' en total'}</p>
        </div>
        <button type="button" onClick={startCreate}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:self-auto">
          <Icon name="plus" className="h-4 w-4" /> Proponer POI
        </button>
      </div>

      {success && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por nombre, ubicación o ciudad…"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <select value={filterCat} onChange={(e) => { setFilterCat(e.target.value ? Number(e.target.value) : ''); setCurrentPage(1); }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-56">
          <option value="">Todas las categorías</option>
          {categories.filter((c) => c.is_active).map((c) => <option key={c.id} value={c.id}>{catName(c)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">{t('common.loading', 'Cargando…')}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Icon name="pin" className="h-6 w-6" /></div>
          <h3 className="text-base font-semibold text-slate-900">{items.length === 0 ? 'Aún no hay POIs' : 'Ningún POI coincide con el filtro'}</h3>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">POI</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Ciudad</th><th className="px-4 py-3">{t('common.status')}</th><th className="px-4 py-3 text-right">{t('common.actions')}</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800">{p.name}</p>
                          {(p.is_unesco || p.is_national_park) && (
                            <p className="truncate text-xs text-slate-400">{[p.is_unesco && 'UNESCO', p.is_national_park && 'Parque nacional'].filter(Boolean).join(' · ')}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        {p.category?.icon && <Icon name={resolveIcon(p.category.icon)} className="h-4 w-4 text-slate-400" />}
                        {catLabel(p)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.city?.name || p.country?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{p.is_active ? t('common.active') : t('common.inactive')}</span>
                        <ApprovalBadge status={p.approval_status} note={p.approval_note} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {deleteId === p.id ? (
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <button type="button" onClick={() => handleDelete(p.id)} className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600">{t('common.delete')}</button>
                          <button type="button" onClick={() => setDeleteId(null)} className="text-xs text-slate-500 hover:text-slate-800">{t('common.cancel')}</button>
                        </span>
                      ) : (
                        canEdit(p) ? (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <button type="button" onClick={() => startEdit(p.id)} title="Corregir propuesta" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"><Icon name="pencil" className="h-4 w-4" /></button>
                            <button type="button" onClick={() => setDeleteId(p.id)} title="Retirar propuesta" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"><Icon name="close" className="h-4 w-4" /></button>
                          </span>
                        ) : (
                          <span className="whitespace-nowrap text-xs text-slate-400">Aprobado · lo gestiona el administrador</span>
                        )
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

export default POIs;
