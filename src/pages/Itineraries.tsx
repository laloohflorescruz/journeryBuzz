import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Icon, { resolveIcon } from '../components/Icon';
import IconSelect, { type IconOption } from '../components/IconSelect';
import { dateRangeError } from '../lib/dateRange';
import { apiErrorMessage } from '../lib/apiError';
import {
  listItineraries, getItinerary, createItinerary, updateItinerary, deleteItinerary,
  type Itinerary, type ItineraryPayload, type Difficulty,
} from '../services/itineraries';

// CRUD de itinerarios conectado a /itineraries/. Mismo lenguaje visual sobrio
// que Hospedajes/Tours: lista + formulario a página completa (sin modal), datos
// reales y escritura reservada a admin (la API es IsAdminOrReadOnly).

interface CategoryDb { id: number; name_en: string; name_es: string; icon: string; is_active: boolean }

const PAGE_SIZE = 10;

const DIFFICULTIES: Difficulty[] = ['Fácil', 'Moderado', 'Difícil'];
const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  'Fácil': 'bg-emerald-50 text-emerald-700',
  'Moderado': 'bg-amber-50 text-amber-700',
  'Difícil': 'bg-rose-50 text-rose-700',
};

// Iconos representativos sugeridos (set compartido Icon.tsx). El modelo guarda
// el nombre del icono, no un emoji; por defecto 'landmark'.
const IMAGE_ICONS: IconOption[] = [
  { value: 'landmark', label: 'Monumento', icon: 'landmark' },
  { value: 'map', label: 'Mapa', icon: 'map' },
  { value: 'mountain', label: 'Montaña', icon: 'mountain' },
  { value: 'beach', label: 'Playa', icon: 'beach' },
  { value: 'waves', label: 'Costa / mar', icon: 'waves' },
  { value: 'tree', label: 'Naturaleza', icon: 'tree' },
  { value: 'tent', label: 'Acampada', icon: 'tent' },
  { value: 'hiking', label: 'Senderismo', icon: 'hiking' },
  { value: 'compass', label: 'Aventura', icon: 'compass' },
  { value: 'globe', label: 'Mundo', icon: 'globe' },
  { value: 'city', label: 'Ciudad', icon: 'city' },
  { value: 'church', label: 'Religioso', icon: 'church' },
  { value: 'camera', label: 'Fotografía', icon: 'camera' },
  { value: 'plane', label: 'Vuelo', icon: 'plane' },
  { value: 'ticket', label: 'Cultura / espectáculo', icon: 'ticket' },
  { value: 'star', label: 'Destacado', icon: 'star' },
];

// Slug normalizado de una categoría (ej. 'Aventura y naturaleza' → 'aventura-y-naturaleza').
const toSlug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const fieldClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';
const labelClass = 'mb-1 block text-xs font-medium text-slate-600';

const EMPTY_FORM = () => ({
  title: '', description: '', category: '', difficulty: 'Fácil' as Difficulty,
  duration: '', start_date: '', end_date: '',
  destinations: [] as string[], highlights: [] as string[], tips: [] as string[],
  image: 'landmark', latitude: '', longitude: '',
});
type FormState = ReturnType<typeof EMPTY_FORM>;

// Editor de lista de textos (destinos, destacados, consejos): mismo patrón que
// los servicios en Hospedajes.
function StringList({ label, hint, items, placeholder, onChange }: {
  label: string; hint?: string; items: string[]; placeholder: string;
  onChange: (v: string[]) => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <label className={labelClass}>{label}{hint && <span className="ml-1 font-normal text-slate-400">{hint}</span>}</label>
      <div className="space-y-2">
        {items.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input value={v} className={fieldClass} placeholder={placeholder}
              onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="rounded-lg px-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...items, ''])}
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
          <Icon name="plus" className="h-4 w-4" /> {t('common.add')}
        </button>
      </div>
    </div>
  );
}

function Itineraries() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  // La API exige admin (o superior) para escribir; sin ello no ofrecemos acciones.
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.profile?.role === 'superadmin';

  const [view, setView] = useState<'list' | 'form'>('list');
  const [items, setItems] = useState<Itinerary[]>([]);
  const [categories, setCategories] = useState<CategoryDb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM());

  const load = () => {
    setLoading(true);
    listItineraries()
      .then((data) => { setItems(data); setError(''); })
      .catch(() => setError(t('common.loadError', 'No se pudieron cargar los itinerarios.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // Categorías siempre desde la BD (regla del proyecto), nunca lista fija.
    api.get('/categories/').then(({ data }) => setCategories(data)).catch(() => setCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const catName = (c: CategoryDb) => (i18n.language.startsWith('en') ? c.name_en : c.name_es) || c.name_es || c.name_en;
  // Opciones de categoría desde la BD, con su icono; el valor guardado es el slug.
  const categoryOptions = useMemo<IconOption[]>(() => {
    const opts = categories
      .filter((c) => c.is_active)
      .map((c) => ({ value: toSlug(catName(c)), label: catName(c), icon: c.icon }));
    // Si el itinerario en edición tiene una categoría que ya no existe, la conservamos visible.
    if (form.category && !opts.some((o) => o.value === form.category)) {
      opts.unshift({ value: form.category, label: form.category, icon: 'tag' });
    }
    return opts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, form.category, i18n.language]);

  const categoryLabel = (slug: string) => categoryOptions.find((o) => o.value === slug)?.label || slug || '—';

  const startCreate = () => {
    setError(''); setSuccess('');
    setForm(EMPTY_FORM());
    setEditingId(null);
    setView('form');
  };

  const startEdit = async (id: number) => {
    setError(''); setSuccess('');
    try {
      const it = await getItinerary(id);
      setForm({
        title: it.title ?? '', description: it.description ?? '',
        category: it.category ?? '', difficulty: it.difficulty || 'Fácil',
        duration: it.duration ? String(it.duration) : '',
        start_date: it.start_date ?? '', end_date: it.end_date ?? '',
        destinations: it.destinations ?? [], highlights: it.highlights ?? [], tips: it.tips ?? [],
        image: it.image || 'landmark',
        latitude: it.latitude ? String(it.latitude) : '', longitude: it.longitude ? String(it.longitude) : '',
      });
      setEditingId(id);
      setView('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('No se pudo cargar el itinerario para editar.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.title.trim()) { setError('El título es obligatorio.'); return; }
    // Regla de negocio: la fecha de inicio no puede ser posterior a la de fin.
    const rangeError = dateRangeError(form.start_date, form.end_date);
    if (rangeError) { setError(rangeError); return; }
    setSaving(true);
    const payload: ItineraryPayload = {
      title: form.title.trim(),
      description: form.description,
      category: form.category,
      difficulty: form.difficulty,
      duration: Number(form.duration) || 0,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      destinations: form.destinations.map((d) => d.trim()).filter(Boolean),
      highlights: form.highlights.map((h) => h.trim()).filter(Boolean),
      tips: form.tips.map((tp) => tp.trim()).filter(Boolean),
      image: form.image || 'landmark',
      latitude: Number(form.latitude) || 0,
      longitude: Number(form.longitude) || 0,
    };
    try {
      if (editingId) {
        await updateItinerary(editingId, payload);
        setSuccess('Itinerario actualizado correctamente.');
      } else {
        await createItinerary(payload);
        setSuccess('Itinerario creado correctamente.');
      }
      setView('list');
      setEditingId(null);
      load();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      // Muestra el mensaje real de la API (p. ej. la regla del rango de fechas).
      setError(apiErrorMessage(err, 'No se pudo guardar el itinerario. Revisa los campos.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteItinerary(id);
      setDeleteId(null);
      load();
    } catch {
      setDeleteId(null);
      setError('No se pudo eliminar el itinerario.');
    }
  };

  // ── Filtrado / paginación ──
  const filtered = items.filter((it) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      it.title.toLowerCase().includes(q) ||
      (it.destinations ?? []).some((d) => d.toLowerCase().includes(q));
    const matchDifficulty = !filterDifficulty || it.difficulty === filterDifficulty;
    return matchSearch && matchDifficulty;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltered = !!search.trim() || !!filterDifficulty;

  // ─────────────────────────── FORM ───────────────────────────
  if (view === 'form') {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <button type="button" onClick={() => { setView('list'); setError(''); setEditingId(null); }}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50">
            ← Volver
          </button>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Icon name="map" className="h-6 w-6 text-emerald-600" />
            {editingId ? t('itineraries.edit') : t('itineraries.addNew')}
          </h1>
          {editingId && <span className="text-sm text-slate-400">ID #{editingId}</span>}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>{t('itineraries.titleField')} *</label>
                  <input value={form.title} required placeholder="Ej. Madrid en 3 días"
                    onChange={(e) => set('title', e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('itineraries.category')}</label>
                  <IconSelect value={form.category} onChange={(v) => set('category', v)}
                    options={categoryOptions} placeholder="— Selecciona categoría —" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>{t('itineraries.difficulty')}</label>
                  <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value as Difficulty)} className={fieldClass}>
                    <option value="Fácil">{t('itineraries.easy')}</option>
                    <option value="Moderado">{t('itineraries.moderate')}</option>
                    <option value="Difícil">{t('itineraries.hard')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('itineraries.duration', 'Duración (días)')}</label>
                  <input type="number" min="0" value={form.duration} placeholder="3"
                    onChange={(e) => set('duration', e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('itineraries.icon', 'Icono')}</label>
                  <IconSelect value={form.image} onChange={(v) => set('image', v)} options={IMAGE_ICONS} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-md">
                <div>
                  <label className={labelClass}>{t('itineraries.startDate')} <span className="font-normal text-slate-400">(opcional)</span></label>
                  <input type="date" value={form.start_date} max={form.end_date || undefined}
                    onChange={(e) => set('start_date', e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('itineraries.endDate')} <span className="font-normal text-slate-400">(opcional)</span></label>
                  <input type="date" value={form.end_date} min={form.start_date || undefined}
                    onChange={(e) => set('end_date', e.target.value)} className={fieldClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('common.description')}</label>
                <textarea value={form.description} rows={3} placeholder="Describe el itinerario…"
                  onChange={(e) => set('description', e.target.value)} className={fieldClass} />
              </div>

              <div className="grid grid-cols-1 gap-5 border-t border-slate-100 pt-5 sm:grid-cols-3">
                <StringList label={t('itineraries.destinations')} items={form.destinations}
                  placeholder="Ej. Madrid" onChange={(v) => set('destinations', v)} />
                <StringList label={t('itineraries.highlights')} items={form.highlights}
                  placeholder="Ej. Museo del Prado" onChange={(v) => set('highlights', v)} />
                <StringList label={t('itineraries.tips', 'Consejos')} items={form.tips}
                  placeholder="Ej. Lleva calzado cómodo" onChange={(v) => set('tips', v)} />
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:max-w-md">
                <div>
                  <label className={labelClass}>Latitud <span className="font-normal text-slate-400">(opcional)</span></label>
                  <input type="number" step="any" value={form.latitude} placeholder="40.4168"
                    onChange={(e) => set('latitude', e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Longitud <span className="font-normal text-slate-400">(opcional)</span></label>
                  <input type="number" step="any" value={form.longitude} placeholder="-3.7038"
                    onChange={(e) => set('longitude', e.target.value)} className={fieldClass} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3 pb-6">
            <button type="button" onClick={() => setForm(EMPTY_FORM())}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
              Limpiar
            </button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
              <Icon name="check" className="h-4 w-4" />
              {saving ? t('common.saving', 'Guardando…') : editingId ? t('common.save') : t('itineraries.add')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─────────────────────────── LISTA ───────────────────────────
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Icon name="map" className="h-6 w-6 text-emerald-600" /> {t('itineraries.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'itinerario' : 'itinerarios'}
            {isFiltered ? ' (filtrados)' : ' en total'}
          </p>
        </div>
        {isAdmin && (
          <button type="button" onClick={startCreate}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:self-auto">
            <Icon name="plus" className="h-4 w-4" /> {t('itineraries.add')}
          </button>
        )}
      </div>

      {success && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por título o destino…"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <select value={filterDifficulty} onChange={(e) => { setFilterDifficulty(e.target.value); setCurrentPage(1); }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-56">
          <option value="">{t('common.all')} — {t('itineraries.difficulty')}</option>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          {t('common.loading', 'Cargando…')}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon name="map" className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {items.length === 0 ? 'Aún no hay itinerarios' : 'Ningún itinerario coincide con el filtro'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{t('itineraries.subtitle')}</p>
          {items.length === 0 && isAdmin && (
            <button type="button" onClick={startCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              <Icon name="plus" className="h-4 w-4" /> {t('itineraries.add')}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t('itineraries.titleField')}</th>
                  <th className="px-4 py-3">{t('itineraries.totalDestinations')}</th>
                  <th className="px-4 py-3">{t('itineraries.duration', 'Duración')}</th>
                  <th className="px-4 py-3">{t('itineraries.category')}</th>
                  <th className="px-4 py-3">{t('itineraries.difficulty')}</th>
                  {isAdmin && <th className="px-4 py-3 text-right">{t('common.actions')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <Icon name={resolveIcon(it.image)} className="h-5 w-5" />
                        </span>
                        <p className="min-w-0 font-medium text-slate-800">{it.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="block max-w-[16rem] truncate">
                        {(it.destinations ?? []).join(', ') || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {it.duration ? `${it.duration} ${it.duration === 1 ? 'día' : 'días'}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{categoryLabel(it.category)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${DIFFICULTY_STYLE[it.difficulty] ?? 'bg-slate-100 text-slate-500'}`}>
                        {it.difficulty}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        {deleteId === it.id ? (
                          <span className="inline-flex items-center gap-2 whitespace-nowrap">
                            <button type="button" onClick={() => handleDelete(it.id)}
                              className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600">
                              {t('common.delete')}
                            </button>
                            <button type="button" onClick={() => setDeleteId(null)}
                              className="text-xs text-slate-500 hover:text-slate-800">{t('common.cancel')}</button>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <button type="button" onClick={() => startEdit(it.id)} title={t('common.edit')}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600">
                              <Icon name="pencil" className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => setDeleteId(it.id)} title={t('common.delete')}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
                              <Icon name="close" className="h-4 w-4" />
                            </button>
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
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

export default Itineraries;
