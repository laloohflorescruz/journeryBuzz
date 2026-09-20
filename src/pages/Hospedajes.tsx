import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import IconSelect from '../components/IconSelect';
import { ImageUploader, GalleryUploader } from '../components/ImageUploader';
import RichTextEditor from '../components/RichTextEditor';
import {
  listAccommodations, createAccommodation, updateAccommodation, deleteAccommodation,
  getAccommodation, AMENITY_FLAGS,
  type Accommodation, type AccommodationPayload, type AmenityFlag,
} from '../services/accommodations';

// CRUD de hospedajes conectado a /accommodations/. Mismo lenguaje visual que
// Tours/POIs: lista sobria + formulario por pestañas.

interface Place { id: number; name: string }

const TYPE_OPTIONS = [
  { value: 'hotel', label: 'Hoteles', icon: 'bed' },
  { value: 'hostel', label: 'Hostales', icon: 'home' },
  { value: 'apartment', label: 'Apartamentos', icon: 'building' },
  { value: 'dorm', label: 'Dormitorios', icon: 'users' },
  { value: 'villa', label: 'Villas', icon: 'star' },
];
const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

// Precios siempre en dólares por defecto (regla del proyecto), pero la moneda
// es un campo del modelo por si un hospedaje cotiza en otra.
const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'DOP', label: 'DOP (RD$)' },
  { value: 'EUR', label: 'EUR (€)' },
];

// Las banderas de la API (snake_case) ↔ claves i18n existentes (camelCase).
const FLAG_I18N: Record<AmenityFlag, string> = {
  pet_friendly: 'petFriendly', sea_view: 'seaView', couples_friendly: 'couplesFriendly',
  private_parking: 'privateParking', private_pool: 'privatePool', free_wifi: 'freeWifi',
  breakfast_included: 'breakfastIncluded', air_conditioning: 'airConditioning', gym: 'gym',
  early_check_in: 'earlyCheckIn', laundry: 'laundry', kitchenette: 'kitchenette',
  jacuzzi: 'jacuzzi', spa: 'spa', balcony: 'balcony', ocean_view: 'oceanView',
  mountain_view: 'mountainView', city_view: 'cityView', fireplace: 'fireplace', hot_tub: 'hotTub',
};

type FormTab = 'general' | 'precio' | 'multimedia' | 'comodidades';
const TABS: { key: FormTab; label: string }[] = [
  { key: 'general', label: '📝 General' },
  { key: 'precio', label: '💰 Precio & capacidad' },
  { key: 'multimedia', label: '🖼️ Multimedia' },
  { key: 'comodidades', label: '🏷️ Comodidades' },
];

const PAGE_SIZE = 10;

const emptyFlags = () =>
  Object.fromEntries(AMENITY_FLAGS.map((f) => [f, false])) as Record<AmenityFlag, boolean>;

const EMPTY_FORM = () => ({
  name: '', slug: '', accommodation_type: 'hotel', description: '',
  location: '', country: '', city_id: '' as number | '',
  latitude: '', longitude: '',
  price_per_night: '', currency: 'USD',
  rating: '', reviews: '', rooms: '1',
  image: '', gallery: [] as string[], amenities: [] as string[],
  is_active: true, is_draft: false,
  ...emptyFlags(),
});
type FormState = ReturnType<typeof EMPTY_FORM>;

const fieldClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';
const labelClass = 'mb-1 block text-xs font-medium text-slate-600';

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, className, ...p }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input {...p} className={`${fieldClass} ${className ?? ''}`} />
  </div>
);

const money = (amount: string, currency: string) =>
  `${currency} ${Number(amount || 0).toLocaleString()}`;

function Hospedajes() {
  const { t } = useTranslation();
  const { user, can } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.profile?.role === 'superadmin';
  // Permisos RBAC: sin ellos la API rechaza la escritura, así que no se ofrece.
  const canCreate = can('accommodation:create');
  const canUpdate = can('accommodation:update');
  const canDelete = can('accommodation:delete');

  const [view, setView] = useState<'list' | 'form'>('list');
  const [items, setItems] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTab, setFormTab] = useState<FormTab>('general');
  const [form, setForm] = useState<FormState>(EMPTY_FORM());

  // País/Ciudad siempre desde la BD, en cascada (regla del proyecto).
  const [countriesDb, setCountriesDb] = useState<Place[]>([]);
  const [citiesDb, setCitiesDb] = useState<Place[]>([]);

  const canEdit = (a: Accommodation) =>
    canUpdate && (isAdmin || a.creator_contact?.id === user?.id);

  // El scoping lo resuelve el servidor: con ?mine=true un proveedor recibe solo
  // los de su empresa y un admin (sin empresa) los recibe todos.
  const load = () => {
    setLoading(true);
    listAccommodations({ mine: true })
      .then((data) => { setItems(data); setError(''); })
      .catch(() => setError('No se pudieron cargar los hospedajes.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get('/countries/').then(({ data }) => setCountriesDb(data)).catch(() => setCountriesDb([]));
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onCountryChange = (name: string) => {
    setForm((f) => ({ ...f, country: name, city_id: '' }));
    setCitiesDb([]);
    const country = countriesDb.find((c) => c.name === name);
    if (country) {
      api.get(`/cities/?country_id=${country.id}`)
        .then(({ data }) => setCitiesDb(data))
        .catch(() => setCitiesDb([]));
    }
  };

  const startCreate = () => {
    setError(''); setSuccess('');
    setForm(EMPTY_FORM());
    setCitiesDb([]);
    setEditingId(null);
    setFormTab('general');
    setView('form');
  };

  const startEdit = async (id: number) => {
    setError(''); setSuccess('');
    try {
      const a = await getAccommodation(id);
      const flags = Object.fromEntries(AMENITY_FLAGS.map((f) => [f, a[f] ?? false])) as Record<AmenityFlag, boolean>;
      const countryName = a.city?.country_name ?? '';
      setForm({
        name: a.name ?? '', slug: a.slug ?? '', accommodation_type: a.accommodation_type || 'hotel',
        description: a.description ?? '', location: a.location ?? '',
        country: countryName, city_id: a.city?.id ?? '',
        latitude: a.latitude ? String(a.latitude) : '', longitude: a.longitude ? String(a.longitude) : '',
        price_per_night: a.price_per_night ?? '', currency: a.currency || 'USD',
        rating: a.rating ? String(a.rating) : '', reviews: a.reviews ? String(a.reviews) : '',
        rooms: String(a.rooms ?? 1),
        image: a.image ?? '', gallery: a.gallery ?? [], amenities: a.amenities ?? [],
        is_active: a.is_active, is_draft: a.is_draft,
        ...flags,
      });
      // Rellena el desplegable de ciudades del país del hospedaje.
      const country = countriesDb.find((c) => c.name === countryName);
      if (country) {
        try {
          const { data } = await api.get(`/cities/?country_id=${country.id}`);
          setCitiesDb(data);
        } catch { setCitiesDb([]); }
      }
      setEditingId(id);
      setFormTab('general');
      setView('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('No se pudo cargar el hospedaje para editar.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.name.trim()) { setFormTab('general'); setError('El nombre es obligatorio.'); return; }
    setSaving(true);
    const payload: AccommodationPayload = {
      name: form.name,
      // Vacío = que lo genere la API a partir del nombre.
      slug: form.slug.trim() || undefined,
      accommodation_type: form.accommodation_type as AccommodationPayload['accommodation_type'],
      description: form.description,
      location: form.location,
      city_id: form.city_id === '' ? null : Number(form.city_id),
      latitude: Number(form.latitude) || 0,
      longitude: Number(form.longitude) || 0,
      price_per_night: form.price_per_night || '0',
      currency: form.currency,
      rating: Number(form.rating) || 0,
      reviews: Number(form.reviews) || 0,
      rooms: Number(form.rooms) || 1,
      image: form.image,
      gallery: form.gallery.filter(Boolean),
      amenities: form.amenities.filter((a) => a.trim()),
      is_active: form.is_active,
      is_draft: form.is_draft,
      ...Object.fromEntries(AMENITY_FLAGS.map((f) => [f, form[f]])),
    };
    try {
      if (editingId) {
        await updateAccommodation(editingId, payload);
        setSuccess('Hospedaje actualizado correctamente.');
      } else {
        await createAccommodation(payload);
        setSuccess('Hospedaje creado correctamente.');
      }
      setView('list');
      setEditingId(null);
      load();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const detail = (err as { response?: { data?: unknown } })?.response?.data;
      setError(typeof detail === 'string' ? detail : 'No se pudo guardar el hospedaje. Revisa los campos.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAccommodation(id);
      setDeleteId(null);
      load();
    } catch {
      setDeleteId(null);
      setError('No se pudo eliminar el hospedaje.');
    }
  };

  // ── Filtrado / paginación ──
  const filtered = items.filter((a) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || (a.location ?? '').toLowerCase().includes(q);
    const matchType = !filterType || a.accommodation_type === filterType;
    return matchSearch && matchType;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltered = !!search.trim() || !!filterType;

  const tabCls = (tab: FormTab) =>
    `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      formTab === tab ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
    }`;

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
            <Icon name="bed" className="h-6 w-6 text-emerald-600" />
            {editingId ? t('hospedajes.edit') : t('hospedajes.addNew')}
          </h1>
          {editingId && <span className="text-sm text-slate-400">ID #{editingId}</span>}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="sticky top-16 z-20 -mx-1 mb-4 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white/90 p-1.5 backdrop-blur">
            {TABS.map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setFormTab(key)} className={tabCls(key)}>{label}</button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* ── GENERAL ── */}
            {formTab === 'general' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label={`${t('common.name')} *`} value={form.name} required
                    placeholder="Ej. Hotel Boutique Zona Colonial"
                    onChange={(e) => set('name', e.target.value)} />
                  <div>
                    <label className={labelClass}>Dirección en el portal (slug)</label>
                    <input
                      value={form.slug}
                      onChange={(e) => set('slug', e.target.value)}
                      placeholder="hotel-boutique-zona-colonial"
                      className={fieldClass}
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      /hospedaje/<span className="font-medium text-slate-500">{form.slug || 'se-genera-del-nombre'}</span>
                      {' '}— si lo dejas vacío se crea solo y se numera si ya existe.
                    </p>
                  </div>
                  <div>
                    <label className={labelClass}>{t('common.type')}</label>
                    <IconSelect value={form.accommodation_type} onChange={(v) => set('accommodation_type', v)}
                      options={TYPE_OPTIONS} />
                  </div>
                </div>

                <RichTextEditor label={t('common.description')} value={form.description}
                  onChange={(html) => set('description', html)}
                  placeholder="Describe el hospedaje: qué lo hace especial, para quién es ideal…" />

                {/* País/Ciudad desde la BD, en cascada */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>País</label>
                    <select value={form.country} onChange={(e) => onCountryChange(e.target.value)} className={fieldClass}>
                      <option value="">— Selecciona país —</option>
                      {countriesDb.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Ciudad</label>
                    <select value={form.city_id} disabled={!form.country}
                      onChange={(e) => set('city_id', e.target.value ? Number(e.target.value) : '')}
                      className={`${fieldClass} disabled:bg-slate-50 disabled:text-slate-400`}>
                      <option value="">{form.country ? '— Selecciona ciudad —' : 'Selecciona un país primero'}</option>
                      {citiesDb.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <Input label={t('common.location')} value={form.location}
                  placeholder="Ej. Calle El Conde #12, Zona Colonial"
                  onChange={(e) => set('location', e.target.value)} />

                <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                  <Input label={t('hospedajes.latitude')} type="number" step="any" value={form.latitude}
                    placeholder="18.4861" onChange={(e) => set('latitude', e.target.value)} />
                  <Input label={t('hospedajes.longitude')} type="number" step="any" value={form.longitude}
                    placeholder="-69.9312" onChange={(e) => set('longitude', e.target.value)} />
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={form.is_active}
                      onChange={(e) => set('is_active', e.target.checked)} className="h-4 w-4 accent-emerald-600" />
                    <span className="text-sm font-medium text-slate-600">{t('common.active')}</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={form.is_draft}
                      onChange={(e) => set('is_draft', e.target.checked)} className="h-4 w-4 accent-amber-500" />
                    <span className="text-sm font-medium text-slate-600">Borrador</span>
                    <span className="text-xs text-slate-400">(no se muestra en el sitio público)</span>
                  </label>
                </div>
              </div>
            )}

            {/* ── PRECIO & CAPACIDAD ── */}
            {formTab === 'precio' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input label={t('hospedajes.pricePerNight')} type="number" min="0" step="0.01"
                    value={form.price_per_night} placeholder="0.00"
                    onChange={(e) => set('price_per_night', e.target.value)} />
                  <div>
                    <label className={labelClass}>Moneda</label>
                    <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className={fieldClass}>
                      {CURRENCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <Input label={t('hospedajes.rooms')} type="number" min="1" value={form.rooms}
                    onChange={(e) => set('rooms', e.target.value)} />
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-md">
                    <div>
                      <Input label={`${t('common.rating')} (0–5)`} type="number" min="0" max="5" step="0.1"
                        value={form.rating} placeholder="0.0" onChange={(e) => set('rating', e.target.value)} />
                      <div className="mt-2 flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Icon key={i} name="star"
                            className={`h-4 w-4 ${i < (Number(form.rating) || 0) ? 'text-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    <Input label={t('common.reviews')} type="number" min="0" value={form.reviews}
                      placeholder="0" onChange={(e) => set('reviews', e.target.value)} />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Calificación y nº de reseñas son informativos; el módulo de reseñas los calculará más adelante.
                  </p>
                </div>
              </div>
            )}

            {/* ── MULTIMEDIA ── */}
            {formTab === 'multimedia' && (
              <div className="space-y-5">
                <ImageUploader label="Imagen principal" value={form.image} folder="accommodations"
                  onChange={(url) => set('image', url)} />
                <div>
                  <label className={labelClass}>Galería de fotos</label>
                  <GalleryUploader items={form.gallery} folder="accommodations"
                    onChange={(urls) => set('gallery', urls)} />
                </div>
              </div>
            )}

            {/* ── COMODIDADES ── */}
            {formTab === 'comodidades' && (
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Servicios <span className="font-normal text-slate-400">(texto libre)</span></label>
                  <div className="space-y-2">
                    {form.amenities.map((a, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={a} className={fieldClass} placeholder="Ej. Recepción 24h"
                          onChange={(e) => set('amenities', form.amenities.map((x, j) => (j === i ? e.target.value : x)))} />
                        <button type="button" onClick={() => set('amenities', form.amenities.filter((_, j) => j !== i))}
                          className="rounded-lg px-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
                          <Icon name="close" className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => set('amenities', [...form.amenities, ''])}
                      className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                      <Icon name="plus" className="h-4 w-4" /> {t('common.add')}
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <label className="mb-2 block text-xs font-medium text-slate-600">Comodidades</label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITY_FLAGS.map((flag) => {
                      const active = form[flag];
                      return (
                        <button key={flag} type="button" onClick={() => set(flag, !active)}
                          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                            active
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300 bg-white text-slate-600 hover:border-emerald-400'
                          }`}>
                          {t(`hospedajes.${FLAG_I18N[flag]}`)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-end gap-3 pb-6">
            <button type="button" onClick={() => { setForm(EMPTY_FORM()); setCitiesDb([]); setFormTab('general'); }}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
              Limpiar
            </button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
              <Icon name="check" className="h-4 w-4" />
              {saving ? t('common.saving', 'Guardando…') : editingId ? t('common.save') : t('hospedajes.add')}
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
            <Icon name="bed" className="h-6 w-6 text-emerald-600" /> {t('hospedajes.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'hospedaje' : 'hospedajes'}
            {isFiltered ? ' (filtrados)' : ' en total'}
          </p>
        </div>
        {canCreate && (
        <button type="button" onClick={startCreate}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:self-auto">
          <Icon name="plus" className="h-4 w-4" /> {t('hospedajes.add')}
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
            placeholder="Buscar por nombre o ubicación…"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <IconSelect value={filterType} onChange={(v) => { setFilterType(v); setCurrentPage(1); }}
          placeholder={t('hospedajes.filterAll')} className="sm:w-56"
          options={[{ value: '', label: t('hospedajes.filterAll') }, ...TYPE_OPTIONS]} />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          {t('common.loading', 'Cargando…')}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon name="bed" className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {items.length === 0 ? 'Aún no has creado hospedajes' : 'Ningún hospedaje coincide con el filtro'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{t('hospedajes.subtitle')}</p>
          {items.length === 0 && canCreate && (
            <button type="button" onClick={startCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              <Icon name="plus" className="h-4 w-4" /> {t('hospedajes.add')}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t('common.name')}</th>
                  <th className="px-4 py-3">{t('common.type')}</th>
                  <th className="px-4 py-3">{t('common.location')}</th>
                  <th className="px-4 py-3">{t('hospedajes.priceNight')}</th>
                  <th className="px-4 py-3">{t('common.rating')}</th>
                  <th className="px-4 py-3">{t('common.status')}</th>
                  <th className="px-4 py-3 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {a.image && <img src={a.image} alt="" className="h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800">{a.name}</p>
                          {a.city && <p className="truncate text-xs text-slate-400">{a.city.name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{TYPE_LABEL[a.accommodation_type] || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="block max-w-[14rem] truncate">{a.location || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{money(a.price_per_night, a.currency)}</td>
                    <td className="px-4 py-3">
                      {a.rating
                        ? <span className="font-semibold text-amber-500">★ {Number(a.rating).toFixed(1)}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${a.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {a.is_active ? t('common.active') : t('common.inactive')}
                        </span>
                        {a.is_draft && (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">Borrador</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {deleteId === a.id ? (
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <button type="button" onClick={() => handleDelete(a.id)}
                            className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600">
                            {t('common.delete')}
                          </button>
                          <button type="button" onClick={() => setDeleteId(null)}
                            className="text-xs text-slate-500 hover:text-slate-800">{t('common.cancel')}</button>
                        </span>
                      ) : canEdit(a) ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <button type="button" onClick={() => startEdit(a.id)} title={t('common.edit')}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600">
                            <Icon name="pencil" className="h-4 w-4" />
                          </button>
                          {canDelete && (
                          <button type="button" onClick={() => setDeleteId(a.id)} title={t('common.delete')}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
                            <Icon name="close" className="h-4 w-4" />
                          </button>
                          )}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400" title="Sin permiso o no eres el creador">Solo lectura</span>
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

export default Hospedajes;
