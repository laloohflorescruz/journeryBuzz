import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import IconSelect from '../components/IconSelect';
import { ImageUploader, GalleryUploader } from '../components/ImageUploader';
import {
  listVehicles, createVehicle, updateVehicle, deleteVehicle, getVehicle,
  type Vehicle, type VehiclePayload,
} from '../services/vehicles';

// CRUD de la flota de alquiler, conectado a /vehicles/. Mismo lenguaje visual
// que Tours/POIs/Hospedajes: lista sobria + formulario por pestañas.

interface Place { id: number; name: string }

const CATEGORY_OPTIONS = [
  { value: 'economy', label: 'Económico', icon: 'car' },
  { value: 'premium', label: 'Premium', icon: 'star' },
];
const TRANSMISSION_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automático' },
];
const FUEL_OPTIONS = [
  { value: 'gasoline', label: 'Gasolina' },
  { value: 'diesel', label: 'Diésel' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'electric', label: 'Eléctrico' },
];
// Carrocerías sugeridas; el campo es texto libre (no hay catálogo cerrado).
const TYPE_SUGGESTIONS = ['Compacto', 'Sedán', 'SUV', 'Pickup', 'Minivan', 'Convertible', 'Jeep'];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'DOP', label: 'DOP (RD$)' },
  { value: 'EUR', label: 'EUR (€)' },
];

const label = (opts: { value: string; label: string }[], v: string) =>
  opts.find((o) => o.value === v)?.label ?? '—';

type FormTab = 'general' | 'ficha' | 'multimedia' | 'equipamiento';
const TABS: { key: FormTab; label: string }[] = [
  { key: 'general', label: '📝 General' },
  { key: 'ficha', label: '⚙️ Ficha técnica' },
  { key: 'multimedia', label: '🖼️ Multimedia' },
  { key: 'equipamiento', label: '🏷️ Equipamiento' },
];

const PAGE_SIZE = 10;

const EMPTY_FORM = () => ({
  name: '', vehicle_type: '', category: 'economy', transmission: 'manual', fuel: 'gasoline',
  seats: '5', doors: '4', year: '', color: '', consumption: '',
  price_per_day: '', currency: 'USD',
  image: '', gallery: [] as string[], features: [] as string[],
  location: '', country: '', city_id: '' as number | '',
  rating: '', reviews: '',
  is_active: true, is_draft: false,
});
type FormState = ReturnType<typeof EMPTY_FORM>;

const fieldClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';
const labelClass = 'mb-1 block text-xs font-medium text-slate-600';

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label: l, className, ...p }) => (
  <div>
    <label className={labelClass}>{l}</label>
    <input {...p} className={`${fieldClass} ${className ?? ''}`} />
  </div>
);

const money = (amount: string, currency: string) =>
  `${currency} ${Number(amount || 0).toLocaleString()}`;

function RentACar() {
  const { t } = useTranslation();
  const { user, can } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.profile?.role === 'superadmin';
  // Permisos RBAC: sin ellos la API rechaza la escritura, así que no se ofrece.
  const canCreate = can('vehicle:create');
  const canUpdate = can('vehicle:update');
  const canDelete = can('vehicle:delete');

  const [view, setView] = useState<'list' | 'form'>('list');
  const [items, setItems] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTab, setFormTab] = useState<FormTab>('general');
  const [form, setForm] = useState<FormState>(EMPTY_FORM());

  // País/Ciudad siempre desde la BD, en cascada (regla del proyecto).
  const [countriesDb, setCountriesDb] = useState<Place[]>([]);
  const [citiesDb, setCitiesDb] = useState<Place[]>([]);

  const canEdit = (v: Vehicle) =>
    canUpdate && (isAdmin || v.creator_contact?.id === user?.id);

  // El scoping lo resuelve el servidor: con ?mine=true un proveedor recibe solo
  // su flota y un admin (sin empresa) la recibe toda.
  const load = () => {
    setLoading(true);
    listVehicles({ mine: true })
      .then((data) => { setItems(data); setError(''); })
      .catch(() => setError('No se pudieron cargar los vehículos.'))
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
      const v = await getVehicle(id);
      const countryName = v.city?.country_name ?? '';
      setForm({
        name: v.name ?? '', vehicle_type: v.vehicle_type ?? '',
        category: v.category || 'economy', transmission: v.transmission || 'manual',
        fuel: v.fuel || 'gasoline',
        seats: String(v.seats ?? 5), doors: String(v.doors ?? 4),
        year: v.year ? String(v.year) : '', color: v.color ?? '', consumption: v.consumption ?? '',
        price_per_day: v.price_per_day ?? '', currency: v.currency || 'USD',
        image: v.image ?? '', gallery: v.gallery ?? [], features: v.features ?? [],
        location: v.location ?? '', country: countryName, city_id: v.city?.id ?? '',
        rating: v.rating ? String(v.rating) : '', reviews: v.reviews ? String(v.reviews) : '',
        is_active: v.is_active, is_draft: v.is_draft,
      });
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
      setError('No se pudo cargar el vehículo para editar.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.name.trim()) { setFormTab('general'); setError('El nombre del vehículo es obligatorio.'); return; }
    setSaving(true);
    const payload: VehiclePayload = {
      name: form.name,
      vehicle_type: form.vehicle_type,
      category: form.category as VehiclePayload['category'],
      transmission: form.transmission as VehiclePayload['transmission'],
      fuel: form.fuel as VehiclePayload['fuel'],
      seats: Number(form.seats) || 1,
      doors: Number(form.doors) || 2,
      year: form.year ? Number(form.year) : null,
      color: form.color,
      consumption: form.consumption,
      price_per_day: form.price_per_day || '0',
      currency: form.currency,
      image: form.image,
      gallery: form.gallery.filter(Boolean),
      features: form.features.filter((f) => f.trim()),
      location: form.location,
      city_id: form.city_id === '' ? null : Number(form.city_id),
      rating: Number(form.rating) || 0,
      reviews: Number(form.reviews) || 0,
      is_active: form.is_active,
      is_draft: form.is_draft,
    };
    try {
      if (editingId) {
        await updateVehicle(editingId, payload);
        setSuccess('Vehículo actualizado correctamente.');
      } else {
        await createVehicle(payload);
        setSuccess('Vehículo creado correctamente.');
      }
      setView('list');
      setEditingId(null);
      load();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const detail = (err as { response?: { data?: unknown } })?.response?.data;
      setError(typeof detail === 'string' ? detail : 'No se pudo guardar el vehículo. Revisa los campos.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteVehicle(id);
      setDeleteId(null);
      load();
    } catch {
      setDeleteId(null);
      setError('No se pudo eliminar el vehículo.');
    }
  };

  // ── Filtrado / paginación ──
  const filtered = items.filter((v) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      v.name.toLowerCase().includes(q) ||
      (v.vehicle_type ?? '').toLowerCase().includes(q) ||
      (v.location ?? '').toLowerCase().includes(q);
    const matchCat = !filterCategory || v.category === filterCategory;
    return matchSearch && matchCat;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltered = !!search.trim() || !!filterCategory;

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
            <Icon name="car" className="h-6 w-6 text-emerald-600" />
            {editingId ? t('rentacar.edit') : t('rentacar.addNew')}
          </h1>
          {editingId && <span className="text-sm text-slate-400">ID #{editingId}</span>}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="sticky top-16 z-20 -mx-1 mb-4 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white/90 p-1.5 backdrop-blur">
            {TABS.map(({ key, label: l }) => (
              <button key={key} type="button" onClick={() => setFormTab(key)} className={tabCls(key)}>{l}</button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* ── GENERAL ── */}
            {formTab === 'general' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label={`${t('common.name')} *`} value={form.name} required
                    placeholder="Ej. Toyota Corolla 2023"
                    onChange={(e) => set('name', e.target.value)} />
                  <div>
                    <label className={labelClass}>{t('rentacar.category')}</label>
                    <IconSelect value={form.category} onChange={(v) => set('category', v)}
                      options={CATEGORY_OPTIONS} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    {t('rentacar.vehicleType')} <span className="font-normal text-slate-400">(texto libre)</span>
                  </label>
                  <input value={form.vehicle_type} className={fieldClass} placeholder="Ej. SUV"
                    list="vehicle-type-suggestions"
                    onChange={(e) => set('vehicle_type', e.target.value)} />
                  <datalist id="vehicle-type-suggestions">
                    {TYPE_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
                  </datalist>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input label={t('rentacar.pricePerDay')} type="number" min="0" step="0.01"
                    value={form.price_per_day} placeholder="0.00"
                    onChange={(e) => set('price_per_day', e.target.value)} />
                  <div>
                    <label className={labelClass}>Moneda</label>
                    <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className={fieldClass}>
                      {CURRENCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <Input label={t('rentacar.year')} type="number" min="1950" max="2100"
                    value={form.year} placeholder="2023"
                    onChange={(e) => set('year', e.target.value)} />
                </div>

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

                <Input label={`${t('common.location')} (punto de recogida)`} value={form.location}
                  placeholder="Ej. Aeropuerto Las Américas, Terminal A"
                  onChange={(e) => set('location', e.target.value)} />

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

            {/* ── FICHA TÉCNICA ── */}
            {formTab === 'ficha' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>{t('rentacar.transmission')}</label>
                    <select value={form.transmission} onChange={(e) => set('transmission', e.target.value)} className={fieldClass}>
                      {TRANSMISSION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('rentacar.fuel')}</label>
                    <select value={form.fuel} onChange={(e) => set('fuel', e.target.value)} className={fieldClass}>
                      {FUEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Input label={t('rentacar.seats')} type="number" min="1" value={form.seats}
                    onChange={(e) => set('seats', e.target.value)} />
                  <Input label={t('rentacar.doors')} type="number" min="1" value={form.doors}
                    onChange={(e) => set('doors', e.target.value)} />
                  <Input label={t('rentacar.color')} value={form.color} placeholder="Blanco"
                    onChange={(e) => set('color', e.target.value)} />
                  <Input label={t('rentacar.consumption')} value={form.consumption} placeholder="6.5 L/100km"
                    onChange={(e) => set('consumption', e.target.value)} />
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <div className="grid grid-cols-1 gap-4 sm:max-w-md sm:grid-cols-2">
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
                <ImageUploader label="Imagen principal" value={form.image} folder="vehicles"
                  onChange={(url) => set('image', url)} />
                <div>
                  <label className={labelClass}>Galería de fotos</label>
                  <GalleryUploader items={form.gallery} folder="vehicles"
                    onChange={(urls) => set('gallery', urls)} />
                </div>
              </div>
            )}

            {/* ── EQUIPAMIENTO ── */}
            {formTab === 'equipamiento' && (
              <div className="space-y-2">
                <label className={labelClass}>
                  {t('rentacar.features')} <span className="font-normal text-slate-400">(uno por línea)</span>
                </label>
                {form.features.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={f} className={fieldClass} placeholder="Ej. Aire acondicionado, GPS, Bluetooth"
                      onChange={(e) => set('features', form.features.map((x, j) => (j === i ? e.target.value : x)))} />
                    <button type="button" onClick={() => set('features', form.features.filter((_, j) => j !== i))}
                      className="rounded-lg px-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
                      <Icon name="close" className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => set('features', [...form.features, ''])}
                  className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                  <Icon name="plus" className="h-4 w-4" /> {t('common.add')}
                </button>
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
              {saving ? t('common.saving', 'Guardando…') : editingId ? t('common.save') : t('rentacar.add')}
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
            <Icon name="car" className="h-6 w-6 text-emerald-600" /> {t('rentacar.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'vehículo' : 'vehículos'}
            {isFiltered ? ' (filtrados)' : ' en total'}
          </p>
        </div>
        {canCreate && (
        <button type="button" onClick={startCreate}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:self-auto">
          <Icon name="plus" className="h-4 w-4" /> {t('rentacar.add')}
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
            placeholder="Buscar por nombre, carrocería o ubicación…"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <IconSelect value={filterCategory} onChange={(v) => { setFilterCategory(v); setCurrentPage(1); }}
          placeholder={t('rentacar.filterAll')} className="sm:w-56"
          options={[{ value: '', label: t('rentacar.filterAll') }, ...CATEGORY_OPTIONS]} />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          {t('common.loading', 'Cargando…')}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon name="car" className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {items.length === 0 ? 'Aún no has agregado vehículos' : 'Ningún vehículo coincide con el filtro'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{t('rentacar.subtitle')}</p>
          {items.length === 0 && canCreate && (
            <button type="button" onClick={startCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              <Icon name="plus" className="h-4 w-4" /> {t('rentacar.add')}
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
                  <th className="px-4 py-3">{t('rentacar.category')}</th>
                  <th className="px-4 py-3">{t('rentacar.transmission')}</th>
                  <th className="px-4 py-3 text-center">{t('rentacar.seats')}</th>
                  <th className="px-4 py-3">{t('rentacar.priceDay')}</th>
                  <th className="px-4 py-3">{t('common.status')}</th>
                  <th className="px-4 py-3 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {v.image && <img src={v.image} alt="" className="h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800">{v.name}</p>
                          <p className="truncate text-xs text-slate-400">
                            {[v.vehicle_type, v.year].filter(Boolean).join(' · ') || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {v.category
                        ? <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${v.category === 'premium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                            {label(CATEGORY_OPTIONS, v.category)}
                          </span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{v.transmission ? label(TRANSMISSION_OPTIONS, v.transmission) : '—'}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{v.seats}</td>
                    <td className="px-4 py-3 text-slate-700">{money(v.price_per_day, v.currency)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${v.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {v.is_active ? t('common.active') : t('common.inactive')}
                        </span>
                        {v.is_draft && (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">Borrador</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {deleteId === v.id ? (
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <button type="button" onClick={() => handleDelete(v.id)}
                            className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600">
                            {t('common.delete')}
                          </button>
                          <button type="button" onClick={() => setDeleteId(null)}
                            className="text-xs text-slate-500 hover:text-slate-800">{t('common.cancel')}</button>
                        </span>
                      ) : canEdit(v) ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <button type="button" onClick={() => startEdit(v.id)} title={t('common.edit')}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600">
                            <Icon name="pencil" className="h-4 w-4" />
                          </button>
                          {canDelete && (
                          <button type="button" onClick={() => setDeleteId(v.id)} title={t('common.delete')}
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

export default RentACar;
